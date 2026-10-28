package com.smartdelivery.allocation;

import com.smartdelivery.document.Order;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.document.Warehouse;
import com.smartdelivery.dto.PatternExecutionEvent;
import com.smartdelivery.factory.BikeFactory;
import com.smartdelivery.factory.TruckFactory;
import com.smartdelivery.factory.VanFactory;
import com.smartdelivery.factory.VehicleFactoryResolver;
import com.smartdelivery.repository.DeliveryPlanRepository;
import com.smartdelivery.repository.OrderRepository;
import com.smartdelivery.repository.VehicleRepository;
import com.smartdelivery.repository.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTraceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private WarehouseRepository warehouseRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private DeliveryPlanRepository planRepository;

    private VehicleFactoryResolver factoryResolver;
    private DistanceCalculator distanceCalculator;
    private CostCalculator costCalculator;
    private AllocationScorer scorer;
    private AllocationService allocationService;

    @BeforeEach
    void setUp() {
        factoryResolver = new VehicleFactoryResolver(new BikeFactory(), new VanFactory(), new TruckFactory());
        distanceCalculator = new DistanceCalculator();
        costCalculator = new CostCalculator();
        scorer = new AllocationScorer();
        allocationService = new AllocationService(
                orderRepository, warehouseRepository, vehicleRepository, planRepository,
                factoryResolver, distanceCalculator, costCalculator, scorer
        );
    }

    @Test
    void testExecutionTraceOrderAndPatterns() {
        // Prepare order
        Order order = new Order();
        order.setId("order-101");
        order.setDestination("Chennai Central");
        order.setDestinationLatitude(13.0827);
        order.setDestinationLongitude(80.2707);
        order.setPackageWeight(15.0); // 15kg exceeds Bike (10kg) but fits Van (50kg)
        order.setPackageType(Order.PackageType.STANDARD);
        order.setPriority(Order.Priority.HIGH);
        order.setExpressDelivery(true);
        order.setInsurance(false);

        // Prepare warehouse
        Warehouse warehouse = new Warehouse();
        warehouse.setId("wh-1");
        warehouse.setName("Chennai Hub");
        warehouse.setLatitude(13.0000);
        warehouse.setLongitude(80.2000);
        warehouse.setActive(true);

        // Prepare vehicles: Bike (10kg) and Van (50kg)
        VehicleDocument bikeDoc = new VehicleDocument();
        bikeDoc.setId("v-bike");
        bikeDoc.setType("BIKE");
        bikeDoc.setCapacity(10.0);
        bikeDoc.setCostPerKm(8.0);
        bikeDoc.setAvailable(true);
        bikeDoc.setSupportsFragile(true);

        VehicleDocument vanDoc = new VehicleDocument();
        vanDoc.setId("v-van");
        vanDoc.setType("VAN");
        vanDoc.setCapacity(50.0);
        vanDoc.setCostPerKm(15.0);
        vanDoc.setAvailable(true);
        vanDoc.setSupportsFragile(true);

        when(orderRepository.findById("order-101")).thenReturn(Optional.of(order));
        when(warehouseRepository.findByActiveTrue()).thenReturn(List.of(warehouse));
        when(vehicleRepository.findByAvailableTrue()).thenReturn(List.of(bikeDoc, vanDoc));

        Map<String, Object> result = allocationService.allocateOrder("order-101");

        assertNotNull(result.get("recommendedPlan"));
        assertNotNull(result.get("executionTrace"));

        @SuppressWarnings("unchecked")
        List<PatternExecutionEvent> trace = (List<PatternExecutionEvent>) result.get("executionTrace");
        assertFalse(trace.isEmpty());

        // Verify sequence is strictly monotonic
        for (int i = 0; i < trace.size(); i++) {
            assertEquals(i + 1, trace.get(i).getSequence());
        }

        // Verify Factory events
        assertTrue(trace.stream().anyMatch(e -> "FACTORY".equals(e.getPhase()) && "FACTORY_RESOLVED".equals(e.getEventType())));
        assertTrue(trace.stream().anyMatch(e -> "FACTORY".equals(e.getPhase()) && "VEHICLE_CREATED".equals(e.getEventType())));
        
        // Verify Bike rejection due to capacity constraint
        PatternExecutionEvent bikeRejection = trace.stream()
                .filter(e -> "BIKE".equals(e.getVehicleType()) && "REJECTED".equals(e.getStatus()))
                .findFirst()
                .orElse(null);
        assertNotNull(bikeRejection, "Bike must be rejected due to capacity");
        assertTrue(bikeRejection.getRejectionReason().contains("capacity"));

        // Verify Winner is selected
        assertTrue(trace.stream().anyMatch(e -> "WINNER_SELECTED".equals(e.getEventType())));

        // Verify Builder events
        assertTrue(trace.stream().anyMatch(e -> "BUILDER".equals(e.getPhase()) && "BUILDER_INIT".equals(e.getEventType())));
        assertTrue(trace.stream().anyMatch(e -> "BUILDER".equals(e.getPhase()) && "BUILD_COMPLETE".equals(e.getEventType())));
        assertTrue(trace.stream().anyMatch(e -> "BUILDER".equals(e.getPhase()) && "PERSIST_COMPLETE".equals(e.getEventType())));
    }

    @Test
    void testBikeRejectedWhenDistanceExceedsMaxRange() {
        // Prepare order: lightweight (5kg) but far away (approx 78km)
        Order order = new Order();
        order.setId("order-202");
        order.setDestination("Distant Depot");
        order.setDestinationLatitude(13.7000);
        order.setDestinationLongitude(80.2000);
        order.setPackageWeight(5.0); // 5kg is well within Bike's 10kg capacity
        order.setPackageType(Order.PackageType.STANDARD);
        order.setPriority(Order.Priority.NORMAL);

        Warehouse warehouse = new Warehouse();
        warehouse.setId("wh-1");
        warehouse.setName("Chennai Hub");
        warehouse.setLatitude(13.0000);
        warehouse.setLongitude(80.2000);
        warehouse.setActive(true);

        VehicleDocument bikeDoc = new VehicleDocument();
        bikeDoc.setId("v-bike");
        bikeDoc.setType("BIKE");
        bikeDoc.setCapacity(10.0);
        bikeDoc.setCostPerKm(8.0);
        bikeDoc.setAvailable(true);
        bikeDoc.setSupportsFragile(true);
        bikeDoc.setMaxRange(50.0);

        VehicleDocument vanDoc = new VehicleDocument();
        vanDoc.setId("v-van");
        vanDoc.setType("VAN");
        vanDoc.setCapacity(50.0);
        vanDoc.setCostPerKm(15.0);
        vanDoc.setAvailable(true);
        vanDoc.setSupportsFragile(true);
        vanDoc.setMaxRange(300.0);

        when(orderRepository.findById("order-202")).thenReturn(Optional.of(order));
        when(warehouseRepository.findByActiveTrue()).thenReturn(List.of(warehouse));
        when(vehicleRepository.findByAvailableTrue()).thenReturn(List.of(bikeDoc, vanDoc));

        Map<String, Object> result = allocationService.allocateOrder("order-202");

        @SuppressWarnings("unchecked")
        List<PatternExecutionEvent> trace = (List<PatternExecutionEvent>) result.get("executionTrace");
        assertNotNull(trace);

        // Verify Bike rejection specifically due to max range
        PatternExecutionEvent bikeRejection = trace.stream()
                .filter(e -> "BIKE".equals(e.getVehicleType()) && "REJECTED".equals(e.getStatus()))
                .findFirst()
                .orElse(null);
        assertNotNull(bikeRejection, "Bike must be rejected due to distance range limit");
        assertTrue(bikeRejection.getRejectionReason().toLowerCase().contains("range") || bikeRejection.getRejectionReason().toLowerCase().contains("distance"));

        // Verify Van was allocated successfully
        AllocationCandidate winner = (AllocationCandidate) result.get("recommendedPlan");
        assertNotNull(winner);
        assertEquals("VAN", winner.getVehicle().getType());
    }
}

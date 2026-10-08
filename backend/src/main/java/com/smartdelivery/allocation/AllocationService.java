package com.smartdelivery.allocation;

import com.smartdelivery.builder.DeliveryPlan;
import com.smartdelivery.document.Order;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.document.Warehouse;
import com.smartdelivery.document.DeliveryPlanDocument;
import com.smartdelivery.factory.VehicleFactoryResolver;
import com.smartdelivery.repository.DeliveryPlanRepository;
import com.smartdelivery.repository.OrderRepository;
import com.smartdelivery.repository.VehicleRepository;
import com.smartdelivery.repository.WarehouseRepository;
import com.smartdelivery.vehicle.DeliveryVehicle;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AllocationService {
    private final OrderRepository orderRepository;
    private final WarehouseRepository warehouseRepository;
    private final VehicleRepository vehicleRepository;
    private final DeliveryPlanRepository planRepository;
    private final VehicleFactoryResolver factoryResolver;
    private final DistanceCalculator distanceCalculator;
    private final CostCalculator costCalculator;
    private final AllocationScorer scorer;

    public AllocationService(OrderRepository orderRepository, WarehouseRepository warehouseRepository,
                             VehicleRepository vehicleRepository, DeliveryPlanRepository planRepository,
                             VehicleFactoryResolver factoryResolver, DistanceCalculator distanceCalculator,
                             CostCalculator costCalculator, AllocationScorer scorer) {
        this.orderRepository = orderRepository;
        this.warehouseRepository = warehouseRepository;
        this.vehicleRepository = vehicleRepository;
        this.planRepository = planRepository;
        this.factoryResolver = factoryResolver;
        this.distanceCalculator = distanceCalculator;
        this.costCalculator = costCalculator;
        this.scorer = scorer;
    }

    public Map<String, Object> allocateOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<Warehouse> warehouses = warehouseRepository.findByActiveTrue();
        List<VehicleDocument> vehicleDocs = vehicleRepository.findByAvailableTrue();
        
        List<AllocationCandidate> candidates = new ArrayList<>();

        for (Warehouse warehouse : warehouses) {
            double distance = distanceCalculator.calculateDistance(warehouse.getLatitude(), warehouse.getLongitude(),
                    order.getDestinationLatitude(), order.getDestinationLongitude());

            for (VehicleDocument vDoc : vehicleDocs) {
                DeliveryVehicle vehicle = factoryResolver.getFactory(vDoc.getType()).createVehicle(vDoc);
                
                // Capacity validation
                if (vehicle.getCapacity() < order.getPackageWeight()) continue;
                
                // Package compatibility validation
                if (order.getPackageType() == Order.PackageType.FRAGILE && !vehicle.supportsFragile()) continue;

                double cost = costCalculator.calculateCost(distance, vehicle, order.isExpressDelivery(), order.isInsurance(), order.getPackageType() == Order.PackageType.FRAGILE);
                int time = vehicle.getDeliveryTime() + (int)(distance * 2); // 2 min per km approx addition

                AllocationCandidate candidate = new AllocationCandidate();
                candidate.setWarehouse(warehouse);
                candidate.setVehicle(vehicle);
                candidate.setDistance(distance);
                candidate.setEstimatedCost(cost);
                candidate.setEstimatedTime(time);
                
                scorer.scoreCandidate(candidate, order);
                candidates.add(candidate);
            }
        }

        if (candidates.isEmpty()) {
            throw new RuntimeException("No suitable allocation found");
        }

        candidates.sort((c1, c2) -> Double.compare(c2.getFinalScore(), c1.getFinalScore()));
        
        AllocationCandidate bestCandidate = candidates.get(0);
        
        DeliveryPlan plan = new DeliveryPlan.Builder()
                .order(order)
                .warehouse(bestCandidate.getWarehouse())
                .vehicle(bestCandidate.getVehicle())
                .priority(order.getPriority().name())
                .distance(bestCandidate.getDistance())
                .estimatedCost(bestCandidate.getEstimatedCost())
                .estimatedTime(bestCandidate.getEstimatedTime())
                .allocationScore(bestCandidate.getFinalScore())
                .fragileHandling(order.getPackageType() == Order.PackageType.FRAGILE)
                .insurance(order.isInsurance())
                .expressDelivery(order.isExpressDelivery())
                .reason("Best balance of distance, cost, capacity and priority")
                .build();
                
        // Persist
        DeliveryPlanDocument doc = new DeliveryPlanDocument();
        doc.setOrderId(order.getId());
        doc.setWarehouseId(bestCandidate.getWarehouse().getId());
        doc.setWarehouseName(bestCandidate.getWarehouse().getName());
        doc.setVehicleType(bestCandidate.getVehicle().getType());
        doc.setDistance(bestCandidate.getDistance());
        doc.setEstimatedCost(bestCandidate.getEstimatedCost());
        doc.setEstimatedTime(bestCandidate.getEstimatedTime());
        doc.setAllocationScore(bestCandidate.getFinalScore());
        planRepository.save(doc);
        
        order.setStatus(Order.Status.ALLOCATED);
        orderRepository.save(order);

        List<AllocationCandidate> alternatives = candidates.subList(1, Math.min(candidates.size(), 4));
        
        return Map.of(
            "recommendedPlan", bestCandidate,
            "alternatives", alternatives
        );
    }
}

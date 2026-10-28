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
        return allocateOrder(orderId, null);
    }

    public Map<String, Object> allocateOrder(String orderId, String requestedStrategy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<Warehouse> warehouses = warehouseRepository.findByActiveTrue();
        List<VehicleDocument> vehicleDocs = vehicleRepository.findByAvailableTrue();
        
        List<AllocationCandidate> candidates = new ArrayList<>();
        List<com.smartdelivery.dto.PatternExecutionEvent> executionTrace = new ArrayList<>();
        int seq = 1;

        // Record Order Evaluation Started
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("FACTORY")
                .eventType("ORDER_RECEIVED")
                .message("Order received: Weight " + order.getPackageWeight() + "kg, Type " + order.getPackageType() + ", Priority " + order.getPriority())
                .status("INFO")
                .details(Map.of(
                        "orderId", order.getId(),
                        "weight", order.getPackageWeight(),
                        "packageType", order.getPackageType().name(),
                        "priority", order.getPriority().name(),
                        "express", order.isExpressDelivery(),
                        "insurance", order.isInsurance()
                ))
                .build());

        for (Warehouse warehouse : warehouses) {
            double distance = distanceCalculator.calculateDistance(warehouse.getLatitude(), warehouse.getLongitude(),
                    order.getDestinationLatitude(), order.getDestinationLongitude());

            for (VehicleDocument vDoc : vehicleDocs) {
                // 1. Factory Resolution Event
                executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                        .sequence(seq++)
                        .phase("FACTORY")
                        .eventType("FACTORY_RESOLVED")
                        .message("VehicleFactoryResolver: resolving factory for vehicle type " + vDoc.getType())
                        .vehicleId(vDoc.getId())
                        .vehicleType(vDoc.getType())
                        .warehouseId(warehouse.getId())
                        .warehouseName(warehouse.getName())
                        .status("INFO")
                        .details(Map.of(
                                "factoryClass", vDoc.getType().equalsIgnoreCase("BIKE") ? "BikeFactory" :
                                                vDoc.getType().equalsIgnoreCase("VAN") ? "VanFactory" : "TruckFactory"
                        ))
                        .build());

                // 2. Factory Invocation: vehicle instantiation
                com.smartdelivery.factory.VehicleFactory factory = factoryResolver.getFactory(vDoc.getType());
                DeliveryVehicle vehicle = factory.createVehicle(vDoc);

                executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                        .sequence(seq++)
                        .phase("FACTORY")
                        .eventType("VEHICLE_CREATED")
                        .message("Factory created concrete " + vehicle.getClass().getSimpleName() + " instance [capacity=" + vehicle.getCapacity() + "kg, cost/km=" + vehicle.getCostPerKm() + ", maxRange=" + (vehicle.getMaxRange() >= 999999 ? "Unlimited" : vehicle.getMaxRange() + "km") + ", supportsFragile=" + vehicle.supportsFragile() + "]")
                        .vehicleId(vDoc.getId())
                        .vehicleType(vDoc.getType())
                        .warehouseId(warehouse.getId())
                        .warehouseName(warehouse.getName())
                        .status("SUCCESS")
                        .details(Map.of(
                                "concreteClass", vehicle.getClass().getSimpleName(),
                                "capacity", vehicle.getCapacity(),
                                "costPerKm", vehicle.getCostPerKm(),
                                "maxRange", vehicle.getMaxRange(),
                                "supportsFragile", vehicle.supportsFragile(),
                                "baseDeliveryTime", vehicle.getDeliveryTime()
                        ))
                        .build());

                // 3. Capacity validation
                if (vehicle.getCapacity() < order.getPackageWeight()) {
                    executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                            .sequence(seq++)
                            .phase("FACTORY")
                            .eventType("CONSTRAINT_EVALUATED")
                            .message("Candidate rejected: Package weight (" + order.getPackageWeight() + "kg) exceeds vehicle capacity (" + vehicle.getCapacity() + "kg)")
                            .vehicleId(vDoc.getId())
                            .vehicleType(vDoc.getType())
                            .warehouseId(warehouse.getId())
                            .warehouseName(warehouse.getName())
                            .status("REJECTED")
                            .rejectionReason("Insufficient capacity (" + vehicle.getCapacity() + "kg < " + order.getPackageWeight() + "kg)")
                            .details(Map.of("requiredCapacity", order.getPackageWeight(), "actualCapacity", vehicle.getCapacity()))
                            .build());
                    continue;
                }

                // 4. Distance / Range limit validation (e.g. Bike max 50km)
                if (distance > vehicle.getMaxRange()) {
                    executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                            .sequence(seq++)
                            .phase("FACTORY")
                            .eventType("CONSTRAINT_EVALUATED")
                            .message("Candidate rejected: Delivery distance (" + String.format("%.2f", distance) + "km) exceeds vehicle max range (" + String.format("%.0f", vehicle.getMaxRange()) + "km)")
                            .vehicleId(vDoc.getId())
                            .vehicleType(vDoc.getType())
                            .warehouseId(warehouse.getId())
                            .warehouseName(warehouse.getName())
                            .status("REJECTED")
                            .rejectionReason("Distance exceeds vehicle max range (" + String.format("%.1f", distance) + "km > " + String.format("%.0f", vehicle.getMaxRange()) + "km)")
                            .details(Map.of("distance", distance, "maxRange", vehicle.getMaxRange()))
                            .build());
                    continue;
                }

                // 5. Package compatibility validation
                if (order.getPackageType() == Order.PackageType.FRAGILE && !vehicle.supportsFragile()) {
                    executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                            .sequence(seq++)
                            .phase("FACTORY")
                            .eventType("CONSTRAINT_EVALUATED")
                            .message("Candidate rejected: FRAGILE package requires fragile support, but " + vehicle.getType() + " does not support fragile handling")
                            .vehicleId(vDoc.getId())
                            .vehicleType(vDoc.getType())
                            .warehouseId(warehouse.getId())
                            .warehouseName(warehouse.getName())
                            .status("REJECTED")
                            .rejectionReason("Fragile goods not supported by " + vehicle.getType())
                            .details(Map.of("packageType", "FRAGILE", "supportsFragile", false))
                            .build());
                    continue;
                }

                // Passed constraint checks
                double cost = costCalculator.calculateCost(distance, vehicle, order.isExpressDelivery(), order.isInsurance(), order.getPackageType() == Order.PackageType.FRAGILE);
                int time = vehicle.getDeliveryTime() + (int)(distance * 2); // 2 min per km approx addition

                AllocationCandidate candidate = new AllocationCandidate();
                candidate.setWarehouse(warehouse);
                candidate.setVehicle(vehicle);
                candidate.setDistance(distance);
                candidate.setEstimatedCost(cost);
                candidate.setEstimatedTime(time);

                candidates.add(candidate);
            }
        }

        if (candidates.isEmpty()) {
            executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                    .sequence(seq++)
                    .phase("FACTORY")
                    .eventType("ALLOCATION_FAILED")
                    .message("No suitable vehicle candidate satisfied the constraints")
                    .status("REJECTED")
                    .rejectionReason("All candidate vehicles were rejected based on capacity, distance range, or fragile compatibility constraints")
                    .build());
            throw new RuntimeException("No suitable allocation found");
        }

        // ------------------ STRATEGY PATTERN EXECUTION TRACE ------------------
        com.smartdelivery.strategy.AllocationScoringStrategy activeStrategy = scorer.getStrategy(requestedStrategy, order);
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("STRATEGY")
                .eventType("STRATEGY_SELECTED")
                .message("Strategy Context selected: [" + activeStrategy.getDisplayName() + "] algorithm")
                .status("INFO")
                .details(Map.of(
                        "strategyId", activeStrategy.getStrategyId(),
                        "strategyName", activeStrategy.getDisplayName(),
                        "description", activeStrategy.getDescription(),
                        "candidateCount", candidates.size()
                ))
                .build());

        for (AllocationCandidate candidate : candidates) {
            scorer.scoreCandidate(candidate, order, activeStrategy.getStrategyId());

            executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                    .sequence(seq++)
                    .phase("STRATEGY")
                    .eventType("CANDIDATE_SCORED")
                    .message(activeStrategy.getDisplayName() + " scored " + candidate.getVehicle().getType() + " (" + candidate.getWarehouse().getName() + "): " + String.format("%.2f", candidate.getFinalScore()) + " pts")
                    .vehicleId(candidate.getVehicle().getType())
                    .vehicleType(candidate.getVehicle().getType())
                    .warehouseId(candidate.getWarehouse().getId())
                    .warehouseName(candidate.getWarehouse().getName())
                    .status("SUCCESS")
                    .details(Map.of(
                            "strategyId", activeStrategy.getStrategyId(),
                            "distance", candidate.getDistance(),
                            "cost", candidate.getEstimatedCost(),
                            "time", candidate.getEstimatedTime(),
                            "finalScore", candidate.getFinalScore(),
                            "distanceScore", candidate.getDistanceScore(),
                            "costScore", candidate.getCostScore(),
                            "priorityScore", candidate.getPriorityScore(),
                            "capacityScore", candidate.getCapacityScore(),
                            "timeScore", candidate.getTimeScore()
                    ))
                    .build());
        }

        candidates.sort((c1, c2) -> Double.compare(c2.getFinalScore(), c1.getFinalScore()));

        AllocationCandidate bestCandidate = candidates.get(0);

        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("STRATEGY")
                .eventType("WINNER_SELECTED")
                .message("Strategy chosen optimal candidate: " + bestCandidate.getVehicle().getType() + " from " + bestCandidate.getWarehouse().getName() + " (Score: " + String.format("%.2f", bestCandidate.getFinalScore()) + ")")
                .vehicleId(bestCandidate.getVehicle().getType())
                .vehicleType(bestCandidate.getVehicle().getType())
                .warehouseId(bestCandidate.getWarehouse().getId())
                .warehouseName(bestCandidate.getWarehouse().getName())
                .status("SUCCESS")
                .details(Map.of(
                        "strategyId", activeStrategy.getStrategyId(),
                        "finalScore", bestCandidate.getFinalScore(),
                        "distance", bestCandidate.getDistance(),
                        "cost", bestCandidate.getEstimatedCost()
                ))
                .build());

        // ------------------ BUILDER PATTERN EXECUTION TRACE ------------------
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_INIT")
                .message("new DeliveryPlan.Builder() initialized")
                .builderMethod("new DeliveryPlan.Builder()")
                .status("SUCCESS")
                .build());

        DeliveryPlan.Builder builder = new DeliveryPlan.Builder();

        builder.order(order);
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".order(order)")
                .builderMethod(".order(order)")
                .fieldName("order")
                .fieldValue("Order #" + order.getId() + " (" + order.getDestination() + ")")
                .status("SUCCESS")
                .build());

        builder.warehouse(bestCandidate.getWarehouse());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".warehouse(warehouse)")
                .builderMethod(".warehouse(warehouse)")
                .fieldName("warehouse")
                .fieldValue(bestCandidate.getWarehouse().getName())
                .status("SUCCESS")
                .build());

        builder.vehicle(bestCandidate.getVehicle());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".vehicle(vehicle)")
                .builderMethod(".vehicle(vehicle)")
                .fieldName("vehicle")
                .fieldValue(bestCandidate.getVehicle().getClass().getSimpleName() + " (" + bestCandidate.getVehicle().getType() + ")")
                .status("SUCCESS")
                .build());

        builder.priority(order.getPriority().name());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".priority(\"" + order.getPriority().name() + "\")")
                .builderMethod(".priority(priority)")
                .fieldName("priority")
                .fieldValue(order.getPriority().name())
                .status("SUCCESS")
                .build());

        builder.distance(bestCandidate.getDistance());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".distance(" + String.format("%.2f", bestCandidate.getDistance()) + ")")
                .builderMethod(".distance(distance)")
                .fieldName("distance")
                .fieldValue(Math.round(bestCandidate.getDistance() * 100.0) / 100.0 + " km")
                .status("SUCCESS")
                .build());

        builder.estimatedCost(bestCandidate.getEstimatedCost());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".estimatedCost(" + String.format("%.2f", bestCandidate.getEstimatedCost()) + ")")
                .builderMethod(".estimatedCost(estimatedCost)")
                .fieldName("estimatedCost")
                .fieldValue("₹" + Math.round(bestCandidate.getEstimatedCost() * 100.0) / 100.0)
                .status("SUCCESS")
                .build());

        builder.estimatedTime(bestCandidate.getEstimatedTime());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".estimatedTime(" + bestCandidate.getEstimatedTime() + ")")
                .builderMethod(".estimatedTime(estimatedTime)")
                .fieldName("estimatedTime")
                .fieldValue(bestCandidate.getEstimatedTime() + " mins")
                .status("SUCCESS")
                .build());

        builder.allocationScore(bestCandidate.getFinalScore());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".allocationScore(" + String.format("%.2f", bestCandidate.getFinalScore()) + ")")
                .builderMethod(".allocationScore(allocationScore)")
                .fieldName("allocationScore")
                .fieldValue(Math.round(bestCandidate.getFinalScore() * 100.0) / 100.0)
                .status("SUCCESS")
                .build());

        boolean fragileHandling = order.getPackageType() == Order.PackageType.FRAGILE;
        builder.fragileHandling(fragileHandling);
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".fragileHandling(" + fragileHandling + ")")
                .builderMethod(".fragileHandling(fragileHandling)")
                .fieldName("fragileHandling")
                .fieldValue(fragileHandling)
                .status("SUCCESS")
                .build());

        builder.insurance(order.isInsurance());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".insurance(" + order.isInsurance() + ")")
                .builderMethod(".insurance(insurance)")
                .fieldName("insurance")
                .fieldValue(order.isInsurance())
                .status("SUCCESS")
                .build());

        builder.expressDelivery(order.isExpressDelivery());
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".expressDelivery(" + order.isExpressDelivery() + ")")
                .builderMethod(".expressDelivery(expressDelivery)")
                .fieldName("expressDelivery")
                .fieldValue(order.isExpressDelivery())
                .status("SUCCESS")
                .build());

        builder.reason("Best balance of distance, cost, capacity and priority");
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILDER_METHOD")
                .message(".reason(\"Best balance of distance, cost, capacity and priority\")")
                .builderMethod(".reason(reason)")
                .fieldName("reason")
                .fieldValue("Best balance of distance, cost, capacity and priority")
                .status("SUCCESS")
                .build());

        // Call .build()
        DeliveryPlan plan = builder.build();
        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("BUILD_COMPLETE")
                .message(".build() invoked: Mandatory validations passed. Immutable DeliveryPlan instance constructed.")
                .builderMethod(".build()")
                .status("SUCCESS")
                .build());

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

        executionTrace.add(com.smartdelivery.dto.PatternExecutionEvent.builder()
                .sequence(seq++)
                .phase("BUILDER")
                .eventType("PERSIST_COMPLETE")
                .message("DeliveryPlan persisted to database (collection: delivery_plans, id: " + doc.getId() + ")")
                .status("SUCCESS")
                .build());

        order.setStatus(Order.Status.ALLOCATED);
        orderRepository.save(order);

        List<AllocationCandidate> alternatives = candidates.subList(1, Math.min(candidates.size(), 4));

        return Map.of(
            "recommendedPlan", bestCandidate,
            "alternatives", alternatives,
            "executionTrace", executionTrace
        );
    }
}

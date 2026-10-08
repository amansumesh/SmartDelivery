package com.smartdelivery.allocation;
import com.smartdelivery.document.Order;
import org.springframework.stereotype.Component;

@Component
public class AllocationScorer {
    public void scoreCandidate(AllocationCandidate candidate, Order order) {
        // Distance score (closer is better, max 100 at 0km, 0 at 100km+)
        double distanceScore = Math.max(0, 100 - candidate.getDistance());
        
        // Cost score (cheaper is better, e.g. 100 at 0 cost, scaled arbitrarily)
        double costScore = Math.max(0, 100 - (candidate.getEstimatedCost() / 10));
        
        // Priority score
        double priorityScore = 50;
        if (order.getPriority() == Order.Priority.URGENT) {
            priorityScore = candidate.getEstimatedTime() < 40 ? 100 : 30;
        } else if (order.getPriority() == Order.Priority.HIGH) {
            priorityScore = candidate.getEstimatedTime() < 60 ? 90 : 50;
        } else {
            priorityScore = 100; // Normal/Low care more about cost/distance handled below
        }
        
        // Capacity score (tighter fit is better to save larger vehicles)
        double capacityScore = 100;
        if (candidate.getVehicle().getCapacity() > order.getPackageWeight() * 5) {
            capacityScore = 50; // Penalty for over-provisioning
        }
        
        // Time score (faster is better)
        double timeScore = Math.max(0, 100 - candidate.getEstimatedTime());
        
        candidate.setDistanceScore(distanceScore);
        candidate.setCostScore(costScore);
        candidate.setPriorityScore(priorityScore);
        candidate.setCapacityScore(capacityScore);
        candidate.setTimeScore(timeScore);
        
        double finalScore = distanceScore * 0.35
                          + costScore * 0.25
                          + priorityScore * 0.20
                          + capacityScore * 0.10
                          + timeScore * 0.10;
        
        candidate.setFinalScore(finalScore);
    }
}

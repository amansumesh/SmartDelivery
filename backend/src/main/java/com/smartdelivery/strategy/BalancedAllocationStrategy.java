package com.smartdelivery.strategy;

import com.smartdelivery.allocation.AllocationCandidate;
import com.smartdelivery.document.Order;
import org.springframework.stereotype.Component;

/**
 * Balanced Strategy:
 * Weights: Distance (35%), Cost (25%), Priority (20%), Capacity (10%), Time (10%)
 */
@Component("BALANCED")
public class BalancedAllocationStrategy implements AllocationScoringStrategy {

    @Override
    public String getStrategyId() {
        return "BALANCED";
    }

    @Override
    public String getDisplayName() {
        return "Balanced Strategy";
    }

    @Override
    public String getDescription() {
        return "Balances distance (35%), cost (25%), priority (20%), capacity fit (10%), and transit time (10%).";
    }

    @Override
    public void scoreCandidate(AllocationCandidate candidate, Order order) {
        double distanceScore = Math.max(0, 100 - candidate.getDistance());
        double costScore = Math.max(0, 100 - (candidate.getEstimatedCost() / 10));

        double priorityScore = 50;
        if (order.getPriority() == Order.Priority.URGENT) {
            priorityScore = candidate.getEstimatedTime() < 40 ? 100 : 30;
        } else if (order.getPriority() == Order.Priority.HIGH) {
            priorityScore = candidate.getEstimatedTime() < 60 ? 90 : 50;
        } else {
            priorityScore = 100;
        }

        double capacityScore = 100;
        if (candidate.getVehicle().getCapacity() > order.getPackageWeight() * 5) {
            capacityScore = 50;
        }

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

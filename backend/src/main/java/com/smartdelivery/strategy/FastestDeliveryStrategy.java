package com.smartdelivery.strategy;

import com.smartdelivery.allocation.AllocationCandidate;
import com.smartdelivery.document.Order;
import org.springframework.stereotype.Component;

/**
 * Fastest Delivery / Express Strategy:
 * Weights: Time (50%), Priority (25%), Distance (15%), Cost (5%), Capacity (5%)
 * Strongly prioritizes agile vehicles (like Bikes or closest depots) to achieve fastest ETA.
 */
@Component("FASTEST")
public class FastestDeliveryStrategy implements AllocationScoringStrategy {

    @Override
    public String getStrategyId() {
        return "FASTEST";
    }

    @Override
    public String getDisplayName() {
        return "Fastest Delivery (Express)";
    }

    @Override
    public String getDescription() {
        return "Heavily prioritizes minimum delivery ETA (50%) and urgent priority match (25%) over cost considerations.";
    }

    @Override
    public void scoreCandidate(AllocationCandidate candidate, Order order) {
        // Fast time score: 100 if time <= 20 mins, scales down steeply
        double timeScore = Math.max(0, 100 - (candidate.getEstimatedTime() * 0.8));

        // Priority score: high reward for rapid handling
        double priorityScore = candidate.getEstimatedTime() <= 45 ? 100 : 40;

        // Distance score
        double distanceScore = Math.max(0, 100 - (candidate.getDistance() * 1.2));

        // Cost score (minor factor)
        double costScore = Math.max(0, 100 - (candidate.getEstimatedCost() / 8));

        // Capacity score
        double capacityScore = 100;

        candidate.setDistanceScore(distanceScore);
        candidate.setCostScore(costScore);
        candidate.setPriorityScore(priorityScore);
        candidate.setCapacityScore(capacityScore);
        candidate.setTimeScore(timeScore);

        double finalScore = timeScore * 0.50
                + priorityScore * 0.25
                + distanceScore * 0.15
                + costScore * 0.05
                + capacityScore * 0.05;

        candidate.setFinalScore(finalScore);
    }
}

package com.smartdelivery.strategy;

import com.smartdelivery.allocation.AllocationCandidate;
import com.smartdelivery.document.Order;
import org.springframework.stereotype.Component;

/**
 * Distance Minimizing Strategy:
 * Weights: Distance (60%), Cost (15%), Time (15%), Priority (5%), Capacity (5%)
 * Aims to reduce depot-to-dropoff mileage and fuel footprint.
 */
@Component("DISTANCE")
public class DistanceMinimizingStrategy implements AllocationScoringStrategy {

    @Override
    public String getStrategyId() {
        return "DISTANCE";
    }

    @Override
    public String getDisplayName() {
        return "Distance Minimizer";
    }

    @Override
    public String getDescription() {
        return "Minimizes road travel distance (60%) to curb carbon footprint and route mileage.";
    }

    @Override
    public void scoreCandidate(AllocationCandidate candidate, Order order) {
        // Distance is king: 100 at 0km, degrades linearly
        double distanceScore = Math.max(0, 100 - (candidate.getDistance() * 1.5));
        double costScore = Math.max(0, 100 - (candidate.getEstimatedCost() / 10));
        double timeScore = Math.max(0, 100 - candidate.getEstimatedTime());
        double priorityScore = 70;
        double capacityScore = 80;

        candidate.setDistanceScore(distanceScore);
        candidate.setCostScore(costScore);
        candidate.setPriorityScore(priorityScore);
        candidate.setCapacityScore(capacityScore);
        candidate.setTimeScore(timeScore);

        double finalScore = distanceScore * 0.60
                + costScore * 0.15
                + timeScore * 0.15
                + priorityScore * 0.05
                + capacityScore * 0.05;

        candidate.setFinalScore(finalScore);
    }
}

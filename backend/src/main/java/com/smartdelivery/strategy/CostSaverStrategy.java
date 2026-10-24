package com.smartdelivery.strategy;

import com.smartdelivery.allocation.AllocationCandidate;
import com.smartdelivery.document.Order;
import org.springframework.stereotype.Component;

/**
 * Cost Saver / Economic Strategy:
 * Weights: Cost (50%), Capacity Utilization (25%), Distance (15%), Priority (5%), Time (5%)
 * Minimizes total transport expenditure and penalizes underutilized large vehicles.
 */
@Component("COST_SAVER")
public class CostSaverStrategy implements AllocationScoringStrategy {

    @Override
    public String getStrategyId() {
        return "COST_SAVER";
    }

    @Override
    public String getDisplayName() {
        return "Cost Saver (Economic)";
    }

    @Override
    public String getDescription() {
        return "Minimizes financial expenditure (50%) and optimizes vehicle capacity utilization (25%).";
    }

    @Override
    public void scoreCandidate(AllocationCandidate candidate, Order order) {
        // High penalty for high cost, reward low cost
        double costScore = Math.max(0, 100 - (candidate.getEstimatedCost() / 5));

        // Capacity score: reward right-sized vehicles
        double capacityScore = 100;
        double ratio = candidate.getVehicle().getCapacity() / Math.max(1.0, order.getPackageWeight());
        if (ratio > 4.0) {
            capacityScore = 40; // Penalize sending a Truck for a 2kg parcel
        } else if (ratio > 2.0) {
            capacityScore = 75;
        }

        // Distance score
        double distanceScore = Math.max(0, 100 - candidate.getDistance());

        // Time and Priority are secondary
        double priorityScore = 70;
        double timeScore = Math.max(0, 100 - candidate.getEstimatedTime());

        candidate.setDistanceScore(distanceScore);
        candidate.setCostScore(costScore);
        candidate.setPriorityScore(priorityScore);
        candidate.setCapacityScore(capacityScore);
        candidate.setTimeScore(timeScore);

        double finalScore = costScore * 0.50
                + capacityScore * 0.25
                + distanceScore * 0.15
                + priorityScore * 0.05
                + timeScore * 0.05;

        candidate.setFinalScore(finalScore);
    }
}

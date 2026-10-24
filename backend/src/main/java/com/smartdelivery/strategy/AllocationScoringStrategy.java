package com.smartdelivery.strategy;

import com.smartdelivery.allocation.AllocationCandidate;
import com.smartdelivery.document.Order;

public interface AllocationScoringStrategy {
    /**
     * Unique identifier for the strategy (e.g., "BALANCED", "FASTEST", "COST_SAVER", "DISTANCE")
     */
    String getStrategyId();

    /**
     * Display name of the strategy for reporting and UI
     */
    String getDisplayName();

    /**
     * Strategy description explaining the formula logic
     */
    String getDescription();

    /**
     * Calculate and populate scores (distance, cost, priority, capacity, time, and finalScore)
     */
    void scoreCandidate(AllocationCandidate candidate, Order order);
}

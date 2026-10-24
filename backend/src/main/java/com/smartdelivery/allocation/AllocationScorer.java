package com.smartdelivery.allocation;

import com.smartdelivery.document.Order;
import com.smartdelivery.strategy.AllocationScoringStrategy;
import com.smartdelivery.strategy.AllocationStrategyContext;
import org.springframework.stereotype.Component;

/**
 * AllocationScorer acts as a bridge and delegator to the Strategy Pattern context.
 */
@Component
public class AllocationScorer {

    private final AllocationStrategyContext strategyContext;

    public AllocationScorer() {
        this(new AllocationStrategyContext(java.util.List.of(
                new com.smartdelivery.strategy.BalancedAllocationStrategy(),
                new com.smartdelivery.strategy.FastestDeliveryStrategy(),
                new com.smartdelivery.strategy.CostSaverStrategy(),
                new com.smartdelivery.strategy.DistanceMinimizingStrategy()
        )));
    }

    public AllocationScorer(AllocationStrategyContext strategyContext) {
        this.strategyContext = strategyContext;
    }

    public void scoreCandidate(AllocationCandidate candidate, Order order) {
        scoreCandidate(candidate, order, null);
    }

    public void scoreCandidate(AllocationCandidate candidate, Order order, String strategyKey) {
        AllocationScoringStrategy strategy = strategyContext.resolveStrategy(strategyKey, order);
        strategy.scoreCandidate(candidate, order);
    }

    public AllocationScoringStrategy getStrategy(String strategyKey, Order order) {
        return strategyContext.resolveStrategy(strategyKey, order);
    }
}

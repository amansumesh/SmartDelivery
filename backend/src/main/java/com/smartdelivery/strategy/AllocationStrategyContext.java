package com.smartdelivery.strategy;

import com.smartdelivery.document.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Strategy Context (Strategy Pattern)
 * Maintains reference to concrete strategies and resolves strategy dynamically.
 */
@Component
public class AllocationStrategyContext {

    private final Map<String, AllocationScoringStrategy> strategyMap = new ConcurrentHashMap<>();
    private final AllocationScoringStrategy defaultStrategy;

    public AllocationStrategyContext(List<AllocationScoringStrategy> strategies) {
        for (AllocationScoringStrategy strategy : strategies) {
            strategyMap.put(strategy.getStrategyId().toUpperCase(), strategy);
        }
        // Fallback default is BALANCED
        this.defaultStrategy = strategyMap.getOrDefault("BALANCED", strategies.get(0));
    }

    /**
     * Resolves strategy by explicit key or auto-detects based on order parameters.
     */
    public AllocationScoringStrategy resolveStrategy(String strategyKey, Order order) {
        if (strategyKey != null && !strategyKey.trim().isEmpty()) {
            AllocationScoringStrategy s = strategyMap.get(strategyKey.trim().toUpperCase());
            if (s != null) {
                return s;
            }
        }

        // Auto-detection logic based on order profile:
        if (order != null) {
            if (order.isExpressDelivery() || order.getPriority() == Order.Priority.URGENT) {
                AllocationScoringStrategy fastest = strategyMap.get("FASTEST");
                if (fastest != null) return fastest;
            }
            if (order.getPriority() == Order.Priority.LOW) {
                AllocationScoringStrategy costSaver = strategyMap.get("COST_SAVER");
                if (costSaver != null) return costSaver;
            }
        }

        return defaultStrategy;
    }

    public List<AllocationScoringStrategy> getAllStrategies() {
        return List.copyOf(strategyMap.values());
    }
}

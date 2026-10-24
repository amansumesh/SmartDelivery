'use client';
import React from 'react';
import { PatternExecutionEvent } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, ExternalLink } from 'lucide-react';

interface CodeInspectorProps {
    activeEvent?: PatternExecutionEvent | null;
}

export default function CodeInspector({ activeEvent }: CodeInspectorProps) {
    if (!activeEvent) {
        return (
            <Card className="p-4 border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Code2 className="w-4 h-4" />
                    <span className="font-sans font-semibold uppercase tracking-wider text-[11px]">Java Code Inspector</span>
                </div>
                <div className="text-slate-500 py-6 text-center italic">
                    Select any execution step or card above to inspect its real Java backend source code.
                </div>
            </Card>
        );
    }

    const snippet = getSnippetForEvent(activeEvent);

    return (
        <Card className="border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-red-500" />
                    <span className="font-sans font-semibold text-slate-200 text-xs">
                        {snippet.className}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700 font-sans">
                        {snippet.methodName}
                    </Badge>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">
                    Pattern: <strong className="text-red-400">{snippet.pattern}</strong>
                </span>
            </div>

            <div className="p-4 overflow-x-auto space-y-3">
                <p className="text-slate-400 font-sans text-xs">
                    {snippet.explanation}
                </p>

                <pre className="p-3 rounded bg-slate-900 border border-slate-800/80 text-emerald-300 text-[11px] leading-relaxed overflow-x-auto">
                    <code>{snippet.code}</code>
                </pre>

                {snippet.note && (
                    <div className="text-[11px] font-sans text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                        <strong className="text-red-400">Key takeaway:</strong> {snippet.note}
                    </div>
                )}
            </div>
        </Card>
    );
}

function getSnippetForEvent(event: PatternExecutionEvent) {
    if (event.phase === 'BUILDER') {
        if (event.eventType === 'BUILD_COMPLETE') {
            return {
                pattern: 'Builder Pattern',
                className: 'com.smartdelivery.builder.DeliveryPlan.Builder',
                methodName: 'public DeliveryPlan build()',
                explanation: 'Enforces mandatory invariant constraints before returning the fully assembled DeliveryPlan object.',
                code: `public DeliveryPlan build() {
    if (order == null || warehouse == null || vehicle == null) {
        throw new IllegalStateException("Order, Warehouse, and Vehicle are mandatory");
    }
    return new DeliveryPlan(this);
}`,
                note: 'The private constructor DeliveryPlan(Builder builder) copies all validated builder fields into private final member variables, guaranteeing immutability.'
            };
        }

        if (event.eventType === 'BUILDER_INIT') {
            return {
                pattern: 'Builder Pattern',
                className: 'com.smartdelivery.allocation.AllocationService',
                methodName: 'allocateOrder(String orderId)',
                explanation: 'Instantiates the static inner builder class to begin fluent step-by-step assembly.',
                code: `// AllocationService.java
DeliveryPlan.Builder builder = new DeliveryPlan.Builder();`,
                note: 'Avoids telescoping constructor anti-pattern (overloaded constructors with 10+ arguments).'
            };
        }

        return {
            pattern: 'Builder Pattern',
            className: 'com.smartdelivery.builder.DeliveryPlan.Builder',
            methodName: event.builderMethod || 'public Builder ...',
            explanation: `Fluent setter for '${event.fieldName || 'field'}' returning 'this' to allow chained invocations.`,
            code: `public Builder ${event.fieldName || 'field'}(${getTypeForField(event.fieldName)} ${event.fieldName || 'value'}) {
    this.${event.fieldName || 'value'} = ${event.fieldName || 'value'};
    return this;
}`,
            note: 'Each method returns the Builder instance itself, enabling readable dot-chaining in AllocationService.'
        };
    }

    // FACTORY events
    if (event.eventType === 'FACTORY_RESOLVED') {
        return {
            pattern: 'Factory / Registry Pattern',
            className: 'com.smartdelivery.factory.VehicleFactoryResolver',
            methodName: 'public VehicleFactory getFactory(String type)',
            explanation: 'Resolves the concrete factory strategy from an injected immutable Map based on vehicle type.',
            code: `public VehicleFactory getFactory(String type) {
    VehicleFactory factory = factories.get(type.toUpperCase());
    if (factory == null) {
        throw new IllegalArgumentException("No factory found for vehicle type: " + type);
    }
    return factory;
}`,
            note: 'Decouples vehicle instantiation logic from callers. Adding a new vehicle only requires registering a new factory.'
        };
    }

    if (event.eventType === 'VEHICLE_CREATED') {
        const vType = event.vehicleType || 'BIKE';
        const fClass = vType === 'BIKE' ? 'BikeFactory' : vType === 'VAN' ? 'VanFactory' : 'TruckFactory';
        const vClass = vType === 'BIKE' ? 'Bike' : vType === 'VAN' ? 'Van' : 'Truck';

        return {
            pattern: 'Factory Method Pattern',
            className: `com.smartdelivery.factory.${fClass}`,
            methodName: 'public DeliveryVehicle createVehicle(VehicleDocument doc)',
            explanation: `Concrete creator instantiates and returns a polymorphic '${vClass}' instance implementing DeliveryVehicle.`,
            code: `@Component
public class ${fClass} extends VehicleFactory {
    @Override
    public DeliveryVehicle createVehicle(VehicleDocument doc) {
        return new ${vClass}(doc.getCapacity(), doc.getCostPerKm(), doc.isSupportsFragile());
    }
}`,
            note: 'The caller treats the result as a generic DeliveryVehicle interface without knowing the concrete class.'
        };
    }

    if (event.eventType === 'CONSTRAINT_EVALUATED') {
        return {
            pattern: 'Business Rules & Factory Constraints',
            className: 'com.smartdelivery.allocation.AllocationService',
            methodName: 'allocateOrder(String orderId)',
            explanation: 'Constraint checks evaluated dynamically against the created DeliveryVehicle methods.',
            code: `// Capacity validation
if (vehicle.getCapacity() < order.getPackageWeight()) continue;

// Package compatibility validation
if (order.getPackageType() == Order.PackageType.FRAGILE && !vehicle.supportsFragile()) continue;`,
            note: 'Vehicles that fail physical or safety constraints are excluded before running the scoring algorithm.'
        };
    }

    if (event.eventType === 'STRATEGY_SELECTED') {
        const stratId = event.details?.strategyId || 'BALANCED';
        return {
            pattern: 'Strategy Pattern',
            className: 'com.smartdelivery.strategy.AllocationStrategyContext',
            methodName: 'resolveStrategy(String strategyKey, Order order)',
            explanation: 'The Strategy Context selects the concrete algorithm based on user selection or dynamic order attributes.',
            code: `@Component
public class AllocationStrategyContext {
    private final Map<String, AllocationScoringStrategy> strategyMap;

    public AllocationScoringStrategy resolveStrategy(String strategyKey, Order order) {
        if (strategyKey != null) return strategyMap.get(strategyKey);
        if (order.isExpressDelivery()) return strategyMap.get("FASTEST");
        if (order.getPriority() == Order.Priority.LOW) return strategyMap.get("COST_SAVER");
        return strategyMap.get("BALANCED");
    }
}`,
            note: 'Allows swapping routing and scoring algorithms at runtime without altering client code or service classes.'
        };
    }

    if (event.eventType === 'CANDIDATE_SCORED') {
        const stratId = event.details?.strategyId || 'BALANCED';
        const stratName = stratId === 'FASTEST' ? 'FastestDeliveryStrategy' :
                          stratId === 'COST_SAVER' ? 'CostSaverStrategy' :
                          stratId === 'DISTANCE' ? 'DistanceMinimizingStrategy' : 'BalancedAllocationStrategy';
        return {
            pattern: 'Strategy Pattern (Concrete Strategy)',
            className: `com.smartdelivery.strategy.${stratName}`,
            methodName: 'scoreCandidate(AllocationCandidate candidate, Order order)',
            explanation: `Candidate scored using the concrete strategy implementation: ${stratName}.`,
            code: `// Interface: com.smartdelivery.strategy.AllocationScoringStrategy
@Component("${stratId}")
public class ${stratName} implements AllocationScoringStrategy {
    @Override
    public void scoreCandidate(AllocationCandidate candidate, Order order) {
        // Concrete strategy weights calculated dynamically...
        candidate.setFinalScore(finalScore);
    }
}`,
            note: 'Each Strategy calculates its custom balance of transit time, cost efficiency, carbon distance, and capacity.'
        };
    }

    // Default
    return {
        pattern: 'System Execution',
        className: 'com.smartdelivery.allocation.AllocationService',
        methodName: 'allocateOrder(String orderId)',
        explanation: event.message,
        code: `// Event: ${event.eventType}\n// Sequence #${event.sequence}\n${JSON.stringify(event.details || {}, null, 2)}`,
        note: 'Execution event emitted during backend allocation lifecycle.'
    };
}

function getTypeForField(fieldName?: string): string {
    switch (fieldName) {
        case 'order': return 'Order';
        case 'warehouse': return 'Warehouse';
        case 'vehicle': return 'DeliveryVehicle';
        case 'priority': return 'String';
        case 'distance':
        case 'estimatedCost':
        case 'allocationScore': return 'double';
        case 'estimatedTime': return 'int';
        case 'fragileHandling':
        case 'insurance':
        case 'expressDelivery': return 'boolean';
        case 'reason': return 'String';
        default: return 'Object';
    }
}

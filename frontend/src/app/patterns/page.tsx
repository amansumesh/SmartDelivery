'use client';
import React, { useState } from 'react';
import { PatternExecutionEvent, Order } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PatternExecutionVisualizer from '@/components/visualizer/PatternExecutionVisualizer';
import FactoryMethodAnimation from '@/components/visualizer/FactoryMethodAnimation';
import StrategyAnimation from '@/components/visualizer/StrategyAnimation';
import BuilderAnimation from '@/components/visualizer/BuilderAnimation';
import { Sparkles, Box, Truck, Compass } from 'lucide-react';

// Pre-defined realistic simulation scenarios based on real backend behavior
const SAMPLE_SCENARIOS: {
    id: string;
    title: string;
    description: string;
    order: Order;
    trace: PatternExecutionEvent[];
}[] = [
    {
        id: 'standard-small',
        title: 'Scenario A: Light Standard Package (5.0 kg)',
        description: 'Demonstrates capacity suitability where Bike, Van, and Truck are all capable, but Bike wins on cost & proximity.',
        order: {
            id: 'ord-sim-01',
            destination: 'Chennai Central',
            destinationLatitude: 13.0827,
            destinationLongitude: 80.2707,
            packageWeight: 5.0,
            packageType: 'STANDARD',
            priority: 'NORMAL',
            expressDelivery: false,
            insurance: false,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        },
        trace: [
            {
                sequence: 1,
                phase: 'FACTORY',
                eventType: 'ORDER_RECEIVED',
                message: 'Order received: Weight 5.0kg, Type STANDARD, Priority NORMAL',
                status: 'INFO',
                details: { weight: 5.0, packageType: 'STANDARD', priority: 'NORMAL' },
            },
            {
                sequence: 2,
                phase: 'FACTORY',
                eventType: 'FACTORY_RESOLVED',
                message: 'VehicleFactoryResolver: resolving factory for vehicle type BIKE',
                vehicleType: 'BIKE',
                warehouseName: 'Chennai Warehouse',
                status: 'INFO',
            },
            {
                sequence: 3,
                phase: 'FACTORY',
                eventType: 'VEHICLE_CREATED',
                message: 'Factory created concrete Bike instance [capacity=10.0kg, cost/km=8.0, supportsFragile=true]',
                vehicleType: 'BIKE',
                warehouseName: 'Chennai Warehouse',
                status: 'SUCCESS',
                details: { concreteClass: 'Bike', capacity: 10.0, costPerKm: 8.0, maxRange: 50.0, supportsFragile: true, baseDeliveryTime: 30 },
            },
            {
                sequence: 4,
                phase: 'STRATEGY',
                eventType: 'STRATEGY_SELECTED',
                message: 'Strategy Context selected: [Balanced Strategy] algorithm',
                status: 'INFO',
                details: {
                    strategyId: 'BALANCED',
                    strategyName: 'Balanced Strategy',
                    description: 'Balances distance (35%), cost (25%), priority (20%), capacity fit (10%), and transit time (10%).',
                },
            },
            {
                sequence: 5,
                phase: 'STRATEGY',
                eventType: 'CANDIDATE_SCORED',
                message: 'Balanced Strategy scored BIKE (Chennai Warehouse): 91.50 pts',
                vehicleType: 'BIKE',
                warehouseName: 'Chennai Warehouse',
                status: 'SUCCESS',
                details: {
                    strategyId: 'BALANCED',
                    finalScore: 91.50,
                    distance: 12.4,
                    cost: 99.20,
                    time: 54,
                    distanceScore: 88,
                    costScore: 90,
                    priorityScore: 100,
                    capacityScore: 100,
                    timeScore: 78,
                },
            },
            {
                sequence: 6,
                phase: 'FACTORY',
                eventType: 'FACTORY_RESOLVED',
                message: 'VehicleFactoryResolver: resolving factory for vehicle type VAN',
                vehicleType: 'VAN',
                warehouseName: 'Chennai Warehouse',
                status: 'INFO',
            },
            {
                sequence: 7,
                phase: 'FACTORY',
                eventType: 'VEHICLE_CREATED',
                message: 'Factory created concrete Van instance [capacity=50.0kg, cost/km=15.0, supportsFragile=true]',
                vehicleType: 'VAN',
                warehouseName: 'Chennai Warehouse',
                status: 'SUCCESS',
                details: { concreteClass: 'Van', capacity: 50.0, costPerKm: 15.0, maxRange: 300.0, supportsFragile: true, baseDeliveryTime: 45 },
            },
            {
                sequence: 8,
                phase: 'STRATEGY',
                eventType: 'CANDIDATE_SCORED',
                message: 'Balanced Strategy scored VAN (Chennai Warehouse): 78.20 pts',
                vehicleType: 'VAN',
                warehouseName: 'Chennai Warehouse',
                status: 'SUCCESS',
                details: {
                    strategyId: 'BALANCED',
                    finalScore: 78.20,
                    distance: 12.4,
                    cost: 186.00,
                    time: 69,
                    distanceScore: 88,
                    costScore: 81,
                    priorityScore: 100,
                    capacityScore: 50,
                    timeScore: 55,
                },
            },
            {
                sequence: 9,
                phase: 'STRATEGY',
                eventType: 'WINNER_SELECTED',
                message: 'Strategy chosen optimal candidate: BIKE from Chennai Warehouse (Score: 91.50)',
                vehicleType: 'BIKE',
                warehouseName: 'Chennai Warehouse',
                status: 'SUCCESS',
                details: { strategyId: 'BALANCED', finalScore: 91.50, distance: 12.4, cost: 99.20 },
            },
            {
                sequence: 10,
                phase: 'BUILDER',
                eventType: 'BUILDER_INIT',
                message: 'new DeliveryPlan.Builder() initialized',
                builderMethod: 'new DeliveryPlan.Builder()',
                status: 'SUCCESS',
            },
            {
                sequence: 11,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.order(order)',
                builderMethod: '.order(order)',
                fieldName: 'order',
                fieldValue: 'Order #sim-01 (Chennai Central)',
                status: 'SUCCESS',
            },
            {
                sequence: 12,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.warehouse(warehouse)',
                builderMethod: '.warehouse(warehouse)',
                fieldName: 'warehouse',
                fieldValue: 'Chennai Warehouse',
                status: 'SUCCESS',
            },
            {
                sequence: 13,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.vehicle(vehicle)',
                builderMethod: '.vehicle(vehicle)',
                fieldName: 'vehicle',
                fieldValue: 'Bike (BIKE)',
                status: 'SUCCESS',
            },
            {
                sequence: 14,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.priority("NORMAL")',
                builderMethod: '.priority(priority)',
                fieldName: 'priority',
                fieldValue: 'NORMAL',
                status: 'SUCCESS',
            },
            {
                sequence: 15,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.distance(12.4)',
                builderMethod: '.distance(distance)',
                fieldName: 'distance',
                fieldValue: '12.4 km',
                status: 'SUCCESS',
            },
            {
                sequence: 16,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.estimatedCost(99.2)',
                builderMethod: '.estimatedCost(estimatedCost)',
                fieldName: 'estimatedCost',
                fieldValue: '₹99.20',
                status: 'SUCCESS',
            },
            {
                sequence: 17,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.estimatedTime(54)',
                builderMethod: '.estimatedTime(estimatedTime)',
                fieldName: 'estimatedTime',
                fieldValue: '54 mins',
                status: 'SUCCESS',
            },
            {
                sequence: 18,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.allocationScore(91.5)',
                builderMethod: '.allocationScore(allocationScore)',
                fieldName: 'allocationScore',
                fieldValue: 91.5,
                status: 'SUCCESS',
            },
            {
                sequence: 19,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.fragileHandling(false)',
                builderMethod: '.fragileHandling(fragileHandling)',
                fieldName: 'fragileHandling',
                fieldValue: false,
                status: 'SUCCESS',
            },
            {
                sequence: 20,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.reason("Best balance of distance, cost, capacity and priority")',
                builderMethod: '.reason(reason)',
                fieldName: 'reason',
                fieldValue: 'Best balance of distance, cost, capacity and priority',
                status: 'SUCCESS',
            },
            {
                sequence: 21,
                phase: 'BUILDER',
                eventType: 'BUILD_COMPLETE',
                message: '.build() invoked: Mandatory validations passed. Immutable DeliveryPlan instance constructed.',
                builderMethod: '.build()',
                status: 'SUCCESS',
            },
            {
                sequence: 22,
                phase: 'BUILDER',
                eventType: 'PERSIST_COMPLETE',
                message: 'DeliveryPlan persisted to database (collection: delivery_plans)',
                status: 'SUCCESS',
            },
        ],
    },
    {
        id: 'fragile-heavy',
        title: 'Scenario B: Heavy Fragile Package (40.0 kg)',
        description: 'Demonstrates constraint rejection: Bike fails capacity check (10kg < 40kg) and Truck fails fragile check, leading to Van selection.',
        order: {
            id: 'ord-sim-02',
            destination: 'Vellore Tech Park',
            destinationLatitude: 12.9165,
            destinationLongitude: 79.1325,
            packageWeight: 40.0,
            packageType: 'FRAGILE',
            priority: 'URGENT',
            expressDelivery: true,
            insurance: true,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        },
        trace: [
            {
                sequence: 1,
                phase: 'FACTORY',
                eventType: 'ORDER_RECEIVED',
                message: 'Order received: Weight 40.0kg, Type FRAGILE, Priority URGENT',
                status: 'INFO',
                details: { weight: 40.0, packageType: 'FRAGILE', priority: 'URGENT' },
            },
            {
                sequence: 2,
                phase: 'FACTORY',
                eventType: 'FACTORY_RESOLVED',
                message: 'VehicleFactoryResolver: resolving factory for vehicle type BIKE',
                vehicleType: 'BIKE',
                warehouseName: 'Vellore Central Warehouse',
                status: 'INFO',
            },
            {
                sequence: 3,
                phase: 'FACTORY',
                eventType: 'VEHICLE_CREATED',
                message: 'Factory created concrete Bike instance [capacity=10.0kg, cost/km=8.0, supportsFragile=true]',
                vehicleType: 'BIKE',
                warehouseName: 'Vellore Central Warehouse',
                status: 'SUCCESS',
                details: { concreteClass: 'Bike', capacity: 10.0, costPerKm: 8.0, maxRange: 50.0, supportsFragile: true },
            },
            {
                sequence: 4,
                phase: 'FACTORY',
                eventType: 'CONSTRAINT_EVALUATED',
                message: 'Candidate rejected: Package weight (40.0kg) exceeds vehicle capacity (10.0kg)',
                vehicleType: 'BIKE',
                warehouseName: 'Vellore Central Warehouse',
                status: 'REJECTED',
                rejectionReason: 'Insufficient capacity (10.0kg < 40.0kg)',
            },
            {
                sequence: 5,
                phase: 'FACTORY',
                eventType: 'FACTORY_RESOLVED',
                message: 'VehicleFactoryResolver: resolving factory for vehicle type TRUCK',
                vehicleType: 'TRUCK',
                warehouseName: 'Vellore Central Warehouse',
                status: 'INFO',
            },
            {
                sequence: 6,
                phase: 'FACTORY',
                eventType: 'VEHICLE_CREATED',
                message: 'Factory created concrete Truck instance [capacity=500.0kg, cost/km=30.0, supportsFragile=false]',
                vehicleType: 'TRUCK',
                warehouseName: 'Vellore Central Warehouse',
                status: 'SUCCESS',
                details: { concreteClass: 'Truck', capacity: 500.0, costPerKm: 30.0, maxRange: 999999, supportsFragile: false },
            },
            {
                sequence: 7,
                phase: 'FACTORY',
                eventType: 'CONSTRAINT_EVALUATED',
                message: 'Candidate rejected: FRAGILE package requires fragile support, but TRUCK does not support fragile handling',
                vehicleType: 'TRUCK',
                warehouseName: 'Vellore Central Warehouse',
                status: 'REJECTED',
                rejectionReason: 'Fragile goods not supported by TRUCK',
            },
            {
                sequence: 8,
                phase: 'FACTORY',
                eventType: 'FACTORY_RESOLVED',
                message: 'VehicleFactoryResolver: resolving factory for vehicle type VAN',
                vehicleType: 'VAN',
                warehouseName: 'Vellore Central Warehouse',
                status: 'INFO',
            },
            {
                sequence: 9,
                phase: 'FACTORY',
                eventType: 'VEHICLE_CREATED',
                message: 'Factory created concrete Van instance [capacity=50.0kg, cost/km=15.0, supportsFragile=true]',
                vehicleType: 'VAN',
                warehouseName: 'Vellore Central Warehouse',
                status: 'SUCCESS',
                details: { concreteClass: 'Van', capacity: 50.0, costPerKm: 15.0, maxRange: 300.0, supportsFragile: true },
            },
            {
                sequence: 10,
                phase: 'STRATEGY',
                eventType: 'STRATEGY_SELECTED',
                message: 'Strategy Context auto-detected: [Fastest Delivery (Express)] algorithm (Order Priority: URGENT, Express: true)',
                status: 'INFO',
                details: {
                    strategyId: 'FASTEST',
                    strategyName: 'Fastest Delivery (Express)',
                    description: 'Heavily prioritizes minimum delivery ETA (50%) and urgent priority match (25%) over cost considerations.',
                },
            },
            {
                sequence: 11,
                phase: 'STRATEGY',
                eventType: 'CANDIDATE_SCORED',
                message: 'Fastest Delivery scored VAN (Vellore Central Warehouse): 86.40 pts',
                vehicleType: 'VAN',
                warehouseName: 'Vellore Central Warehouse',
                status: 'SUCCESS',
                details: {
                    strategyId: 'FASTEST',
                    finalScore: 86.40,
                    distance: 8.5,
                    cost: 209.38,
                    time: 62,
                    distanceScore: 90,
                    costScore: 74,
                    priorityScore: 95,
                    capacityScore: 100,
                    timeScore: 82,
                },
            },
            {
                sequence: 12,
                phase: 'STRATEGY',
                eventType: 'WINNER_SELECTED',
                message: 'Strategy chosen optimal candidate: VAN from Vellore Central Warehouse (Score: 86.40)',
                vehicleType: 'VAN',
                warehouseName: 'Vellore Central Warehouse',
                status: 'SUCCESS',
                details: { strategyId: 'FASTEST', finalScore: 86.40, distance: 8.5, cost: 209.38 },
            },
            {
                sequence: 13,
                phase: 'BUILDER',
                eventType: 'BUILDER_INIT',
                message: 'new DeliveryPlan.Builder() initialized',
                builderMethod: 'new DeliveryPlan.Builder()',
                status: 'SUCCESS',
            },
            {
                sequence: 14,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.order(order)',
                builderMethod: '.order(order)',
                fieldName: 'order',
                fieldValue: 'Order #sim-02 (Vellore Tech Park)',
                status: 'SUCCESS',
            },
            {
                sequence: 15,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.warehouse(warehouse)',
                builderMethod: '.warehouse(warehouse)',
                fieldName: 'warehouse',
                fieldValue: 'Vellore Central Warehouse',
                status: 'SUCCESS',
            },
            {
                sequence: 16,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.vehicle(vehicle)',
                builderMethod: '.vehicle(vehicle)',
                fieldName: 'vehicle',
                fieldValue: 'Van (VAN)',
                status: 'SUCCESS',
            },
            {
                sequence: 17,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.priority("URGENT")',
                builderMethod: '.priority(priority)',
                fieldName: 'priority',
                fieldValue: 'URGENT',
                status: 'SUCCESS',
            },
            {
                sequence: 18,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.distance(8.5)',
                builderMethod: '.distance(distance)',
                fieldName: 'distance',
                fieldValue: '8.5 km',
                status: 'SUCCESS',
            },
            {
                sequence: 19,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.estimatedCost(209.38)',
                builderMethod: '.estimatedCost(estimatedCost)',
                fieldName: 'estimatedCost',
                fieldValue: '₹209.38',
                status: 'SUCCESS',
            },
            {
                sequence: 20,
                phase: 'BUILDER',
                eventType: 'BUILDER_METHOD',
                message: '.fragileHandling(true)',
                builderMethod: '.fragileHandling(fragileHandling)',
                fieldName: 'fragileHandling',
                fieldValue: true,
                status: 'SUCCESS',
            },
            {
                sequence: 21,
                phase: 'BUILDER',
                eventType: 'BUILD_COMPLETE',
                message: '.build() invoked: Mandatory validations passed. Immutable DeliveryPlan instance constructed.',
                builderMethod: '.build()',
                status: 'SUCCESS',
            },
            {
                sequence: 22,
                phase: 'BUILDER',
                eventType: 'PERSIST_COMPLETE',
                message: 'DeliveryPlan persisted to database (collection: delivery_plans)',
                status: 'SUCCESS',
            },
        ],
    },
];

export default function PatternsPage() {
    const [selectedScenarioId, setSelectedScenarioId] = useState<string>('standard-small');
    const [activeTab, setActiveTab] = useState<'all' | 'factory' | 'strategy' | 'builder'>('all');

    const scenario = SAMPLE_SCENARIOS.find(s => s.id === selectedScenarioId) || SAMPLE_SCENARIOS[0];

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-16">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 border-indigo-200">
                        Interactive Learning Lab
                    </Badge>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Design Pattern Execution Lab
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                    Explore how <strong>Factory Method</strong> decouples and instantiates polymorphic vehicles,
                    how <strong>Strategy</strong> dynamically evaluates routing and scoring algorithms,
                    and how <strong>Builder</strong> safely constructs validated, immutable delivery plans.
                </p>
            </div>

            {/* Pattern Explanations Overview Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                Pattern 1: Factory Method (Creational)
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                Defines an interface <code className="text-blue-700 dark:text-blue-300 font-mono">VehicleFactory</code> for creating objects,
                                letting subclasses (<code className="font-mono">BikeFactory</code>, <code className="font-mono">VanFactory</code>, <code className="font-mono">TruckFactory</code>)
                                decide which class to instantiate. Solves open/closed extensibility.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                            <Compass className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                Pattern 2: Strategy (Behavioral)
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                Encapsulates interchangeable routing and scoring algorithms (<code className="text-indigo-700 dark:text-indigo-300 font-mono">Balanced</code>, <code className="font-mono">Fastest</code>, <code className="font-mono">CostSaver</code>, <code className="font-mono">Distance</code>)
                                inside an <code className="font-mono">AllocationStrategyContext</code>, allowing dynamic runtime algorithm switching.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 border-purple-200 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0 mt-0.5">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                Pattern 3: Builder (Creational)
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                Separates the complex construction of <code className="text-purple-700 dark:text-purple-300 font-mono">DeliveryPlan</code> from its representation.
                                Enables fluent step-by-step assembly, avoids telescoping constructors, and enforces non-null invariants before instantiation.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Scenario Selector & Mode Bar */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Select Demo Scenario:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_SCENARIOS.map(sc => (
                            <Button
                                key={sc.id}
                                size="sm"
                                variant={selectedScenarioId === sc.id ? 'default' : 'outline'}
                                onClick={() => setSelectedScenarioId(sc.id)}
                                className="text-xs"
                            >
                                {sc.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <Button
                        size="sm"
                        variant={activeTab === 'all' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('all')}
                        className="text-xs h-8"
                    >
                        Combined Pipeline
                    </Button>
                    <Button
                        size="sm"
                        variant={activeTab === 'factory' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('factory')}
                        className="text-xs h-8"
                    >
                        Factory Method
                    </Button>
                    <Button
                        size="sm"
                        variant={activeTab === 'strategy' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('strategy')}
                        className="text-xs h-8"
                    >
                        Strategy
                    </Button>
                    <Button
                        size="sm"
                        variant={activeTab === 'builder' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('builder')}
                        className="text-xs h-8"
                    >
                        Builder
                    </Button>
                </div>
            </div>

            {/* Scenario Description Banner */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{scenario.description}</span>
            </div>

            {/* Pattern Visualizer Component */}
            {activeTab === 'all' && (
                <PatternExecutionVisualizer
                    key={scenario.id}
                    events={scenario.trace}
                    order={scenario.order}
                />
            )}

            {activeTab === 'factory' && (
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <FactoryMethodAnimation
                        events={scenario.trace.filter(e => e.phase === 'FACTORY')}
                        currentEventIndex={scenario.trace.filter(e => e.phase === 'FACTORY').length - 1}
                        order={scenario.order}
                    />
                </Card>
            )}

            {activeTab === 'strategy' && (
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <StrategyAnimation
                        events={scenario.trace}
                        currentEventIndex={scenario.trace.length - 1}
                        order={scenario.order}
                    />
                </Card>
            )}

            {activeTab === 'builder' && (
                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <BuilderAnimation
                        events={scenario.trace}
                        currentEventIndex={scenario.trace.length - 1}
                    />
                </Card>
            )}
        </div>
    );
}

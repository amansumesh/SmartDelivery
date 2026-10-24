'use client';
import React from 'react';
import { PatternExecutionEvent, Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowRight, Cog, Truck, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

interface FactoryMethodAnimationProps {
    events: PatternExecutionEvent[];
    currentEventIndex: number;
    order?: Order | null;
    selectedEventId?: number;
    onSelectEvent?: (event: PatternExecutionEvent) => void;
}

export default function FactoryMethodAnimation({
    events,
    currentEventIndex,
    order,
    selectedEventId,
    onSelectEvent,
}: FactoryMethodAnimationProps) {
    const visibleEvents = events.filter((_, idx) => idx <= currentEventIndex);
    const activeEvent = events[currentEventIndex];

    // Collect all unique vehicle types/instances evaluated so far
    const vehicleCreationEvents = visibleEvents.filter(e => e.eventType === 'VEHICLE_CREATED');
    const constraintEvents = visibleEvents.filter(e => e.eventType === 'CONSTRAINT_EVALUATED');
    const scoredEvents = visibleEvents.filter(e => e.eventType === 'CANDIDATE_SCORED');
    const winnerEvent = visibleEvents.find(e => e.eventType === 'WINNER_SELECTED');

    // Resolver lookup state
    const hasResolverTriggered = visibleEvents.some(e => e.eventType === 'FACTORY_RESOLVED');
    const latestFactoryLookup = [...visibleEvents].reverse().find(e => e.eventType === 'FACTORY_RESOLVED');

    return (
        <div className="space-y-6">
            {/* Stage header info */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-xs">
                        1
                    </span>
                    <h3 className="font-bold text-slate-900">
                        Phase 1: Factory Method Pattern
                    </h3>
                </div>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 font-medium">
                    Encapsulates Vehicle Creation &amp; Validation
                </Badge>
            </div>

            {/* Architecture Pipeline Animation: Order -> Resolver -> Factories -> Vehicles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
                {/* 1. Pending Order */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Input Order</span>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                            </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">
                            {order ? `Order #${order.id.slice(-6)}` : 'Pending Order'}
                        </h4>
                        <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Weight:</span>
                                <span className="font-semibold text-slate-800">{order?.packageWeight ?? '--'} kg</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Type:</span>
                                <Badge variant="outline" className={order?.packageType === 'FRAGILE' ? 'bg-amber-50 text-amber-700 border-amber-300 text-[10px]' : 'text-[10px]'}>
                                    {order?.packageType ?? '--'}
                                </Badge>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-500">Priority:</span>
                                <span className="font-bold text-red-600">{order?.priority ?? '--'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1">
                        <span>Requires compliant vehicle</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 ml-auto" />
                    </div>
                </div>

                {/* 2. VehicleFactoryResolver */}
                <div className={`p-4 rounded-xl border transition-all duration-300 shadow-sm flex flex-col justify-between ${
                    hasResolverTriggered 
                        ? 'border-red-300 bg-red-50/60' 
                        : 'border-slate-200 bg-slate-50/60 opacity-70'
                }`}>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold tracking-wider text-red-700 uppercase flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5" /> Resolver
                            </span>
                            {hasResolverTriggered && (
                                <Badge className="bg-red-600 text-white text-[10px] font-bold">Active</Badge>
                            )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">
                            VehicleFactoryResolver
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Queries strategy map by Document type:
                        </p>
                        <div className="mt-2.5 p-2 bg-slate-900 text-slate-200 rounded text-[11px] font-mono">
                            Map.of(&quot;BIKE&quot;, &quot;VAN&quot;, &quot;TRUCK&quot;)
                        </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-red-200 text-[11px] text-red-800">
                        {latestFactoryLookup ? (
                            <span className="font-medium">
                                Resolving &rarr; <span className="font-bold underline text-red-700">{latestFactoryLookup.vehicleType}</span>
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">Waiting for lookup...</span>
                        )}
                    </div>
                </div>

                {/* 3. Concrete Factories */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                                <Cog className="w-3.5 h-3.5 text-slate-500" /> Concrete Factories
                            </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            VehicleFactory Implementations
                        </h4>
                        <div className="mt-2 space-y-1.5">
                            {(['BIKE', 'VAN', 'TRUCK'] as const).map(type => {
                                const isTarget = latestFactoryLookup?.vehicleType === type;
                                const isCreated = vehicleCreationEvents.some(e => e.vehicleType === type);
                                return (
                                    <div
                                        key={type}
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between border transition-all ${
                                            isTarget
                                                ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-sm scale-[1.02]'
                                                : isCreated
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                : 'text-slate-400 border-transparent'
                                        }`}
                                    >
                                        <span>{type === 'BIKE' ? 'BikeFactory' : type === 'VAN' ? 'VanFactory' : 'TruckFactory'}</span>
                                        {isTarget && <span className="text-[10px] uppercase tracking-wider bg-white/20 px-1 rounded">Instantiating</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        Polymorphic creator method: <code className="text-xs font-mono text-blue-600 dark:text-blue-400">createVehicle()</code>
                    </div>
                </div>

                {/* 4. Winning Vehicle / Selection Output */}
                <div className={`p-4 rounded-xl border transition-all duration-300 shadow-sm flex flex-col justify-between ${
                    winnerEvent 
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-700 ring-2 ring-emerald-500/30' 
                        : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30'
                }`}>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> Selected Vehicle
                            </span>
                            {winnerEvent && <Badge className="bg-emerald-600 text-[10px]">Selected</Badge>}
                        </div>
                        {winnerEvent ? (
                            <div>
                                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-emerald-600" />
                                    {winnerEvent.vehicleType}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    from <span className="font-semibold">{winnerEvent.warehouseName}</span>
                                </p>
                                <div className="mt-3 p-2 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Allocation Score:</span>
                                        <span className="font-bold text-emerald-600">
                                            {typeof winnerEvent.details?.finalScore === 'number'
                                                ? winnerEvent.details.finalScore.toFixed(2)
                                                : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Distance:</span>
                                        <span>{winnerEvent.details?.distance ? `${Number(winnerEvent.details.distance).toFixed(1)} km` : '--'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400">
                                <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs italic">Evaluating candidate pool...</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                        Ready for Phase 2: Builder
                    </div>
                </div>
            </div>

            {/* Evaluated Candidates Grid (Live Evaluation cards) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        Vehicle Instances &amp; Constraint Evaluation ({vehicleCreationEvents.length} Created)
                    </h4>
                    <span className="text-xs text-slate-500">
                        Click any event below to inspect the corresponding Java class and method
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {vehicleCreationEvents.map(vEvent => {
                        const vType = vEvent.vehicleType;
                        const vWh = vEvent.warehouseName;
                        const capacity = vEvent.details?.capacity;
                        const costPerKm = vEvent.details?.costPerKm;
                        const supportsFragile = vEvent.details?.supportsFragile;

                        // Find corresponding rejection or score event
                        const rejection = constraintEvents.find(
                            e => e.vehicleType === vType && e.warehouseName === vWh && e.status === 'REJECTED'
                        );
                        const scored = scoredEvents.find(
                            e => e.vehicleType === vType && e.warehouseName === vWh
                        );
                        const isWinner = winnerEvent?.vehicleType === vType && winnerEvent?.warehouseName === vWh;

                        const isSelected = selectedEventId === vEvent.sequence || (rejection && selectedEventId === rejection.sequence);

                        return (
                            <Card
                                key={vEvent.sequence}
                                onClick={() => onSelectEvent?.(rejection || vEvent)}
                                className={`p-4 cursor-pointer transition-all border ${
                                    isSelected
                                        ? 'ring-2 ring-indigo-500 border-indigo-500'
                                        : isWinner
                                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10'
                                        : rejection
                                        ? 'border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-md ${
                                            isWinner ? 'bg-emerald-100 text-emerald-700' :
                                            rejection ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            <Truck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                                {vEvent.details?.concreteClass || vType}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {vWh}
                                            </div>
                                        </div>
                                    </div>
                                    {isWinner ? (
                                        <Badge className="bg-emerald-600 text-[10px]">WINNER</Badge>
                                    ) : rejection ? (
                                        <Badge variant="destructive" className="text-[10px]">REJECTED</Badge>
                                    ) : scored ? (
                                        <Badge variant="secondary" className="text-[10px]">ELIGIBLE</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px]">EVALUATING</Badge>
                                    )}
                                </div>

                                {/* Vehicle properties created by Factory */}
                                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Capacity</span>
                                        <span className="font-medium">{capacity} kg</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Cost / km</span>
                                        <span className="font-medium">₹{costPerKm}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Fragile</span>
                                        <span className={`font-medium ${supportsFragile ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {supportsFragile ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>

                                {/* Rule constraint or Scoring Outcome */}
                                {rejection ? (
                                    <div className="mt-3 p-2 rounded bg-red-100/60 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300">
                                        <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                                        <div className="leading-tight">
                                            <span className="font-semibold">Constraint Failed:</span> {rejection.rejectionReason}
                                        </div>
                                    </div>
                                ) : scored ? (
                                    <div className="mt-3 p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                            <span>Constraints Passed</span>
                                        </div>
                                        <div className="font-bold text-emerald-700 dark:text-emerald-300">
                                            Score: {typeof scored.details?.finalScore === 'number' ? scored.details.finalScore.toFixed(1) : '--'}
                                        </div>
                                    </div>
                                ) : null}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

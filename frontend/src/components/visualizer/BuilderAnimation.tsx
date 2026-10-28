'use client';
import React from 'react';
import { PatternExecutionEvent } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Hammer, ShieldCheck, Box, FileCode, Check } from 'lucide-react';

interface BuilderAnimationProps {
    events: PatternExecutionEvent[];
    currentEventIndex: number;
    selectedEventId?: number;
    onSelectEvent?: (event: PatternExecutionEvent) => void;
}

// Exact methods in DeliveryPlan.java in order
const BUILDER_STEPS = [
    { method: 'new DeliveryPlan.Builder()', field: 'initialization', label: 'Builder Initialized' },
    { method: '.order(order)', field: 'order', label: 'Order Reference' },
    { method: '.warehouse(warehouse)', field: 'warehouse', label: 'Warehouse Reference' },
    { method: '.vehicle(vehicle)', field: 'vehicle', label: 'Vehicle Reference' },
    { method: '.priority(priority)', field: 'priority', label: 'Priority String' },
    { method: '.distance(distance)', field: 'distance', label: 'Distance (km)' },
    { method: '.estimatedCost(estimatedCost)', field: 'estimatedCost', label: 'Estimated Cost (₹)' },
    { method: '.estimatedTime(estimatedTime)', field: 'estimatedTime', label: 'Estimated Time (mins)' },
    { method: '.allocationScore(allocationScore)', field: 'allocationScore', label: 'Score Value' },
    { method: '.fragileHandling(fragileHandling)', field: 'fragileHandling', label: 'Fragile Handling Flag' },
    { method: '.insurance(insurance)', field: 'insurance', label: 'Insurance Flag' },
    { method: '.expressDelivery(expressDelivery)', field: 'expressDelivery', label: 'Express Delivery Flag' },
    { method: '.reason(reason)', field: 'reason', label: 'Allocation Reason' },
    { method: '.build()', field: 'build', label: 'Mandatory Validation & Build' },
];

export default function BuilderAnimation({
    events,
    currentEventIndex,
    selectedEventId,
    onSelectEvent,
}: BuilderAnimationProps) {
    const visibleEvents = events.filter((_, idx) => idx <= currentEventIndex);
    
    // Find active or completed builder events
    const builderEvents = visibleEvents.filter(e => e.phase === 'BUILDER');
    const isBuildComplete = builderEvents.some(e => e.eventType === 'BUILD_COMPLETE');
    const isPersisted = builderEvents.some(e => e.eventType === 'PERSIST_COMPLETE');

    // Build plan snapshot object from visible field events
    const planSnapshot: Record<string, React.ReactNode> = {};
    builderEvents.forEach(e => {
        if (e.fieldName && e.fieldValue !== undefined) {
            planSnapshot[e.fieldName] = String(e.fieldValue);
        }
    });

    return (
        <div className="space-y-6">
            {/* Stage header info */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-xs">
                        3
                    </span>
                    <h3 className="font-bold text-slate-900">
                        Phase 3: Builder Pattern (DeliveryPlan.Builder)
                    </h3>
                </div>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 font-medium">
                    Fluent Step-by-Step Construction &amp; Validation
                </Badge>
            </div>

            {/* Split View: Left = Real Java Builder Code Chain, Right = Live DeliveryPlan Object Assembly */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left: Animated Builder Method Invocations */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                            <FileCode className="w-3.5 h-3.5 text-red-600" /> Method Chain Execution
                        </span>
                        <span className="text-[11px] text-slate-400">
                            {builderEvents.length} / {BUILDER_STEPS.length} calls executed
                        </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto shadow-inner space-y-1">
                        <div className="text-slate-500">{"// Concrete Step-by-Step Invocation:"}</div>
                        {BUILDER_STEPS.map((step, idx) => {
                            const matchingEvent = builderEvents.find(
                                e => e.builderMethod === step.method || (step.field === 'build' && e.eventType === 'BUILD_COMPLETE')
                            );
                            const isExecuted = !!matchingEvent;
                            const isLatest = builderEvents.length > 0 && builderEvents[builderEvents.length - 1]?.builderMethod === step.method;
                            const isSelected = matchingEvent && selectedEventId === matchingEvent.sequence;

                            return (
                                <div
                                    key={step.method}
                                    onClick={() => matchingEvent && onSelectEvent?.(matchingEvent)}
                                    className={`px-2 py-1.5 rounded transition-all flex items-center justify-between cursor-pointer ${
                                        isSelected
                                            ? 'bg-red-950/80 text-white ring-1 ring-red-500'
                                            : isLatest
                                            ? 'bg-red-950/60 text-red-200 font-bold border-l-2 border-red-500 pl-3'
                                            : isExecuted
                                            ? 'text-emerald-400 hover:bg-slate-900'
                                            : 'text-slate-600 opacity-40'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                                            isExecuted ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                            {isExecuted ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                                        </span>
                                        <span>{step.method}</span>
                                    </div>
                                    {isExecuted && (
                                        <span className="text-[10px] text-slate-400 font-sans truncate max-w-[150px]">
                                            {matchingEvent?.fieldValue !== undefined ? String(matchingEvent.fieldValue) : 'passed'}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Live Assembling Object Preview */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                            <Box className="w-3.5 h-3.5" /> Live Object: DeliveryPlan
                        </span>
                        {isBuildComplete ? (
                            <Badge className="bg-emerald-600 text-[10px] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Immutable &amp; Validated
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
                                Constructing...
                            </Badge>
                        )}
                    </div>

                    <Card className={`p-4 transition-all duration-300 border ${
                        isBuildComplete
                            ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-md ring-1 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Target Entity</span>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                    com.smartdelivery.builder.DeliveryPlan
                                </h4>
                            </div>
                            <Hammer className={`w-5 h-5 ${isBuildComplete ? 'text-emerald-500' : 'text-indigo-500 animate-pulse'}`} />
                        </div>

                        {/* Fields being populated step-by-step */}
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Order</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                                    {planSnapshot.order || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Warehouse</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                                    {planSnapshot.warehouse || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Vehicle</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate block">
                                    {planSnapshot.vehicle || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Priority</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {planSnapshot.priority || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Distance</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {planSnapshot.distance || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Estimated Cost</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {planSnapshot.estimatedCost || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Estimated Time</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {planSnapshot.estimatedTime || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>

                            <div className="p-2 rounded bg-slate-100/60 dark:bg-slate-800/60">
                                <span className="text-slate-400 text-[10px] block">Allocation Score</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {planSnapshot.allocationScore || <span className="text-slate-400 italic">pending...</span>}
                                </span>
                            </div>
                        </div>

                        {/* Validations check in .build() */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                DeliveryPlan.build() Validation Contract:
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                    {planSnapshot.order ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                                    )}
                                    <span>Mandatory Order reference non-null</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                    {planSnapshot.warehouse ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                                    )}
                                    <span>Mandatory Warehouse reference non-null</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                    {planSnapshot.vehicle ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                                    )}
                                    <span>Mandatory Vehicle reference non-null</span>
                                </div>
                            </div>

                            {isPersisted && (
                                <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                    <span>Saved to Database</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

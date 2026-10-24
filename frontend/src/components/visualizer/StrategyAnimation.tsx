'use client';
import React from 'react';
import { PatternExecutionEvent, Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Compass, Zap, PiggyBank, Route, CheckCircle2, Sliders, ArrowRight, Award } from 'lucide-react';

interface StrategyAnimationProps {
    events: PatternExecutionEvent[];
    currentEventIndex: number;
    order?: Order | null;
    selectedEventId?: number;
    onSelectEvent?: (event: PatternExecutionEvent) => void;
}

export default function StrategyAnimation({
    events,
    currentEventIndex,
    order,
    selectedEventId,
    onSelectEvent,
}: StrategyAnimationProps) {
    const visibleEvents = events.filter((_, idx) => idx <= currentEventIndex);
    const strategyEvents = events.filter(e => e.phase === 'STRATEGY');
    const visibleStrategyEvents = visibleEvents.filter(e => e.phase === 'STRATEGY');

    // Find active strategy selection event
    const strategySelectedEvent = visibleStrategyEvents.find(e => e.eventType === 'STRATEGY_SELECTED');
    const scoredCandidates = visibleStrategyEvents.filter(e => e.eventType === 'CANDIDATE_SCORED');
    const winnerEvent = visibleStrategyEvents.find(e => e.eventType === 'WINNER_SELECTED');

    const activeStrategyId = strategySelectedEvent?.details?.strategyId || 'BALANCED';
    const activeStrategyName = strategySelectedEvent?.details?.strategyName || 'Strategy Evaluator';
    const strategyDescription = strategySelectedEvent?.details?.description || 'Dynamically evaluates candidate scoring metrics.';

    const strategiesList = [
        {
            id: 'BALANCED',
            name: 'Balanced Strategy',
            icon: Compass,
            color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
            weights: 'Distance 35% | Cost 25% | Priority 20% | Cap 10% | Time 10%'
        },
        {
            id: 'FASTEST',
            name: 'Fastest Delivery',
            icon: Zap,
            color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
            weights: 'Time 50% | Priority 25% | Distance 15% | Cost 5% | Cap 5%'
        },
        {
            id: 'COST_SAVER',
            name: 'Cost Saver (Economic)',
            icon: PiggyBank,
            color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
            weights: 'Cost 50% | Capacity 25% | Distance 15% | Priority 5% | Time 5%'
        },
        {
            id: 'DISTANCE',
            name: 'Distance Minimizer',
            icon: Route,
            color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
            weights: 'Distance 60% | Cost 15% | Time 15% | Priority 5% | Cap 5%'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Phase header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-xs">
                        2
                    </span>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        Phase 2: Strategy Pattern
                    </h3>
                </div>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 font-medium">
                    Interchangeable Routing &amp; Scoring Algorithms
                </Badge>
            </div>

            {/* Strategy Selection Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {strategiesList.map((strat) => {
                    const isSelected = activeStrategyId === strat.id && Boolean(strategySelectedEvent);
                    const Icon = strat.icon;

                    return (
                        <div
                            key={strat.id}
                            className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                                isSelected
                                    ? 'ring-2 ring-red-600 shadow-sm border-red-500 bg-red-50 text-red-950 scale-[1.02]'
                                    : 'border-slate-200 bg-white opacity-70'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-1.5 rounded-lg shadow-xs ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    {isSelected && (
                                        <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0 font-bold">
                                            ACTIVE
                                        </Badge>
                                    )}
                                </div>
                                <h4 className="font-bold text-xs text-slate-900">
                                    {strat.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                    {strat.weights}
                                </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                                @Component("{strat.id}")
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Context & Evaluation Pipeline */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Context: AllocationStrategyContext
                        </span>
                    </div>
                    {strategySelectedEvent ? (
                        <div className="text-xs text-red-800 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            Active Strategy: <strong className="font-bold">{activeStrategyName}</strong>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 italic">Awaiting strategy resolution step...</div>
                    )}
                </div>

                <p className="text-xs text-slate-600 mb-4">
                    {strategyDescription}
                </p>

                {/* Scored Candidates Ranking */}
                <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                        <span>Strategy Evaluation &amp; Dynamic Scoring Matrix</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                            {scoredCandidates.length} candidate(s) evaluated
                        </span>
                    </div>

                    {scoredCandidates.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                            Candidates will be evaluated and ranked here as playback advances.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {scoredCandidates.map((ev, index) => {
                                const isWinner = winnerEvent && ev.vehicleId === winnerEvent.vehicleId;
                                const isCurSelected = selectedEventId === ev.sequence;
                                const details = ev.details || {};

                                return (
                                    <div
                                        key={ev.sequence}
                                        onClick={() => onSelectEvent?.(ev)}
                                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                                            isCurSelected
                                                ? 'ring-2 ring-red-600 bg-white shadow-xs'
                                                : isWinner
                                                ? 'border-emerald-400 bg-emerald-50/60'
                                                : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${isWinner ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                                    {isWinner ? <Award className="w-4 h-4" /> : <Route className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900">
                                                        {ev.vehicleType}
                                                    </span>
                                                    <span className="text-slate-500 text-[11px] ml-2">
                                                        from {ev.warehouseName}
                                                    </span>
                                                </div>
                                                {isWinner && (
                                                    <Badge className="bg-emerald-600 text-white text-[10px] py-0 font-bold">
                                                        OPTIMAL ALLOCATION
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-bold text-sm text-red-600">
                                                        {details.finalScore ? Number(details.finalScore).toFixed(1) : '--'} pts
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {details.distance ? `${Number(details.distance).toFixed(1)} km` : ''} • {details.cost ? `₹${Number(details.cost).toFixed(0)}` : ''} • {details.time ? `${details.time} min` : ''}
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                                            </div>
                                        </div>

                                        {/* Score breakdown metrics pill row */}
                                        {details.finalScore && (
                                            <div className="grid grid-cols-5 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                                                <div className="bg-slate-100/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-center">
                                                    <span className="text-slate-400 block text-[9px]">Distance</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{Number(details.distanceScore || 0).toFixed(0)}</span>
                                                </div>
                                                <div className="bg-slate-100/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-center">
                                                    <span className="text-slate-400 block text-[9px]">Cost</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{Number(details.costScore || 0).toFixed(0)}</span>
                                                </div>
                                                <div className="bg-slate-100/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-center">
                                                    <span className="text-slate-400 block text-[9px]">Priority</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{Number(details.priorityScore || 0).toFixed(0)}</span>
                                                </div>
                                                <div className="bg-slate-100/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-center">
                                                    <span className="text-slate-400 block text-[9px]">Capacity</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{Number(details.capacityScore || 0).toFixed(0)}</span>
                                                </div>
                                                <div className="bg-slate-100/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-center">
                                                    <span className="text-slate-400 block text-[9px]">Time</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{Number(details.timeScore || 0).toFixed(0)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

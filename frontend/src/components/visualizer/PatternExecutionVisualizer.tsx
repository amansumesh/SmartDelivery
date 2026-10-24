'use client';
import React, { useState, useEffect, useRef } from 'react';
import { PatternExecutionEvent, Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
    Play, Pause, RotateCcw, StepForward, FastForward, 
    Code2, Layers, CheckCircle2, ChevronRight, AlertCircle 
} from 'lucide-react';
import FactoryMethodAnimation from './FactoryMethodAnimation';
import StrategyAnimation from './StrategyAnimation';
import BuilderAnimation from './BuilderAnimation';
import CodeInspector from './CodeInspector';

interface PatternExecutionVisualizerProps {
    events: PatternExecutionEvent[];
    order?: Order | null;
    onComplete?: () => void;
}

export default function PatternExecutionVisualizer({
    events,
    order,
    onComplete,
}: PatternExecutionVisualizerProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // 1 sec per step
    const [selectedEvent, setSelectedEvent] = useState<PatternExecutionEvent | null>(null);
    const [showCodeInspector, setShowCodeInspector] = useState<boolean>(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const totalEvents = events.length;
    const currentEvent = events[currentIndex] || events[0];

    // Determine current phase from active event
    const activePhase = currentEvent ? currentEvent.phase : 'FACTORY';
    const isCompleted = currentIndex >= totalEvents - 1;

    // Default select event when current changes if user hasn't explicitly clicked one
    useEffect(() => {
        if (currentEvent) {
            setSelectedEvent(currentEvent);
        }
    }, [currentIndex]);

    // Timer playback
    useEffect(() => {
        if (isPlaying && !isCompleted && totalEvents > 0) {
            timerRef.current = setTimeout(() => {
                setCurrentIndex(prev => {
                    const next = prev + 1;
                    if (next >= totalEvents - 1) {
                        setIsPlaying(false);
                    }
                    return next;
                });
            }, playbackSpeed);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentIndex, isCompleted, totalEvents, playbackSpeed]);

    const handlePlayPause = () => {
        if (isCompleted) {
            setCurrentIndex(0);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleReplay = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setCurrentIndex(0);
        setIsPlaying(true);
    };

    const handleStepForward = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsPlaying(false);
        if (currentIndex < totalEvents - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsPlaying(false);
        setCurrentIndex(totalEvents - 1);
        onComplete?.();
    };

    if (!events || events.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500 opacity-80" />
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Execution Trace Unavailable</h4>
                <p className="text-xs text-slate-400 mt-1">Allocation completed via standard pathway.</p>
            </div>
        );
    }

    const factoryEventsCount = events.filter(e => e.phase === 'FACTORY').length;
    const strategyEventsCount = events.filter(e => e.phase === 'STRATEGY').length;
    const builderEventsCount = events.filter(e => e.phase === 'BUILDER').length;
    const progressPercent = Math.round(((currentIndex + 1) / totalEvents) * 100);

    return (
        <div className="space-y-6">
            {/* Top Control Bar & State Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-red-600" />
                        <h2 className="text-base font-bold text-slate-900">
                            Pattern Execution Visualizer
                        </h2>
                        <Badge variant="outline" className="text-xs uppercase font-mono bg-red-50 text-red-700 border-red-300 font-bold">
                            {activePhase} PHASE
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Step {currentIndex + 1} of {totalEvents} &bull; {currentEvent?.message || 'Processing...'}
                    </p>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
                    <Button
                        size="sm"
                        variant={isPlaying ? "secondary" : "default"}
                        onClick={handlePlayPause}
                        className={`gap-1.5 text-xs font-semibold ${isPlaying ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isPlaying ? 'Pause' : isCompleted ? 'Replay' : 'Play'}
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleStepForward}
                        disabled={isCompleted}
                        className="gap-1.5 text-xs border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700"
                    >
                        <StepForward className="w-3.5 h-3.5" /> Step
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReplay}
                        className="gap-1.5 text-xs border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSkip}
                        className="gap-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <FastForward className="w-3.5 h-3.5" /> Skip to End
                    </Button>

                    <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                    <Button
                        size="sm"
                        variant={showCodeInspector ? "default" : "outline"}
                        onClick={() => setShowCodeInspector(!showCodeInspector)}
                        className={`gap-1.5 text-xs font-semibold ${showCodeInspector ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700'}`}
                    >
                        <Code2 className="w-3.5 h-3.5" />
                        {showCodeInspector ? 'Hide Code' : 'Show Code'}
                    </Button>
                </div>
            </div>

            {/* Progress Bar & Phase Stepper */}
            <div className="space-y-2">
                <div className="grid grid-cols-3 text-xs font-semibold">
                    <span className={activePhase === 'FACTORY' ? 'text-red-600 font-bold flex items-center gap-1' : 'text-slate-500'}>
                        Phase 1: Factory Method
                    </span>
                    <span className={`text-center ${activePhase === 'STRATEGY' ? 'text-red-600 font-bold flex items-center justify-center gap-1' : 'text-slate-500'}`}>
                        Phase 2: Strategy Pattern
                    </span>
                    <span className={`text-right ${activePhase === 'BUILDER' ? 'text-red-600 font-bold flex items-center justify-end gap-1' : 'text-slate-500'}`}>
                        Phase 3: Builder Pattern
                    </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div 
                        className="bg-red-600 h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Active Visualization Container */}
            <div className="space-y-8">
                {/* 1. Factory phase */}
                <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                    <FactoryMethodAnimation
                        events={events.filter(e => e.phase === 'FACTORY')}
                        currentEventIndex={Math.min(currentIndex, factoryEventsCount - 1)}
                        order={order}
                        selectedEventId={selectedEvent?.sequence}
                        onSelectEvent={ev => setSelectedEvent(ev)}
                    />
                </Card>

                {/* 2. Strategy phase */}
                {strategyEventsCount > 0 && currentIndex >= factoryEventsCount - 1 && (
                    <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 animate-in fade-in duration-500">
                        <StrategyAnimation
                            events={events}
                            currentEventIndex={currentIndex}
                            order={order}
                            selectedEventId={selectedEvent?.sequence}
                            onSelectEvent={ev => setSelectedEvent(ev)}
                        />
                    </Card>
                )}

                {/* 3. Builder phase */}
                {currentIndex >= factoryEventsCount + strategyEventsCount - 1 && (
                    <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 animate-in fade-in duration-500">
                        <BuilderAnimation
                            events={events}
                            currentEventIndex={currentIndex}
                            selectedEventId={selectedEvent?.sequence}
                            onSelectEvent={ev => setSelectedEvent(ev)}
                        />
                    </Card>
                )}
            </div>

            {/* Bottom Row: Real Java Code Inspector & Event Trace Log */}
            {showCodeInspector && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CodeInspector activeEvent={selectedEvent || currentEvent} />
                    </div>

                    {/* Compact Interactive Timeline */}
                    <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[380px]">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Trace Events ({totalEvents})
                            </span>
                            <span className="text-[10px] text-slate-400">Click to inspect</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-sans text-xs">
                            {events.map((ev, idx) => {
                                const isCurrent = idx === currentIndex;
                                const isSelected = selectedEvent?.sequence === ev.sequence;
                                const isPast = idx < currentIndex;

                                return (
                                    <div
                                        key={ev.sequence}
                                        onClick={() => {
                                            setSelectedEvent(ev);
                                            setCurrentIndex(idx);
                                        }}
                                        className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                            isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                                                : isCurrent
                                                ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 text-blue-800 dark:text-blue-300'
                                                : isPast
                                                ? 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                                : 'border-transparent text-slate-400 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-slate-400">
                                                #{ev.sequence} [{ev.phase}]
                                            </span>
                                            {ev.status === 'REJECTED' ? (
                                                <Badge variant="destructive" className="text-[9px] px-1 py-0">REJECTED</Badge>
                                            ) : ev.status === 'SUCCESS' ? (
                                                <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300 px-1 py-0">SUCCESS</Badge>
                                            ) : null}
                                        </div>
                                        <div className="text-xs mt-1 truncate">
                                            {ev.message}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

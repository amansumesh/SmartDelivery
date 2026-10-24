'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { allocateOrder, getOrders } from '@/lib/api';
import { Order, AllocationResult, AllocationCandidate } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Truck, CheckCircle2, Clock, IndianRupee, Activity, Box, ShieldCheck, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import PatternExecutionVisualizer from '@/components/visualizer/PatternExecutionVisualizer';
import { Eye, Layers } from 'lucide-react';

function AllocationContent() {
    const searchParams = useSearchParams();
    const initialOrderId = searchParams.get('orderId');
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || '');
    const [selectedStrategy, setSelectedStrategy] = useState<string>('AUTO');
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [result, setResult] = useState<AllocationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'visualizer' | 'summary'>('visualizer');

    useEffect(() => {
        getOrders().then(o => {
            setOrders(o);
            if (initialOrderId) {
                const found = o.find(x => x.id === initialOrderId);
                if (found) setActiveOrder(found);
            }
        });
    }, [initialOrderId]);

    useEffect(() => {
        if(initialOrderId) {
            handleAllocate(initialOrderId, selectedStrategy);
        }
    }, [initialOrderId]);

    const handleAllocate = async (id: string, strat?: string) => {
        if(!id) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const strategyParam = (strat || selectedStrategy) === 'AUTO' ? undefined : (strat || selectedStrategy);
            const res = await allocateOrder(id, strategyParam);
            setResult(res);
            const found = orders.find(x => x.id === id);
            if (found) setActiveOrder(found);
        } catch(e: any) {
            setError(e.response?.data?.error || e.message);
        } finally {
            setLoading(false);
        }
    };

    const renderCandidateCard = (c: AllocationCandidate, isRecommended = false) => (
        <Card className={`relative overflow-hidden bg-white ${isRecommended ? 'ring-2 ring-red-600 shadow-md border-0' : 'shadow-sm border-slate-200'}`}>
            {isRecommended && (
                <div className="absolute top-0 inset-x-0 h-1 bg-red-600" />
            )}
            <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-200">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                            {c.warehouse.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <Truck className="w-4 h-4 text-red-600" /> {c.vehicle.type} 
                        </div>
                    </div>
                    {isRecommended && <Badge className="bg-red-600 text-white hover:bg-red-700 border-0 flex gap-1 items-center font-bold text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> BEST PLAN</Badge>}
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400"/> Distance</div>
                        <div className="font-semibold text-slate-900">{c.distance.toFixed(1)} km</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400"/> Est. Cost</div>
                        <div className="font-semibold text-slate-900">₹{c.estimatedCost.toFixed(0)}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400"/> Est. Time</div>
                        <div className="font-semibold text-slate-900">{c.estimatedTime} min</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-red-600"/> Score</div>
                        <div className="font-extrabold text-red-600">{c.finalScore.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                    </div>
                </div>

                {isRecommended && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-950 border border-red-200">
                        <span className="font-bold text-red-800 block mb-1">Why this was selected:</span>
                        Selected because it provides the best balance between distance, cost, capacity and delivery priority.
                        
                        <div className="mt-3 space-y-1 text-xs border-t border-red-200 pt-2 font-medium">
                            <div className="flex justify-between text-slate-700"><span>Distance Score</span> <span className="font-bold text-slate-900">{c.distanceScore.toFixed(0)}</span></div>
                            <div className="flex justify-between text-slate-700"><span>Cost Score</span> <span className="font-bold text-slate-900">{c.costScore.toFixed(0)}</span></div>
                            <div className="flex justify-between text-slate-700"><span>Priority Score</span> <span className="font-bold text-slate-900">{c.priorityScore.toFixed(0)}</span></div>
                            <div className="flex justify-between text-slate-700"><span>Capacity Score</span> <span className="font-bold text-slate-900">{c.capacityScore.toFixed(0)}</span></div>
                            <div className="flex justify-between text-slate-700"><span>Time Score</span> <span className="font-bold text-slate-900">{c.timeScore.toFixed(0)}</span></div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Allocation Engine</h1>
                    <p className="text-xs text-slate-500">Autonomous multi-criteria vehicle allocation &amp; plan builder</p>
                </div>

                {result && (
                    <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shadow-2xs">
                        <Button
                            size="sm"
                            variant={viewMode === 'visualizer' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('visualizer')}
                            className={`text-xs gap-1.5 h-8 ${viewMode === 'visualizer' ? 'bg-red-600 hover:bg-red-700 text-white font-semibold' : 'text-slate-600 hover:text-red-600'}`}
                        >
                            <Layers className="w-3.5 h-3.5" /> Pattern Visualizer
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'summary' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('summary')}
                            className={`text-xs gap-1.5 h-8 ${viewMode === 'summary' ? 'bg-red-600 hover:bg-red-700 text-white font-semibold' : 'text-slate-600 hover:text-red-600'}`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Result Summary
                        </Button>
                    </div>
                )}
            </div>
            
            <Card className="bg-white shadow-sm border border-slate-200">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select 
                            value={selectedOrderId} 
                            onValueChange={(val, _event) => {
                                const id = val ?? '';
                                setSelectedOrderId(id);
                                const found = orders.find(x => x.id === id);
                                if (found) setActiveOrder(found);
                            }}
                        >
                            <SelectTrigger className="w-full sm:max-w-md border-slate-200">
                                <SelectValue placeholder="Select an order to allocate" />
                            </SelectTrigger>
                            <SelectContent>
                                {orders.map(o => (
                                    <SelectItem key={o.id} value={o.id}>
                                        {o.destination} ({o.packageWeight}kg, {o.priority}, {o.status})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select 
                            value={selectedStrategy} 
                            onValueChange={(val, _event) => setSelectedStrategy(val ?? 'AUTO')}
                        >
                            <SelectTrigger className="w-full sm:w-[220px] border-slate-200">
                                <SelectValue placeholder="Strategy (Auto)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AUTO">Strategy: Auto-Detect</SelectItem>
                                <SelectItem value="BALANCED">Balanced Strategy</SelectItem>
                                <SelectItem value="FASTEST">Fastest Delivery (Express)</SelectItem>
                                <SelectItem value="COST_SAVER">Cost Saver (Economic)</SelectItem>
                                <SelectItem value="DISTANCE">Distance Minimizer</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button 
                            onClick={() => handleAllocate(selectedOrderId, selectedStrategy)} 
                            disabled={!selectedOrderId || loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold shrink-0 shadow-xs"
                        >
                            {loading ? "Allocating..." : "Run Allocation"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <Card className="bg-white shadow-sm border border-slate-200">
                    <CardContent className="p-10 flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <Layers className="w-6 h-6 animate-spin" />
                            <div className="text-base font-bold text-slate-900">Executing Factory Method &amp; Builder Pipeline...</div>
                        </div>
                        <p className="text-xs text-slate-500">Querying warehouses, resolving vehicle factories, and calculating constraints.</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-800 border border-red-300 rounded-lg text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && !loading && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Pattern Execution Visualizer View */}
                    {viewMode === 'visualizer' && (
                        <div className="space-y-8">
                            {result.executionTrace && result.executionTrace.length > 0 ? (
                                <PatternExecutionVisualizer
                                    events={result.executionTrace}
                                    order={activeOrder}
                                    onComplete={() => setViewMode('summary')}
                                />
                            ) : (
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                                    No trace events returned. Showing standard summary.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Result Summary View */}
                    {(viewMode === 'summary' || !result.executionTrace) && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold mb-4">Recommended Plan</h2>
                                {renderCandidateCard(result.recommendedPlan, true)}
                            </div>
                            
                            {result.alternatives.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Alternatives</h2>
                                    <div className="rounded-md border border-slate-200 overflow-hidden shadow-sm">
                                        <Table className="bg-white dark:bg-slate-900">
                                            <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                                                <TableRow>
                                                    <TableHead>Warehouse</TableHead>
                                                    <TableHead>Vehicle</TableHead>
                                                    <TableHead className="text-right">Distance (km)</TableHead>
                                                    <TableHead className="text-right">Cost</TableHead>
                                                    <TableHead className="text-right">Time (min)</TableHead>
                                                    <TableHead className="text-right">Score</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {result.alternatives.map((a, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-medium">{a.warehouse.name}</TableCell>
                                                        <TableCell><Badge variant="outline">{a.vehicle.type}</Badge></TableCell>
                                                        <TableCell className="text-right">{a.distance.toFixed(1)}</TableCell>
                                                        <TableCell className="text-right font-medium text-emerald-600">₹{a.estimatedCost.toFixed(0)}</TableCell>
                                                        <TableCell className="text-right">{a.estimatedTime}</TableCell>
                                                        <TableCell className="text-right font-bold text-red-600">{a.finalScore.toFixed(1)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Allocation() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AllocationContent />
        </Suspense>
    );
}

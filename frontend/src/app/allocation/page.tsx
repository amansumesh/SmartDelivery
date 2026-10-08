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

function AllocationContent() {
    const searchParams = useSearchParams();
    const initialOrderId = searchParams.get('orderId');
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || '');
    const [result, setResult] = useState<AllocationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        getOrders().then(o => setOrders(o.filter(x => x.status === 'PENDING')));
    }, []);

    useEffect(() => {
        if(initialOrderId) {
            handleAllocate(initialOrderId);
        }
    }, [initialOrderId]);

    const handleAllocate = async (id: string) => {
        if(!id) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setProgress(0);
        
        // Fake progress for UI effect to demonstrate the steps as requested
        const interval = setInterval(() => {
            setProgress(p => {
                if(p >= 90) { clearInterval(interval); return p; }
                return p + 20;
            });
        }, 300);

        try {
            const res = await allocateOrder(id);
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setResult(res);
                setLoading(false);
            }, 500); // small delay to show 100%
        } catch(e: any) {
            clearInterval(interval);
            setError(e.response?.data?.error || e.message);
            setLoading(false);
        }
    };

    const renderCandidateCard = (c: AllocationCandidate, isRecommended = false) => (
        <Card className={`relative overflow-hidden ${isRecommended ? 'ring-2 ring-indigo-500 shadow-xl border-0' : 'shadow-sm border-slate-200'}`}>
            {isRecommended && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            )}
            <CardHeader className="pb-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {c.warehouse.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <Truck className="w-4 h-4" /> {c.vehicle.type} 
                        </div>
                    </div>
                    {isRecommended && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 flex gap-1 items-center"><CheckCircle2 className="w-3 h-3" /> BEST PLAN</Badge>}
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> Distance</div>
                        <div className="font-semibold">{c.distance.toFixed(1)} km</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><IndianRupee className="w-3 h-3"/> Est. Cost</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">₹{c.estimatedCost.toFixed(0)}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Est. Time</div>
                        <div className="font-semibold">{c.estimatedTime} min</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Activity className="w-3 h-3"/> Score</div>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">{c.finalScore.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                    </div>
                </div>

                {isRecommended && (
                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm text-indigo-800 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-800">
                        <span className="font-semibold block mb-1">Why this was selected:</span>
                        Selected because it provides the best balance between distance, cost, capacity and delivery priority.
                        
                        <div className="mt-3 space-y-1 text-xs border-t border-indigo-100 dark:border-indigo-800/50 pt-2">
                            <div className="flex justify-between"><span>Distance Score</span> <span>{c.distanceScore.toFixed(0)}</span></div>
                            <div className="flex justify-between"><span>Cost Score</span> <span>{c.costScore.toFixed(0)}</span></div>
                            <div className="flex justify-between"><span>Priority Score</span> <span>{c.priorityScore.toFixed(0)}</span></div>
                            <div className="flex justify-between"><span>Capacity Score</span> <span>{c.capacityScore.toFixed(0)}</span></div>
                            <div className="flex justify-between"><span>Time Score</span> <span>{c.timeScore.toFixed(0)}</span></div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold">Allocation Engine</h1>
            
            <Card className="shadow-sm">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <Select value={selectedOrderId} onValueChange={(val, _event) => setSelectedOrderId(val ?? '')}>
                            <SelectTrigger className="w-full max-w-md">
                                <SelectValue placeholder="Select a pending order to allocate" />
                            </SelectTrigger>
                            <SelectContent>
                                {orders.map(o => (
                                    <SelectItem key={o.id} value={o.id}>
                                        {o.destination} ({o.packageWeight}kg, {o.priority})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={() => handleAllocate(selectedOrderId)} 
                            disabled={!selectedOrderId || loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Run Allocation
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <Card className="shadow-sm border-0 ring-1 ring-slate-200">
                    <CardContent className="p-10 flex flex-col items-center justify-center space-y-6">
                        <div className="text-lg font-medium text-slate-700">Finding optimal delivery plan...</div>
                        <div className="w-full max-w-md bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-500 w-full max-w-md">
                            <div className="flex gap-2 items-center"><CheckCircle2 className={`w-4 h-4 ${progress > 10 ? 'text-emerald-500' : 'text-slate-300'}`}/> Checking warehouses</div>
                            <div className="flex gap-2 items-center"><CheckCircle2 className={`w-4 h-4 ${progress > 30 ? 'text-emerald-500' : 'text-slate-300'}`}/> Calculating distances</div>
                            <div className="flex gap-2 items-center"><CheckCircle2 className={`w-4 h-4 ${progress > 50 ? 'text-emerald-500' : 'text-slate-300'}`}/> Checking vehicle capacity</div>
                            <div className="flex gap-2 items-center"><CheckCircle2 className={`w-4 h-4 ${progress > 70 ? 'text-emerald-500' : 'text-slate-300'}`}/> Evaluating delivery cost & time</div>
                            <div className="flex gap-2 items-center"><CheckCircle2 className={`w-4 h-4 ${progress > 90 ? 'text-emerald-500' : 'text-slate-300'}`}/> Selecting best option</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && !loading && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Recommended Plan</h2>
                        {renderCandidateCard(result.recommendedPlan, true)}
                    </div>
                    
                    {result.alternatives.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Alternatives</h2>
                            <div className="rounded-md border border-slate-200 overflow-hidden shadow-sm">
                                <Table className="bg-white">
                                    <TableHeader className="bg-slate-50">
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
                                                <TableCell className="text-right font-medium">₹{a.estimatedCost.toFixed(0)}</TableCell>
                                                <TableCell className="text-right">{a.estimatedTime}</TableCell>
                                                <TableCell className="text-right font-bold text-indigo-600">{a.finalScore.toFixed(1)}</TableCell>
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
    );
}

export default function Allocation() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AllocationContent />
        </Suspense>
    );
}

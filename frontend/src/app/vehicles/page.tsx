'use client';
import { useEffect, useState } from 'react';
import { getVehicles } from '@/lib/api';
import { Vehicle } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    useEffect(() => { getVehicles().then(setVehicles); }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fleet Vehicles</h1>
                <p className="text-xs text-slate-500 mt-0.5">Real-time fleet resource status, payload capacity, and operating rate</p>
            </div>
            <Card className="shadow-sm border-0 ring-1 ring-slate-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="pl-6">Type</TableHead>
                                <TableHead>Capacity (kg)</TableHead>
                                <TableHead>Cost/km (₹)</TableHead>
                                <TableHead>Max Range (km)</TableHead>
                                <TableHead>Fragile Support</TableHead>
                                <TableHead>Availability</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map(v => {
                                const isUnlimited = v.type === 'TRUCK' || (v.maxRange != null && v.maxRange >= 999999);
                                const maxRangeKm = isUnlimited ? 'Unlimited' : `${v.maxRange ?? (v.type === 'BIKE' ? 50 : 300)} km`;
                                return (
                                    <TableRow key={v.id}>
                                        <TableCell className="pl-6 font-medium">{v.type}</TableCell>
                                        <TableCell>{v.capacity} kg</TableCell>
                                        <TableCell>₹{v.costPerKm}</TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${isUnlimited ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {maxRangeKm}
                                            </span>
                                            {isUnlimited && (
                                                <span className="ml-1.5 text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                                                    Intercity / Long-Haul
                                                </span>
                                            )}
                                            {v.type === 'BIKE' && (
                                                <span className="ml-1.5 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium">
                                                    Urban Limit
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {v.supportsFragile ? <span className="text-emerald-600 text-sm">Yes</span> : <span className="text-red-500 text-sm">No</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={v.available ? 'default' : 'secondary'} className={v.available ? 'bg-emerald-500 text-white' : ''}>
                                                {v.available ? 'Available' : 'Busy'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

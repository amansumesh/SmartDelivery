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
            <h1 className="text-2xl font-bold">Vehicles</h1>
            <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="pl-6">Type</TableHead>
                                <TableHead>Capacity (kg)</TableHead>
                                <TableHead>Cost/km (₹)</TableHead>
                                <TableHead>Fragile Support</TableHead>
                                <TableHead>Availability</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell className="pl-6 font-medium">{v.type}</TableCell>
                                    <TableCell>{v.capacity}</TableCell>
                                    <TableCell>₹{v.costPerKm}</TableCell>
                                    <TableCell>
                                        {v.supportsFragile ? <span className="text-emerald-600 text-sm">Yes</span> : <span className="text-red-500 text-sm">No</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={v.available ? 'default' : 'secondary'} className={v.available ? 'bg-emerald-500 text-white' : ''}>
                                            {v.available ? 'Available' : 'Busy'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

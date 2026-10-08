'use client';
import { useEffect, useState } from 'react';
import { getWarehouses } from '@/lib/api';
import { Warehouse } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => { getWarehouses().then(setWarehouses); }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Warehouses</h1>
            <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Coordinates</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {warehouses.map(w => (
                                <TableRow key={w.id}>
                                    <TableCell className="pl-6 font-medium">{w.name}</TableCell>
                                    <TableCell>{w.location}</TableCell>
                                    <TableCell className="text-slate-500 font-mono text-xs">{w.latitude}, {w.longitude}</TableCell>
                                    <TableCell>{w.availableCapacity}</TableCell>
                                    <TableCell>
                                        <Badge variant={w.active ? 'default' : 'secondary'} className={w.active ? 'bg-emerald-500 text-white' : ''}>
                                            {w.active ? 'Active' : 'Inactive'}
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

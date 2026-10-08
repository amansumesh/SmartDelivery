'use client';
import { useEffect, useState } from 'react';
import { getOrders, deleteOrder } from '@/lib/api';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Trash, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');

    const fetchOrders = () => getOrders().then(setOrders);
    useEffect(() => { fetchOrders(); }, []);

    const handleDelete = async (id: string) => {
        if(confirm('Delete this order?')) {
            await deleteOrder(id);
            fetchOrders();
        }
    };

    const filtered = orders.filter(o => o.destination.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search));

    return (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Orders</h1>
                <Link href="/orders/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        <Plus className="w-4 h-4 mr-2" /> Create Order
                    </Button>
                </Link>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search destination or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
            </div>

            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Weight (kg)</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No orders found.</TableCell></TableRow>
                        ) : filtered.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                                <TableCell className="font-medium">{order.destination}</TableCell>
                                <TableCell>{order.packageWeight}</TableCell>
                                <TableCell><Badge variant="outline">{order.packageType}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={order.priority === 'URGENT' ? 'destructive' : order.priority === 'HIGH' ? 'default' : 'secondary'}>
                                        {order.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={order.status === 'ALLOCATED' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''} variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

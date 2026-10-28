'use client';
import { useEffect, useState } from 'react';
import { getOrders, deleteOrder } from '@/lib/api';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Trash, Search, Workflow } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage, search, and trigger consignment allocations</p>
                </div>
                <Link href="/orders/new">
                    <Button className="bg-red-600 hover:bg-red-700 text-white shadow-xs font-semibold cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" /> Create Order
                    </Button>
                </Link>
            </div>

            <Card className="shadow-sm border-0 ring-1 ring-slate-200">
                <div className="p-4 border-b border-slate-100 flex gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search destination or consignment ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-slate-50/50" />
                    </div>
                </div>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="pl-6">ID</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">No orders found.</TableCell></TableRow>
                            ) : filtered.map(order => (
                                <TableRow key={order.id} className="hover:bg-slate-50/70">
                                    <TableCell className="pl-6 font-mono text-xs font-semibold text-slate-700">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell className="font-medium text-slate-900">{order.destination}</TableCell>
                                    <TableCell className="text-slate-600">{order.packageWeight} kg</TableCell>
                                    <TableCell><Badge variant="outline" className="font-medium">{order.packageType}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={order.priority === 'URGENT' ? 'destructive' : order.priority === 'HIGH' ? 'default' : 'secondary'} className={order.priority === 'URGENT' ? 'bg-red-600 text-white' : ''}>
                                            {order.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={order.status === 'ALLOCATED' ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-medium' : 'bg-slate-100 text-slate-700 font-medium'} variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/allocation?orderId=${order.id}`}>
                                                <Button
                                                    size="sm"
                                                    variant={order.status === 'PENDING' ? 'default' : 'outline'}
                                                    className={`h-8 text-xs cursor-pointer ${
                                                        order.status === 'PENDING'
                                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs font-semibold'
                                                            : 'text-slate-700 hover:text-red-700 hover:bg-red-50'
                                                    }`}
                                                >
                                                    <Workflow className="w-3.5 h-3.5 mr-1" />
                                                    {order.status === 'PENDING' ? 'Allocate' : 'View Plan'}
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(order.id)}
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                title="Delete Order"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </div>
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

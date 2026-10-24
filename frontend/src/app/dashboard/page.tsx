'use client';
import { useEffect, useState } from 'react';
import { getOrders, getVehicles, getWarehouses } from '@/lib/api';
import { Order, Vehicle, Warehouse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Warehouse as WarehouseIcon, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getOrders(), getVehicles(), getWarehouses()]).then(([o, v, w]) => {
            setOrders(o);
            setVehicles(v);
            setWarehouses(w);
            setLoading(false);
        }).catch(e => {
            console.error(e);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center items-center h-full">Loading dashboard data...</div>;

    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const allocatedOrders = orders.filter(o => o.status === 'ALLOCATED').length;
    const availableVehicles = vehicles.filter(v => v.available).length;
    const activeWarehouses = warehouses.filter(w => w.active).length;

    const priorityData = [
        { name: 'Low', count: orders.filter(o => o.priority === 'LOW').length },
        { name: 'Normal', count: orders.filter(o => o.priority === 'NORMAL').length },
        { name: 'High', count: orders.filter(o => o.priority === 'HIGH').length },
        { name: 'Urgent', count: orders.filter(o => o.priority === 'URGENT').length },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations Dashboard</h1>
                    <p className="text-xs text-slate-500">Live order allocation and fleet resource status</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Hero Red Card */}
                <Card className="bg-red-600 text-white border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-100">Total Orders</CardTitle>
                        <div className="p-2 bg-red-700/50 rounded-lg">
                            <Package className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold">{orders.length}</div>
                        <p className="text-xs text-red-100 mt-1 font-medium">{pendingOrders} pending allocation</p>
                    </CardContent>
                </Card>

                {/* White Card with Red Accent */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Allocated Orders</CardTitle>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-900">{allocatedOrders}</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{orders.length ? Math.round((allocatedOrders / orders.length) * 100) : 0}% completion rate</p>
                    </CardContent>
                </Card>

                {/* White Card with Red Accent */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available Vehicles</CardTitle>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <Truck className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-900">{availableVehicles} <span className="text-base font-normal text-slate-400">/ {vehicles.length}</span></div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Ready for immediate dispatch</p>
                    </CardContent>
                </Card>

                {/* White Card with Red Accent */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Depots</CardTitle>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <WarehouseIcon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-900">{activeWarehouses} <span className="text-base font-normal text-slate-400">/ {warehouses.length}</span></div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">All fulfilment hubs online</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-3">
                        <CardTitle className="text-base font-bold text-slate-900">Orders by Priority Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip cursor={{fill: '#fef2f2'}} />
                                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

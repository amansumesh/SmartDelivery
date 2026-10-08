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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                        <p className="text-xs text-blue-200 mt-1">{pendingOrders} pending allocation</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-100">Allocated Orders</CardTitle>
                        <Clock className="h-4 w-4 text-indigo-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allocatedOrders}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Available Vehicles</CardTitle>
                        <Truck className="h-4 w-4 text-purple-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableVehicles} / {vehicles.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Active Warehouses</CardTitle>
                        <WarehouseIcon className="h-4 w-4 text-emerald-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeWarehouses} / {warehouses.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Orders by Priority</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

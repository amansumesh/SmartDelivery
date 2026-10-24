'use client';
import { useState } from 'react';
import { createOrder } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackagePlus } from 'lucide-react';
import { Order } from '@/types';

export default function CreateOrder() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        destination: '',
        destinationLatitude: '',
        destinationLongitude: '',
        packageWeight: '',
        packageType: 'STANDARD',
        priority: 'NORMAL',
        expressDelivery: false,
        insurance: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data: Partial<Order> = {
  ...form,
  destinationLatitude: parseFloat(form.destinationLatitude),
  destinationLongitude: parseFloat(form.destinationLongitude),
  packageWeight: parseFloat(form.packageWeight),
  packageType: form.packageType as Order['packageType'],
  priority: form.priority as Order['priority'],
};
            const res = await createOrder(data);
            router.push(`/allocation?orderId=${res.id}`);
        } catch(e) {
            console.error(e);
            alert("Error creating order");
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            setForm({
                ...form,
                destinationLatitude: position.coords.latitude.toString(),
                destinationLongitude: position.coords.longitude.toString()
            });
        }, () => {
            alert('Unable to retrieve your location');
        });
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <Card className="shadow-lg border-0 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <PackagePlus className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-slate-900">Create Delivery Order</CardTitle>
                                <CardDescription>Enter order details to find the best delivery plan</CardDescription>
                            </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleGetLocation} className="text-xs border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700">
                            📍 Use My Location
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Destination</Label>
                            <Input required value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="e.g. Chennai" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Latitude</Label>
                                <Input required type="number" step="any" value={form.destinationLatitude} onChange={e => setForm({...form, destinationLatitude: e.target.value})} placeholder="13.0827" />
                            </div>
                            <div className="space-y-2">
                                <Label>Longitude</Label>
                                <Input required type="number" step="any" value={form.destinationLongitude} onChange={e => setForm({...form, destinationLongitude: e.target.value})} placeholder="80.2707" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Package Weight (kg)</Label>
                                <Input required type="number" step="0.1" value={form.packageWeight} onChange={e => setForm({...form, packageWeight: e.target.value})} placeholder="18" />
                            </div>
                            <div className="space-y-2">
                                <Label>Package Type</Label>
                                <Select value={form.packageType} onValueChange={(val) => setForm({...form, packageType: val ?? form.packageType})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STANDARD">Standard</SelectItem>
                                        <SelectItem value="FRAGILE">Fragile</SelectItem>
                                        <SelectItem value="PERISHABLE">Perishable</SelectItem>
                                        <SelectItem value="HAZARDOUS">Hazardous</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={form.priority} onValueChange={(val) => setForm({...form, priority: val ?? form.priority})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <input type="checkbox" checked={form.expressDelivery} onChange={e => setForm({...form, expressDelivery: e.target.checked})} className="rounded border-slate-300 text-red-600 focus:ring-red-600" />
                                Express Delivery
                            </label>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <input type="checkbox" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} className="rounded border-slate-300 text-red-600 focus:ring-red-600" />
                                Insurance
                            </label>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 shadow-xs">
                            {loading ? 'Processing...' : 'Find Best Delivery Plan'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

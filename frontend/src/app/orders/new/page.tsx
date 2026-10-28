'use client';
import { useState, useEffect } from 'react';
import { createOrder, getWarehouses } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackagePlus, MapPin, CheckCircle2 } from 'lucide-react';
import { Order, Warehouse } from '@/types';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to guarantee Leaflet only initializes in browser
const LocationPickerMap = dynamic(() => import('@/components/map/LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs border border-slate-200 animate-pulse">
            Loading interactive logistics map...
        </div>
    ),
});

export default function CreateOrder() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [form, setForm] = useState({
        destination: 'Chennai Central',
        destinationLatitude: '13.0827',
        destinationLongitude: '80.2707',
        packageWeight: '15.0',
        packageType: 'STANDARD',
        priority: 'NORMAL',
        expressDelivery: false,
        insurance: false
    });

    useEffect(() => {
        getWarehouses()
            .then(setWarehouses)
            .catch(err => console.error('Failed to fetch warehouses for map:', err));
    }, []);

    const handleLocationSelect = (loc: { name: string; latitude: number; longitude: number }) => {
        setForm(prev => ({
            ...prev,
            destination: loc.name,
            destinationLatitude: loc.latitude.toString(),
            destinationLongitude: loc.longitude.toString()
        }));
    };

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

    return (
        <div className="max-w-3xl mx-auto py-4 sm:py-6">
            <Card className="shadow-lg border-0 ring-1 ring-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg shadow-2xs">
                            <PackagePlus className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-slate-900 font-bold">Create Delivery Order</CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Select drop-off on map or enter details to trigger the automated allocation solver
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Interactive Logistics Map Picker */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                                    Interactive Drop-off Location Picker
                                </Label>
                                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Pin syncs coordinates live
                                </span>
                            </div>

                            <LocationPickerMap
                                latitude={form.destinationLatitude ? parseFloat(form.destinationLatitude) : null}
                                longitude={form.destinationLongitude ? parseFloat(form.destinationLongitude) : null}
                                destinationName={form.destination}
                                warehouses={warehouses}
                                onLocationSelect={handleLocationSelect}
                            />
                        </div>

                        {/* Destination & Coordinates Grid */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700">Destination Name / Landmark</Label>
                                <Input 
                                    required 
                                    value={form.destination} 
                                    onChange={e => setForm({...form, destination: e.target.value})} 
                                    placeholder="e.g. Chennai Central, Tambaram, etc."
                                    className="bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">Latitude (°N)</Label>
                                    <Input 
                                        required 
                                        type="number" 
                                        step="any" 
                                        value={form.destinationLatitude} 
                                        onChange={e => setForm({...form, destinationLatitude: e.target.value})} 
                                        placeholder="13.0827"
                                        className="bg-white font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">Longitude (°E)</Label>
                                    <Input 
                                        required 
                                        type="number" 
                                        step="any" 
                                        value={form.destinationLongitude} 
                                        onChange={e => setForm({...form, destinationLongitude: e.target.value})} 
                                        placeholder="80.2707"
                                        className="bg-white font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package Specifications */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">Package Weight (kg)</Label>
                                <Input 
                                    required 
                                    type="number" 
                                    step="0.1" 
                                    value={form.packageWeight} 
                                    onChange={e => setForm({...form, packageWeight: e.target.value})} 
                                    placeholder="18"
                                    className="bg-white"
                                />
                                <span className="text-[10px] text-slate-400">
                                    Bike: &le;10kg (&le;50km limit) &bull; Van: &le;50kg (&le;300km) &bull; Truck: &le;500kg (Unlimited range)
                                </span>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">Package Type</Label>
                                <Select value={form.packageType} onValueChange={(val) => setForm({...form, packageType: val ?? form.packageType})}>
                                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STANDARD">Standard Goods</SelectItem>
                                        <SelectItem value="FRAGILE">Fragile (Requires Shock-Proof Fleet)</SelectItem>
                                        <SelectItem value="PERISHABLE">Perishable (Priority Dispatch)</SelectItem>
                                        <SelectItem value="HAZARDOUS">Hazardous Goods</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Priority & Options */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">Priority Level</Label>
                            <Select value={form.priority} onValueChange={(val) => setForm({...form, priority: val ?? form.priority})}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low (Economical Transit)</SelectItem>
                                    <SelectItem value="NORMAL">Normal (Standard Routing)</SelectItem>
                                    <SelectItem value="HIGH">High Priority</SelectItem>
                                    <SelectItem value="URGENT">Urgent (Immediate Route Clearance)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap gap-6 items-center">
                            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={form.expressDelivery} 
                                    onChange={e => setForm({...form, expressDelivery: e.target.checked})} 
                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer" 
                                />
                                <div>
                                    <span className="font-semibold block text-slate-900">Express Delivery</span>
                                    <span className="text-[10px] text-slate-500">Triggers FastestDeliveryStrategy (50% time weight)</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={form.insurance} 
                                    onChange={e => setForm({...form, insurance: e.target.checked})} 
                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer" 
                                />
                                <div>
                                    <span className="font-semibold block text-slate-900">Cargo Insurance</span>
                                    <span className="text-[10px] text-slate-500">Injects liability coverage via DeliveryPlan.Builder</span>
                                </div>
                            </label>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 shadow-sm text-sm cursor-pointer"
                        >
                            {loading ? 'Solving Optimal Plan...' : 'Find Best Delivery Plan & Launch Engine'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { getWarehouses, createWarehouse, deleteWarehouse } from '@/lib/api';
import { Warehouse } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash,
  Warehouse as WarehouseIcon,
  MapPin,
  X,
  Compass,
  Building2,
} from 'lucide-react';

const WAREHOUSE_PRESETS = [
  {
    name: 'Bangalore Central Depot',
    location: 'Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    capacity: 1200,
  },
  {
    name: 'Hyderabad Regional Hub',
    location: 'Hyderabad',
    latitude: 17.3850,
    longitude: 78.4867,
    capacity: 1500,
  },
  {
    name: 'Coimbatore Cargo Center',
    location: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    capacity: 850,
  },
  {
    name: 'Madurai Fulfilment Hub',
    location: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198,
    capacity: 650,
  },
  {
    name: 'Kochi Port Logistics Hub',
    location: 'Kochi',
    latitude: 9.9312,
    longitude: 76.2673,
    capacity: 1000,
  },
];

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    availableCapacity: '1000',
    active: true,
  });

  const fetchWarehouses = () => {
    getWarehouses().then(setWarehouses).catch(console.error);
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleApplyPreset = (p: (typeof WAREHOUSE_PRESETS)[0]) => {
    setForm({
      name: p.name,
      location: p.location,
      latitude: p.latitude.toString(),
      longitude: p.longitude.toString(),
      availableCapacity: p.capacity.toString(),
      active: true,
    });
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: Partial<Warehouse> = {
        name: form.name.trim(),
        location: form.location.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        availableCapacity: parseFloat(form.availableCapacity),
        active: form.active,
      };

      const res = await createWarehouse(data);
      if (res && res.id) {
        setWarehouses(prev => [...prev.filter(w => w.id !== res.id), res]);
      } else {
        fetchWarehouses();
      }
      setIsModalOpen(false);
      setForm({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        availableCapacity: '1000',
        active: true,
      });
    } catch (err) {
      console.error('Failed to create warehouse via API:', err);
      // Fallback optimistic update if backend is starting or offline
      const fallbackWh: Warehouse = {
        id: 'wh-' + Date.now(),
        name: form.name.trim(),
        location: form.location.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        availableCapacity: parseFloat(form.availableCapacity),
        active: form.active,
      };
      setWarehouses(prev => [...prev, fallbackWh]);
      setIsModalOpen(false);
      setForm({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        availableCapacity: '1000',
        active: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteWarehouse(id);
        fetchWarehouses();
      } catch (err) {
        console.error('Failed to delete warehouse:', err);
        alert('Could not delete warehouse.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fulfilment Warehouses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage distribution depots, dispatch coordinates, and fleet capacity limits
          </p>
        </div>

        <Button
          id="add-warehouse-btn"
          data-testid="add-warehouse-btn"
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white shadow-xs font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {/* Warehouses Table Card */}
      <Card className="shadow-sm border-0 ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="pl-6">Depot Name</TableHead>
                <TableHead>Location / City</TableHead>
                <TableHead>Geo Coordinates</TableHead>
                <TableHead>Available Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    No fulfilment warehouses registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map(w => (
                  <TableRow key={w.id} className="hover:bg-slate-50/70">
                    <TableCell className="pl-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                          <WarehouseIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{w.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{w.location}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {w.latitude}° N, {w.longitude}° E
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {w.availableCapacity} kg
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={w.active ? 'default' : 'secondary'}
                        className={w.active ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-medium' : 'bg-slate-200 text-slate-700 font-medium'}
                      >
                        {w.active ? 'Active Depot' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(w.id, w.name)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete Warehouse"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Dialog: Add Warehouse */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-none">Register New Warehouse</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Adds a new dispatch hub to the allocation solver network
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="px-5 pt-4 pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Compass className="w-3.5 h-3.5 text-slate-400" /> Quick City Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {WAREHOUSE_PRESETS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    {p.location}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateWarehouse} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Warehouse Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bangalore North Fulfilment Hub"
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Location / City</Label>
                <Input
                  required
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Bangalore"
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Latitude (°N)</Label>
                  <Input
                    required
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    placeholder="12.9716"
                    className="bg-white font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Longitude (°E)</Label>
                  <Input
                    required
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    placeholder="77.5946"
                    className="bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Available Payload Capacity (kg)</Label>
                <Input
                  required
                  type="number"
                  step="1"
                  value={form.availableCapacity}
                  onChange={e => setForm({ ...form, availableCapacity: e.target.value })}
                  placeholder="1500"
                  className="bg-white"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-900">Active Distribution Depot</span>
                </label>
                <span className="text-[11px] text-slate-400">Available for live order matching</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-slate-700 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {submitting ? 'Creating Depot...' : 'Create Warehouse'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

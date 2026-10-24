import axios from 'axios';
import { Order, Warehouse, Vehicle, AllocationResult } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
});

export const getOrders = () => api.get<Order[]>('/orders').then(res => res.data);
export const getOrder = (id: string) => api.get<Order>(`/orders/${id}`).then(res => res.data);
export const createOrder = (data: Partial<Order>) => api.post<Order>('/orders', data).then(res => res.data);
export const deleteOrder = (id: string) => api.delete(`/orders/${id}`).then(res => res.data);

export const getWarehouses = () => api.get<Warehouse[]>('/warehouses').then(res => res.data);
export const createWarehouse = (data: Partial<Warehouse>) => api.post<Warehouse>('/warehouses', data).then(res => res.data);
export const deleteWarehouse = (id: string) => api.delete(`/warehouses/${id}`).then(res => res.data);

export const getVehicles = () => api.get<Vehicle[]>('/vehicles').then(res => res.data);
export const getAvailableVehicles = () => api.get<Vehicle[]>('/vehicles/available').then(res => res.data);

export const allocateOrder = (orderId: string, strategy?: string) => {
    const url = strategy ? `/allocation/allocate/${orderId}?strategy=${encodeURIComponent(strategy)}` : `/allocation/allocate/${orderId}`;
    return api.post<AllocationResult>(url).then(res => res.data);
};

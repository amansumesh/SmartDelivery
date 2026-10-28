export interface Order {
    id: string;
    destination: string;
    destinationLatitude: number;
    destinationLongitude: number;
    packageWeight: number;
    packageType: 'STANDARD' | 'FRAGILE' | 'PERISHABLE' | 'HAZARDOUS';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    expressDelivery: boolean;
    insurance: boolean;
    status: 'PENDING' | 'ALLOCATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    updatedAt?: string;
}

export interface Warehouse {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    active: boolean;
    availableCapacity: number;
}

export interface Vehicle {
    id: string;
    type: 'BIKE' | 'VAN' | 'TRUCK';
    capacity: number;
    costPerKm: number;
    available: boolean;
    supportsFragile: boolean;
    maxRange?: number;
}

export interface AllocationCandidate {
    warehouse: Warehouse;
    vehicle: Vehicle;
    distance: number;
    estimatedCost: number;
    estimatedTime: number;
    distanceScore: number;
    costScore: number;
    priorityScore: number;
    capacityScore: number;
    timeScore: number;
    finalScore: number;
}

export interface PatternExecutionEvent {
    sequence: number;
    phase: 'FACTORY' | 'STRATEGY' | 'BUILDER';
    eventType: string;
    message: string;
    vehicleId?: string;
    vehicleType?: 'BIKE' | 'VAN' | 'TRUCK';
    warehouseId?: string;
    warehouseName?: string;
    status: 'SUCCESS' | 'REJECTED' | 'INFO';
    rejectionReason?: string;
    builderMethod?: string;
    fieldName?: string;
    fieldValue?: unknown;
    details?: Record<string, unknown>;
}

export interface AllocationResult {
    recommendedPlan: AllocationCandidate;
    alternatives: AllocationCandidate[];
    executionTrace?: PatternExecutionEvent[];
}

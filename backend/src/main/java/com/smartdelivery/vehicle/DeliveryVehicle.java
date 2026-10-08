package com.smartdelivery.vehicle;

public interface DeliveryVehicle {
    String getType();
    double getCapacity();
    double getCostPerKm();
    int getDeliveryTime();
    boolean supportsFragile();
}

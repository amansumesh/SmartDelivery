package com.smartdelivery.vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Truck implements DeliveryVehicle {
    private double capacity;
    private double costPerKm;
    private boolean supportsFragile;
    
    @Override
    public String getType() { return "TRUCK"; }
    @Override
    public int getDeliveryTime() { return 90; }
    @Override
    public boolean supportsFragile() { return this.supportsFragile; }
}

package com.smartdelivery.vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Bike implements DeliveryVehicle {
    private double capacity;
    private double costPerKm;
    private boolean supportsFragile;
    
    @Override
    public String getType() { return "BIKE"; }
    @Override
    public int getDeliveryTime() { return 30; }
    @Override
    public boolean supportsFragile() { return this.supportsFragile; }
}

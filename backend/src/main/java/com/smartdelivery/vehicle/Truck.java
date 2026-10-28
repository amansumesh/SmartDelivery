package com.smartdelivery.vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Truck implements DeliveryVehicle {
    private double capacity;
    private double costPerKm;
    private boolean supportsFragile;
    private double maxRange;

    public Truck(double capacity, double costPerKm, boolean supportsFragile) {
        this(capacity, costPerKm, supportsFragile, Double.MAX_VALUE);
    }
    
    @Override
    public String getType() { return "TRUCK"; }
    @Override
    public int getDeliveryTime() { return 90; }
    @Override
    public boolean supportsFragile() { return this.supportsFragile; }
    @Override
    public double getMaxRange() { return this.maxRange > 0 ? this.maxRange : Double.MAX_VALUE; }
}

package com.smartdelivery.vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Bike implements DeliveryVehicle {
    private double capacity;
    private double costPerKm;
    private boolean supportsFragile;
    private double maxRange;

    public Bike(double capacity, double costPerKm, boolean supportsFragile) {
        this(capacity, costPerKm, supportsFragile, 50.0);
    }
    
    @Override
    public String getType() { return "BIKE"; }
    @Override
    public int getDeliveryTime() { return 30; }
    @Override
    public boolean supportsFragile() { return this.supportsFragile; }
    @Override
    public double getMaxRange() { return this.maxRange > 0 ? this.maxRange : 50.0; }
}

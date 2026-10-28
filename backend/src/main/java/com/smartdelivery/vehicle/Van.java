package com.smartdelivery.vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Van implements DeliveryVehicle {
    private double capacity;
    private double costPerKm;
    private boolean supportsFragile;
    private double maxRange;

    public Van(double capacity, double costPerKm, boolean supportsFragile) {
        this(capacity, costPerKm, supportsFragile, 300.0);
    }
    
    @Override
    public String getType() { return "VAN"; }
    @Override
    public int getDeliveryTime() { return 45; }
    @Override
    public boolean supportsFragile() { return this.supportsFragile; }
    @Override
    public double getMaxRange() { return this.maxRange > 0 ? this.maxRange : 300.0; }
}

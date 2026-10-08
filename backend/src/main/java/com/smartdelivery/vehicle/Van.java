package com.smartdelivery.vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Van implements DeliveryVehicle {
    private double capacity;
    private double costPerKm;
    private boolean supportsFragile;
    
    @Override
    public String getType() { return "VAN"; }
    @Override
    public int getDeliveryTime() { return 45; }
    @Override
    public boolean supportsFragile() { return this.supportsFragile; }
}

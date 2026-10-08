package com.smartdelivery.allocation;
import com.smartdelivery.vehicle.DeliveryVehicle;
import org.springframework.stereotype.Component;

@Component
public class CostCalculator {
    public double calculateCost(double distance, DeliveryVehicle vehicle, boolean express, boolean insurance, boolean fragile) {
        double baseCost = distance * vehicle.getCostPerKm();
        double totalCost = baseCost;
        if (express) totalCost += baseCost * 0.20;
        if (insurance) totalCost += baseCost * 0.05;
        if (fragile) totalCost += 50.0;
        return totalCost;
    }
}

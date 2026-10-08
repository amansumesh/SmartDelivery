package com.smartdelivery.allocation;
import com.smartdelivery.document.Warehouse;
import com.smartdelivery.vehicle.DeliveryVehicle;
import lombok.Data;

@Data
public class AllocationCandidate {
    private Warehouse warehouse;
    private DeliveryVehicle vehicle;
    private double distance;
    private double estimatedCost;
    private int estimatedTime;
    private double distanceScore;
    private double costScore;
    private double priorityScore;
    private double capacityScore;
    private double timeScore;
    private double finalScore;
}

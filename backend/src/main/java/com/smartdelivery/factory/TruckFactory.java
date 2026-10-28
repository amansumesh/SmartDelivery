package com.smartdelivery.factory;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.vehicle.DeliveryVehicle;
import com.smartdelivery.vehicle.Truck;
import org.springframework.stereotype.Component;

@Component
public class TruckFactory extends VehicleFactory {
    @Override
    public DeliveryVehicle createVehicle(VehicleDocument doc) {
        double maxRange = (doc.getMaxRange() != null && doc.getMaxRange() > 0) ? doc.getMaxRange() : Double.MAX_VALUE;
        return new Truck(doc.getCapacity(), doc.getCostPerKm(), doc.isSupportsFragile(), maxRange);
    }
}

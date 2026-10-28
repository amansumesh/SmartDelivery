package com.smartdelivery.factory;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.vehicle.Bike;
import com.smartdelivery.vehicle.DeliveryVehicle;
import org.springframework.stereotype.Component;

@Component
public class BikeFactory extends VehicleFactory {
    @Override
    public DeliveryVehicle createVehicle(VehicleDocument doc) {
        double maxRange = (doc.getMaxRange() != null && doc.getMaxRange() > 0) ? doc.getMaxRange() : 50.0;
        return new Bike(doc.getCapacity(), doc.getCostPerKm(), doc.isSupportsFragile(), maxRange);
    }
}

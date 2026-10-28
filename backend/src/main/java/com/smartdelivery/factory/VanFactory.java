package com.smartdelivery.factory;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.vehicle.DeliveryVehicle;
import com.smartdelivery.vehicle.Van;
import org.springframework.stereotype.Component;

@Component
public class VanFactory extends VehicleFactory {
    @Override
    public DeliveryVehicle createVehicle(VehicleDocument doc) {
        double maxRange = (doc.getMaxRange() != null && doc.getMaxRange() > 0) ? doc.getMaxRange() : 300.0;
        return new Van(doc.getCapacity(), doc.getCostPerKm(), doc.isSupportsFragile(), maxRange);
    }
}

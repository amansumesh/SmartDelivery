package com.smartdelivery.factory;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.vehicle.DeliveryVehicle;
import com.smartdelivery.vehicle.Van;
import org.springframework.stereotype.Component;

@Component
public class VanFactory extends VehicleFactory {
    @Override
    public DeliveryVehicle createVehicle(VehicleDocument doc) {
        return new Van(doc.getCapacity(), doc.getCostPerKm(), doc.isSupportsFragile());
    }
}

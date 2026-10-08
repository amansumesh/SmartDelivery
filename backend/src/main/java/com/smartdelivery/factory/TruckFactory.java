package com.smartdelivery.factory;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.vehicle.DeliveryVehicle;
import com.smartdelivery.vehicle.Truck;
import org.springframework.stereotype.Component;

@Component
public class TruckFactory extends VehicleFactory {
    @Override
    public DeliveryVehicle createVehicle(VehicleDocument doc) {
        return new Truck(doc.getCapacity(), doc.getCostPerKm(), doc.isSupportsFragile());
    }
}

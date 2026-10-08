package com.smartdelivery.factory;

import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.vehicle.DeliveryVehicle;

public abstract class VehicleFactory {
    public abstract DeliveryVehicle createVehicle(VehicleDocument document);
}

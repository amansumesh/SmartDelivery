package com.smartdelivery.factory;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class VehicleFactoryResolver {
    private final Map<String, VehicleFactory> factories;

    public VehicleFactoryResolver(BikeFactory bikeFactory, VanFactory vanFactory, TruckFactory truckFactory) {
        this.factories = Map.of(
            "BIKE", bikeFactory,
            "VAN", vanFactory,
            "TRUCK", truckFactory
        );
    }

    public VehicleFactory getFactory(String type) {
        VehicleFactory factory = factories.get(type.toUpperCase());
        if (factory == null) {
            throw new IllegalArgumentException("No factory found for vehicle type: " + type);
        }
        return factory;
    }
}

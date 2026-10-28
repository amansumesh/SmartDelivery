package com.smartdelivery.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "vehicles")
public class VehicleDocument {
    @Id
    private String id;
    private String type; // BIKE, VAN, TRUCK
    private double capacity;
    private double costPerKm;
    private boolean available;
    private boolean supportsFragile;
    private Double maxRange;
}

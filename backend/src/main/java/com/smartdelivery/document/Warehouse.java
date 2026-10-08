package com.smartdelivery.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "warehouses")
public class Warehouse {
    @Id
    private String id;
    private String name;
    private String location;
    private double latitude;
    private double longitude;
    private boolean active;
    private double availableCapacity;
}

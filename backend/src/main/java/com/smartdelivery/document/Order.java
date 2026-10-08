package com.smartdelivery.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String destination;
    private double destinationLatitude;
    private double destinationLongitude;
    private double packageWeight;
    private PackageType packageType;
    private Priority priority;
    private boolean expressDelivery;
    private boolean insurance;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum PackageType { STANDARD, FRAGILE, PERISHABLE, HAZARDOUS }
    public enum Priority { LOW, NORMAL, HIGH, URGENT }
    public enum Status { PENDING, ALLOCATED, IN_TRANSIT, DELIVERED, CANCELLED }
}

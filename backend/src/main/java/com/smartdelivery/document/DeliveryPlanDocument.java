package com.smartdelivery.document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "delivery_plans")
public class DeliveryPlanDocument {
    @Id
    private String id;
    private String orderId;
    private String warehouseId;
    private String warehouseName;
    private String vehicleType;
    private double distance;
    private double estimatedCost;
    private int estimatedTime;
    private double allocationScore;
}

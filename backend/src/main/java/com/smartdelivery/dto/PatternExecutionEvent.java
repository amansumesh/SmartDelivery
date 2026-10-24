package com.smartdelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatternExecutionEvent {
    private int sequence;
    private String phase;             // "FACTORY" or "BUILDER"
    private String eventType;         // e.g., RESOLVER_LOOKUP, FACTORY_RESOLVED, VEHICLE_CREATED, CONSTRAINT_CHECK, CANDIDATE_SCORED, WINNER_SELECTED, BUILDER_INIT, BUILDER_FIELD, BUILD_COMPLETE, PERSIST_COMPLETE
    private String message;
    private String vehicleId;
    private String vehicleType;       // "BIKE", "VAN", "TRUCK"
    private String warehouseId;
    private String warehouseName;
    private String status;            // "SUCCESS", "REJECTED", "INFO"
    private String rejectionReason;   // e.g., "Insufficient capacity: 10.0kg < 25.0kg"
    private String builderMethod;     // e.g., "order(order)", "warehouse(warehouse)"
    private String fieldName;         // e.g., "distance", "estimatedCost"
    private Object fieldValue;        // the actual value assigned
    private Map<String, Object> details; // additional metrics (scores, capacity, cost, etc.)
}

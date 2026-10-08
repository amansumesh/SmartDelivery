package com.smartdelivery.builder;
import com.smartdelivery.document.Order;
import com.smartdelivery.document.Warehouse;
import com.smartdelivery.vehicle.DeliveryVehicle;
import lombok.Getter;

@Getter
public class DeliveryPlan {
    private final Order order;
    private final Warehouse warehouse;
    private final DeliveryVehicle vehicle;
    private final String priority;
    private final double distance;
    private final double estimatedCost;
    private final int estimatedTime;
    private final double allocationScore;
    private final boolean fragileHandling;
    private final boolean insurance;
    private final boolean expressDelivery;
    private final String reason;

    private DeliveryPlan(Builder builder) {
        this.order = builder.order;
        this.warehouse = builder.warehouse;
        this.vehicle = builder.vehicle;
        this.priority = builder.priority;
        this.distance = builder.distance;
        this.estimatedCost = builder.estimatedCost;
        this.estimatedTime = builder.estimatedTime;
        this.allocationScore = builder.allocationScore;
        this.fragileHandling = builder.fragileHandling;
        this.insurance = builder.insurance;
        this.expressDelivery = builder.expressDelivery;
        this.reason = builder.reason;
    }

    public static class Builder {
        private Order order;
        private Warehouse warehouse;
        private DeliveryVehicle vehicle;
        private String priority;
        private double distance;
        private double estimatedCost;
        private int estimatedTime;
        private double allocationScore;
        private boolean fragileHandling;
        private boolean insurance;
        private boolean expressDelivery;
        private String reason;

        public Builder order(Order order) { this.order = order; return this; }
        public Builder warehouse(Warehouse warehouse) { this.warehouse = warehouse; return this; }
        public Builder vehicle(DeliveryVehicle vehicle) { this.vehicle = vehicle; return this; }
        public Builder priority(String priority) { this.priority = priority; return this; }
        public Builder distance(double distance) { this.distance = distance; return this; }
        public Builder estimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; return this; }
        public Builder estimatedTime(int estimatedTime) { this.estimatedTime = estimatedTime; return this; }
        public Builder allocationScore(double allocationScore) { this.allocationScore = allocationScore; return this; }
        public Builder fragileHandling(boolean fragileHandling) { this.fragileHandling = fragileHandling; return this; }
        public Builder insurance(boolean insurance) { this.insurance = insurance; return this; }
        public Builder expressDelivery(boolean expressDelivery) { this.expressDelivery = expressDelivery; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }

        public DeliveryPlan build() {
            if (order == null || warehouse == null || vehicle == null) {
                throw new IllegalStateException("Order, Warehouse, and Vehicle are mandatory");
            }
            return new DeliveryPlan(this);
        }
    }
}

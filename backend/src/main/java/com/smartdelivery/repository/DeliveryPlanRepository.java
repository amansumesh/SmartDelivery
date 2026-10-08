package com.smartdelivery.repository;
import com.smartdelivery.document.DeliveryPlanDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface DeliveryPlanRepository extends MongoRepository<DeliveryPlanDocument, String> {}

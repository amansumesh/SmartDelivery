package com.smartdelivery.repository;
import com.smartdelivery.document.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface OrderRepository extends MongoRepository<Order, String> {}

package com.smartdelivery.repository;
import com.smartdelivery.document.VehicleDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface VehicleRepository extends MongoRepository<VehicleDocument, String> {
    List<VehicleDocument> findByAvailableTrue();
}

package com.smartdelivery.controller;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.repository.VehicleRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin("*")
public class VehicleController {
    private final VehicleRepository vehicleRepository;
    public VehicleController(VehicleRepository vehicleRepository) { this.vehicleRepository = vehicleRepository; }
    
    @GetMapping
    public List<VehicleDocument> getVehicles() { return vehicleRepository.findAll(); }
    
    @GetMapping("/available")
    public List<VehicleDocument> getAvailableVehicles() { return vehicleRepository.findByAvailableTrue(); }
}

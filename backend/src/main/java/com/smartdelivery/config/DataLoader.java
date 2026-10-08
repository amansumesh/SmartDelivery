package com.smartdelivery.config;
import com.smartdelivery.document.Warehouse;
import com.smartdelivery.document.VehicleDocument;
import com.smartdelivery.repository.WarehouseRepository;
import com.smartdelivery.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    private final WarehouseRepository warehouseRepository;
    private final VehicleRepository vehicleRepository;

    public DataLoader(WarehouseRepository warehouseRepository, VehicleRepository vehicleRepository) {
        this.warehouseRepository = warehouseRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (warehouseRepository.count() == 0) {
            Warehouse w1 = new Warehouse(); w1.setName("Chennai Warehouse"); w1.setLocation("Chennai"); w1.setLatitude(13.0827); w1.setLongitude(80.2707); w1.setActive(true); w1.setAvailableCapacity(1000);
            Warehouse w2 = new Warehouse(); w2.setName("Vellore Central Warehouse"); w2.setLocation("Vellore"); w2.setLatitude(12.9165); w2.setLongitude(79.1325); w2.setActive(true); w2.setAvailableCapacity(800);
            warehouseRepository.save(w1);
            warehouseRepository.save(w2);
        }
        
        if (vehicleRepository.count() == 0) {
            VehicleDocument v1 = new VehicleDocument(); v1.setType("BIKE"); v1.setCapacity(10); v1.setCostPerKm(8); v1.setAvailable(true); v1.setSupportsFragile(true);
            VehicleDocument v2 = new VehicleDocument(); v2.setType("VAN"); v2.setCapacity(50); v2.setCostPerKm(15); v2.setAvailable(true); v2.setSupportsFragile(true);
            VehicleDocument v3 = new VehicleDocument(); v3.setType("TRUCK"); v3.setCapacity(500); v3.setCostPerKm(30); v3.setAvailable(true); v3.setSupportsFragile(false);
            vehicleRepository.save(v1);
            vehicleRepository.save(v2);
            vehicleRepository.save(v3);
        }
    }
}

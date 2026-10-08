package com.smartdelivery.controller;
import com.smartdelivery.document.Warehouse;
import com.smartdelivery.repository.WarehouseRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin("*")
public class WarehouseController {
    private final WarehouseRepository warehouseRepository;
    public WarehouseController(WarehouseRepository warehouseRepository) { this.warehouseRepository = warehouseRepository; }
    
    @GetMapping
    public List<Warehouse> getWarehouses() { return warehouseRepository.findAll(); }
    
    @PostMapping
    public Warehouse createWarehouse(@RequestBody Warehouse warehouse) { return warehouseRepository.save(warehouse); }
    
    @DeleteMapping("/{id}")
    public void deleteWarehouse(@PathVariable String id) { warehouseRepository.deleteById(id); }
}

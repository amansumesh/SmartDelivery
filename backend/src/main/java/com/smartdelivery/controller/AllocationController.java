package com.smartdelivery.controller;

import com.smartdelivery.allocation.AllocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/allocation")
@CrossOrigin("*")
public class AllocationController {
    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping("/allocate/{orderId}")
    public ResponseEntity<?> allocateOrder(@PathVariable String orderId) {
        try {
            return ResponseEntity.ok(allocationService.allocateOrder(orderId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

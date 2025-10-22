package com.nursery.controller;

import com.nursery.model.Order;
import com.nursery.model.User;
import com.nursery.repository.OrderRepository;
import com.nursery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/users")
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    // Add endpoint to fetch all orders
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Add endpoint to update user roles
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleUpdate) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(roleUpdate.get("role"));
        userRepository.save(user);
        return ResponseEntity.ok("User role updated successfully");
    }

    // ✅ Inner Exception Class
    @ResponseStatus(code = org.springframework.http.HttpStatus.NOT_FOUND)
    private static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
}
package com.nursery.controller;

import com.nursery.model.Order;
import com.nursery.model.PaymentRequest;
import com.nursery.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "${app.cors.allowed-origins}", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<Order> getUserOrders(Authentication authentication) {
        return orderService.getUserOrders(authentication);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order, Authentication authentication) {
        Order createdOrder = orderService.createOrder(order, authentication);
        return ResponseEntity.ok(createdOrder);
    }

    @PostMapping("/{orderId}/pay")
    public ResponseEntity<Order> processPayment(@PathVariable Long orderId, 
                                              @RequestBody PaymentRequest paymentRequest,
                                              Authentication authentication) {
        Order processedOrder = orderService.processPayment(orderId, paymentRequest, authentication);
        return ResponseEntity.ok(processedOrder);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId, Authentication authentication) {
        return orderService.getOrder(orderId, authentication)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

// PaymentRequest moved to com.nursery.model.PaymentRequest
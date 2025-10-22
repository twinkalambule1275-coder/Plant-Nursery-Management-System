package com.nursery.service;

import com.nursery.model.Order;
import com.nursery.model.PaymentRequest;
import com.nursery.model.Plant;
import com.nursery.model.User;
import com.nursery.repository.OrderRepository;
import com.nursery.repository.PlantRepository;
import com.nursery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlantRepository plantRepository;

    public List<Order> getUserOrders(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return orderRepository.findByUser(user);
    }

    @Transactional
    public Order createOrder(Order order, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        order.setUser(user);
        order.setStatus("PENDING");

        // Validate and update plant stock
        order.getItems().forEach(item -> {
            Plant plant = plantRepository.findById(item.getPlant().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Plant not found"));

            if (plant.getStock() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for plant: " + plant.getName());
            }

            plant.setStock(plant.getStock() - item.getQuantity());
            plantRepository.save(plant);
        });

        return orderRepository.save(order);
    }

    @Transactional
    public Order processPayment(Long orderId, PaymentRequest paymentRequest, Authentication authentication) {
        Order order = getOrder(orderId, authentication)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        // Simulate a successful payment for now
        order.setStatus("PAID");
        order.setPaymentDate(LocalDateTime.now());
        order.setTransactionId(generateTransactionId());

        return orderRepository.save(order);
    }

    public Optional<Order> getOrder(Long orderId, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Optional<Order> order = orderRepository.findById(orderId);

        if (order.isPresent() && !order.get().getUser().getId().equals(user.getId())) {
            return Optional.empty();
        }

        return order;
    }

    private User getUserFromAuthentication(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis();
    }
}
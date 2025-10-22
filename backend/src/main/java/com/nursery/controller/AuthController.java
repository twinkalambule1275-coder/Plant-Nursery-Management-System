package com.nursery.controller;

import com.nursery.model.User;
import com.nursery.security.JwtTokenProvider;
import com.nursery.security.UserPrincipal;
import com.nursery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}", 
    allowedHeaders = {"Authorization", "Content-Type"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
               RequestMethod.DELETE, RequestMethod.OPTIONS},
    maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.get("username"),
                loginRequest.get("password")
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.getUserById(userPrincipal.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("message", "Username is already taken!"));
        }

        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("message", "Email is already registered!"));
        }

        User result = userService.createUser(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }
}
package com.nursery.repository;

import com.nursery.model.Plant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlantRepository extends JpaRepository<Plant, Long> {
    // Add custom queries if needed
}
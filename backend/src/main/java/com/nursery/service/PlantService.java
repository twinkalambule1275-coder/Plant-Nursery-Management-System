package com.nursery.service;

import com.nursery.model.Plant;
import com.nursery.repository.PlantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

@Service
public class PlantService {

    @Autowired
    private PlantRepository plantRepository;

    public List<Plant> getAllPlants() {
        return plantRepository.findAll();
    }

    public Optional<Plant> getPlantById(Long id) {
        return plantRepository.findById(id);
    }

    public Plant savePlant(Plant plant) {
        return plantRepository.save(plant);
    }

    @Transactional
    public Plant updatePlant(Long id, Plant plantDetails) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plant not found with id: " + id));

        plant.setName(plantDetails.getName());
        plant.setPrice(plantDetails.getPrice());
        plant.setStock(plantDetails.getStock());
        plant.setDescription(plantDetails.getDescription());
        plant.setUpdatedBy(plantDetails.getUpdatedBy());

        return plantRepository.save(plant);
    }

    public void deletePlant(Long id) {
        if (!plantRepository.existsById(id)) {
            throw new EntityNotFoundException("Plant not found with id: " + id);
        }
        plantRepository.deleteById(id);
    }
}
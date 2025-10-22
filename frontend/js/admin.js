import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'ROLE_ADMIN') {
        window.location.href = '../login.html';
        return;
    }

    // Set username in navigation
    document.getElementById('username').textContent = user.username;

    // Load plants initially
    loadPlants();

    // Handle logout
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    });

    // Add plant form submission
    document.getElementById('addPlantForm').addEventListener('submit', handleAddPlant);
});

// Show/Hide sections
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${sectionName}-section`).style.display = 'block';

    // Update active link
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Modal handling
function showAddPlantModal() {
    document.getElementById('addPlantModal').style.display = 'block';
}

// Close modal when clicking the X
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('addPlantModal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('addPlantModal')) {
        document.getElementById('addPlantModal').style.display = 'none';
    }
});

// Load plants
async function loadPlants() {
    try {
        const response = await fetch(`${API_BASE_URL}/plants`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const plants = await response.json();
            displayPlants(plants);
        } else {
            throw new Error('Failed to load plants');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load plants');
    }
}

// Display plants in table
function displayPlants(plants) {
    const tableBody = document.getElementById('plantTableBody');
    tableBody.innerHTML = '';

    plants.forEach(plant => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${plant.name}</td>
            <td>$${plant.price.toFixed(2)}</td>
            <td>${plant.stock}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editPlant(${plant.id})">Edit</button>
                <button class="btn-delete" onclick="deletePlant(${plant.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle add plant
async function handleAddPlant(event) {
    event.preventDefault();

    const plantData = {
        name: document.getElementById('plantName').value,
        price: parseFloat(document.getElementById('plantPrice').value),
        stock: parseInt(document.getElementById('plantStock').value),
        description: document.getElementById('plantDescription').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/plants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(plantData)
        });

        if (response.ok) {
            document.getElementById('addPlantModal').style.display = 'none';
            document.getElementById('addPlantForm').reset();
            loadPlants();
            alert('Plant added successfully!');
        } else {
            throw new Error('Failed to add plant');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add plant');
    }
}

// Edit plant
async function editPlant(plantId) {
    // Implementation for editing a plant
    // This would typically involve showing a modal with the plant's current data
    // and sending a PUT request to update the plant
}

// Delete plant
async function deletePlant(plantId) {
    if (confirm('Are you sure you want to delete this plant?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/plants/${plantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                loadPlants();
                alert('Plant deleted successfully!');
            } else {
                throw new Error('Failed to delete plant');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete plant');
        }
    }
}
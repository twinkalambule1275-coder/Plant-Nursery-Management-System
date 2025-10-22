import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Set username in navigation
    document.getElementById('username').textContent = user.username;

    // Show admin link if user is admin
    if (user.role === 'ROLE_ADMIN') {
        document.getElementById('adminLink').style.display = 'inline';
        document.getElementById('adminLink').href = 'admin/dashboard.html';
    }

    // Initialize the dashboard
    loadPlants();
    setupEventListeners();
});

let plants = []; // Store all plants
let selectedPlants = new Set(); // Store selected plant IDs

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', filterPlants);

    // Select all checkbox
    document.getElementById('selectAllCheckbox').addEventListener('change', handleSelectAll);

    // Logout handler
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Proceed to checkout
    document.getElementById('proceedToCheckout').addEventListener('click', handleCheckout);
}

async function loadPlants() {
    try {
        const response = await fetch(`${API_BASE_URL}/plants`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            plants = await response.json();
            displayPlants(plants);
        } else {
            throw new Error('Failed to load plants');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load plants');
    }
}

function displayPlants(plantsToDisplay) {
    const grid = document.getElementById('plantGrid');
    grid.innerHTML = '';
    const template = document.getElementById('plantCardTemplate');

    plantsToDisplay.forEach(plant => {
        const card = template.content.cloneNode(true);
        
        // Set plant data
        card.querySelector('.plant-name').textContent = plant.name;
        card.querySelector('.plant-description').textContent = plant.description;
        card.querySelector('.price').textContent = `$${plant.price.toFixed(2)}`;
        card.querySelector('.stock').textContent = `Stock: ${plant.stock}`;

        // Setup checkbox
        const checkbox = card.querySelector('.plant-checkbox');
        checkbox.value = plant.id;
        checkbox.checked = selectedPlants.has(plant.id);
        checkbox.addEventListener('change', () => handlePlantSelection(plant));

        // Setup buy button
        const buyButton = card.querySelector('.btn-buy');
        buyButton.addEventListener('click', () => handleBuyNow(plant));

        grid.appendChild(card);
    });

    updateCartSummary();
}

function handlePlantSelection(plant) {
    if (selectedPlants.has(plant.id)) {
        selectedPlants.delete(plant.id);
    } else {
        selectedPlants.add(plant.id);
    }
    updateCartSummary();
}

function handleSelectAll(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('.plant-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        const plantId = parseInt(checkbox.value);
        if (isChecked) {
            selectedPlants.add(plantId);
        } else {
            selectedPlants.delete(plantId);
        }
    });

    updateCartSummary();
}

function filterPlants(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredPlants = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm) ||
        plant.description.toLowerCase().includes(searchTerm)
    );
    displayPlants(filteredPlants);
}

function updateCartSummary() {
    const selectedCount = selectedPlants.size;
    const totalPrice = Array.from(selectedPlants)
        .map(id => plants.find(p => p.id === id))
        .reduce((sum, plant) => sum + plant.price, 0);

    document.getElementById('selectedCount').textContent = selectedCount;
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
    document.getElementById('cartCount').textContent = selectedCount;
    document.getElementById('cartSummary').style.display = selectedCount > 0 ? 'flex' : 'none';
}

function handleBuyNow(plant) {
    selectedPlants.clear();
    selectedPlants.add(plant.id);
    updateCartSummary();
    handleCheckout();
}

async function handleCheckout() {
    if (selectedPlants.size === 0) {
        alert('Please select at least one plant');
        return;
    }

    const selectedItems = Array.from(selectedPlants).map(id => {
        const plant = plants.find(p => p.id === id);
        return {
            plantId: plant.id,
            quantity: 1,
            price: plant.price
        };
    });

    // Store selected items in localStorage for the checkout page
    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    window.location.href = 'checkout.html';
}
import { API_BASE_URL } from './config.js';

let plants = [];
let currentPage = 1;
const pageSize = 5;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    console.log('User object from localStorage:', user);

    document.getElementById('user-initial').textContent = user.username.charAt(0).toUpperCase();

    const dropdownAdminLink = document.getElementById('dropdownAdminLink');
    const createPlantButton = document.getElementById('createPlantButton');
    if (user.role === 'ROLE_ADMIN') {
        if (dropdownAdminLink) dropdownAdminLink.style.display = 'block';
        if (createPlantButton) createPlantButton.style.display = 'inline-block';
    } else {
        if (dropdownAdminLink) dropdownAdminLink.style.display = 'none';
        if (createPlantButton) createPlantButton.style.display = 'none';
    }

    loadPlants();
});

async function loadPlants() {
    try {
        const response = await fetch(`${API_BASE_URL}/plants?page=${currentPage}&size=${pageSize}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const data = await response.json();
            plants = data.content || [];
            displayPlants(plants);
            updatePaginationControls(data.totalPages);
        } else {
            throw new Error('Failed to load plants');
        }
    } catch (error) {
        console.error('Error:', error);
        displayPlants([]);
    }
}

function displayPlants(plantsToDisplay) {
    const tableBody = document.getElementById('plantTableBody');
    tableBody.innerHTML = '';
    if (plantsToDisplay.length === 0) {
        // "No data available" मैसेज को 5 कॉलम तक फैलाएं
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No data available</td></tr>`;
    } else {
        plantsToDisplay.forEach(plant => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${plant.image || 'images/placeholder.jpg'}" alt="${plant.name}" class="plant-thumbnail"></td>
                <td class="plant-name">${plant.name}</td>
                <td>$${plant.price ? plant.price.toFixed(2) : '0.00'}</td>
                <td>${plant.stock || 0}</td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="editPlantLogic(${plant.id})">Edit</button>
                    <button class="btn-delete" onclick="deletePlantLogic(${plant.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function updatePaginationControls(totalPages) {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('prevPage').disabled = (currentPage === 1);
    document.getElementById('nextPage').disabled = (!totalPages || currentPage === totalPages);
}

// ===================================================================
// FIX: HTML से कॉल करने के लिए सभी फंक्शन को GLOBAL (WINDOW) बनाएं
// ===================================================================

window.toggleDropdownLogic = () => {
    const dd = document.getElementById('user-dropdown');
    if (dd) {
        dd.style.display = (dd.style.display === 'block') ? 'none' : 'block';
    }
};

window.logoutLogic = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
};

window.showCreatePlantModalLogic = () => {
    document.getElementById('modalTitle').textContent = 'Add New Plant';
    document.getElementById('plantForm').reset();
    document.getElementById('plantId').value = '';
    document.getElementById('plantModal').style.display = 'flex';
};

window.closePlantModalLogic = () => {
    document.getElementById('plantModal').style.display = 'none';
};

window.changePageLogic = (direction) => {
    currentPage += direction;
    loadPlants();
};

window.filterPlantsLogic = () => {
    console.log("Searching for:", document.getElementById('searchInput').value);
    // यहां आप API को फिर से कॉल करने का लॉजिक जोड़ सकते हैं
};

window.handlePlantFormSubmit = async (event) => {
    event.preventDefault();
    const plantId = document.getElementById('plantId').value;
    const method = plantId ? 'PUT' : 'POST';
    const url = plantId ? `${API_BASE_URL}/plants/${plantId}` : `${API_BASE_URL}/plants`;

    const plantData = {
        name: document.getElementById('plantName').value,
        price: parseFloat(document.getElementById('plantPrice').value),
        stock: parseInt(document.getElementById('plantStock').value),
        image: document.getElementById('plantImage').value
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(plantData)
        });
        if (response.ok) {
            window.closePlantModalLogic();
            loadPlants();
        } else {
            alert('Failed to save plant.');
        }
    } catch (error) {
        console.error('Error saving plant:', error);
    }
};
// फॉर्म सबमिशन को हैंडल करने के लिए इवेंट लिस्नर जोड़ें
document.getElementById('plantForm').addEventListener('submit', window.handlePlantFormSubmit);


window.editPlantLogic = async (plantId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/plants/${plantId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const plant = await response.json();
            document.getElementById('modalTitle').textContent = 'Edit Plant';
            document.getElementById('plantId').value = plant.id;
            document.getElementById('plantName').value = plant.name;
            document.getElementById('plantPrice').value = plant.price;
            document.getElementById('plantStock').value = plant.stock;
            document.getElementById('plantImage').value = plant.image || '';
            document.getElementById('plantModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Failed to fetch plant for editing:', error);
    }
};

window.deletePlantLogic = async (plantId) => {
    if (!confirm('Are you sure you want to delete this plant?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/plants/${plantId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            loadPlants();
        } else {
            alert('Failed to delete plant.');
        }
    } catch (error) {
        console.error('Failed to delete plant:', error);
    }
};
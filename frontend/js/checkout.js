import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    if (!checkoutItems || checkoutItems.length === 0) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Set username in navigation
    document.getElementById('username').textContent = user.username;

    // Load order items
    loadOrderItems(checkoutItems);

    // Setup event listeners
    setupEventListeners();
});

async function loadOrderItems(items) {
    try {
        let totalAmount = 0;
        const orderItemsContainer = document.getElementById('orderItems');
        
        for (const item of items) {
            const response = await fetch(`${API_BASE_URL}/plants/${item.plantId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const plant = await response.json();
                const itemTotal = item.quantity * plant.price;
                totalAmount += itemTotal;

                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                itemElement.innerHTML = `
                    <div class="item-details">
                        <div class="item-name">${plant.name}</div>
                        <div class="item-price">$${plant.price.toFixed(2)} × ${item.quantity}</div>
                    </div>
                    <div class="item-total">$${itemTotal.toFixed(2)}</div>
                `;
                orderItemsContainer.appendChild(itemElement);
            }
        }

        document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load order items');
    }
}

function setupEventListeners() {
    // Handle logout
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('checkoutItems');
        window.location.href = 'login.html';
    });

    // Handle payment form submission
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);

    // Format card number input
    document.getElementById('cardNumber').addEventListener('input', formatCardNumber);

    // Format expiry date input
    document.getElementById('expiryDate').addEventListener('input', formatExpiryDate);
}

function formatCardNumber(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, '');
    input.value = value;
}

function formatExpiryDate(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    input.value = value;
}

async function handlePayment(e) {
    e.preventDefault();

    const paymentData = {
        paymentMethod: document.getElementById('paymentMethod').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
    };

    const orderData = {
        items: JSON.parse(localStorage.getItem('checkoutItems'))
    };

    try {
        // Create order
        const orderResponse = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to create order');
        }

        const order = await orderResponse.json();

        // Process payment
        const paymentResponse = await fetch(`http://localhost:8080/api/orders/${order.id}/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(paymentData)
        });

        if (!paymentResponse.ok) {
            throw new Error('Payment failed');
        }

        // Clear checkout items and redirect to success page
        localStorage.removeItem('checkoutItems');
        alert('Payment successful! Thank you for your order.');
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Payment failed. Please try again.');
    }
}
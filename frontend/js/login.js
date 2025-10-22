import { API_BASE_URL } from './config.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    // Add Remember Me Checkbox
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Modify login logic to handle Remember Me
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberMe');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Login failed with status ' + response.status);
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to home page upon successful login
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed: ' + error.message);
    }
});

// On page load, check if Remember Me was selected
if (localStorage.getItem('rememberMe') === 'true') {
    document.getElementById('username').value = localStorage.getItem('username');
}
// js/home.js (Existing code)
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // This username is for the home page navbar, if you display it.
    // The dashboard's user-initial takes precedence on the dashboard page.
    const usernameElement = document.getElementById('username');
    if (usernameElement) { // Check if element exists
        usernameElement.textContent = user.username;
    }


    // Show admin link if user is admin
    const adminLink = document.getElementById('adminLink');
    if (adminLink && user.role === 'ROLE_ADMIN') { // Check if element exists
        adminLink.style.display = 'inline';
        adminLink.href = 'admin/dashboard.html'; // Ensure this points correctly
    } else if (adminLink) {
        adminLink.style.display = 'none';
    }

    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});
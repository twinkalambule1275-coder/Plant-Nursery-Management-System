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

    // Handle logout
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});
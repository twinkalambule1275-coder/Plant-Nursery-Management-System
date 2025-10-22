// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8081/api'
    : 'http://plant-nusary.com:8081/api/api';

// Export for use in other files
export { API_BASE_URL };
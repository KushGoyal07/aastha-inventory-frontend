const API_BASE_URL = 'https://aastha-inventory.onrender.com/api';

// Login function
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const { token } = await response.json();
    localStorage.setItem('token', token);
    window.location.href = 'inventory.html';
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message);
  }
});

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}
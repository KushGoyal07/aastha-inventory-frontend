// ✅ Do NOT declare API_BASE_URL again — we assume it's already in auth.js

document.addEventListener('DOMContentLoaded', () => {
  const passwordModal = document.getElementById('passwordModal');
  const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');
  const addForm = document.getElementById('add-form');
  const addItemBtn = document.getElementById('addItemBtn');
  const passwordError = document.getElementById('passwordError');

  // Show modal first
  passwordModal.style.display = 'block';
  addForm.style.display = 'none';

  // Password verification
  verifyPasswordBtn.addEventListener('click', () => {
    const enteredPassword = document.getElementById('adminPassword').value;
    if (enteredPassword === 'Abhishek1@') {
      passwordModal.style.display = 'none';
      addForm.style.display = 'block';
      passwordError.style.display = 'none';
    } else {
      passwordError.style.display = 'block';
    }
  });

  // Add item logic
  addItemBtn.addEventListener('click', async () => {
    const name = document.getElementById('item-name').value.trim();
    const quantity = parseInt(document.getElementById('item-qty').value);
    const price = parseFloat(document.getElementById('item-price').value);
    const image = document.getElementById('item-image').value.trim() || 'https://via.placeholder.com/60';
    const token = localStorage.getItem('token');

    if (!token) return alert("You must be logged in.");

    if (!name || isNaN(quantity) || isNaN(price) || quantity < 0 || price < 0) {
      alert("Please enter valid item details.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ name, quantity, price, image })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add item.");

      alert("Item added successfully!");
      document.getElementById('item-name').value = '';
      document.getElementById('item-qty').value = '';
      document.getElementById('item-price').value = '';
      document.getElementById('item-image').value = '';
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  });
});

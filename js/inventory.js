// API_BASE_URL must come from auth.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const inventoryList = document.getElementById('inventory-list');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const lockBtn = document.getElementById('lockBtn');

  if (!token) {
    alert("You must be logged in.");
    window.location.href = 'login.html';
    return;
  }

  let fullInventory = [];
  let isUnlocked = false;

  lockBtn.addEventListener('click', () => {
    if (isUnlocked) {
      isUnlocked = false;
      lockBtn.innerHTML = "🔒 Unlock Controls";
    } else {
      const password = prompt("Enter admin password:");
      if (password === "Abhishek1@") {
        isUnlocked = true;
        lockBtn.innerHTML = "🔓 Admin Unlocked";
      } else {
        alert("Incorrect password");
        return;
      }
    }
    renderInventory();
  });

  async function loadInventory() {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        headers: { 'Authorization': token }
      });
      fullInventory = await res.json();
      renderInventory();
    } catch (err) {
      console.error("Error loading inventory:", err);
      inventoryList.innerHTML = `<p>Failed to load inventory</p>`;
    }
  }

  function renderInventory() {
    const query = searchInput?.value?.toLowerCase() || '';
    const sortType = sortSelect?.value || 'name';

    let filtered = fullInventory.filter(item =>
      item.name.toLowerCase().includes(query)
    );

    if (sortType === 'quantity') {
      filtered.sort((a, b) => b.quantity - a.quantity);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    inventoryList.innerHTML = '';

    if (filtered.length === 0) {
      inventoryList.innerHTML = '<p>No matching items found.</p>';
      return;
    }

    filtered.forEach(item => {
      const fallbackImage = 'https://dummyimage.com/80x80/cccccc/000000&text=No+Img';
      const imageUrl = item.image?.includes('placeholder.com') ? fallbackImage : (item.image || fallbackImage);

      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-details">
          <img src="${imageUrl}" alt="${item.name}" class="item-image" />
          <div>
            <h3>${item.name}</h3>
            <p><strong>Qty:</strong> <span class="qty">${item.quantity}</span></p>
            <p><strong>Price:</strong> ₹${item.price}</p>
          </div>
        </div>
        <div class="edit-controls">
          ${isUnlocked ? `
            <button class="qty-btn btn-green" data-id="${item._id}" data-action="add">➕</button>
            <button class="qty-btn btn-yellow" data-id="${item._id}" data-action="sub">➖</button>
            <button class="delete-btn btn-red" data-id="${item._id}">🗑️</button>
          ` : ``}
        </div>
      `;
      inventoryList.appendChild(card);
    });
  }

  inventoryList.addEventListener('click', async (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id || !isUnlocked) return;

    if (target.classList.contains('qty-btn')) {
      const action = target.dataset.action;
      const card = target.closest('.item-card');
      const qtySpan = card.querySelector('.qty');
      let currentQty = parseInt(qtySpan.textContent);
      let newQty = action === 'add' ? currentQty + 1 : Math.max(currentQty - 1, 0);

      try {
        const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ quantity: newQty })
        });
        if (res.ok) qtySpan.textContent = newQty;
        else alert("Failed to update quantity");
      } catch (err) {
        console.error("Update failed:", err);
      }
    }

    if (target.classList.contains('delete-btn')) {
      if (confirm("Delete this item?")) {
        try {
          const res = await fetch(`${API_BASE_URL}/inventory/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
          });
          if (res.ok) loadInventory();
          else alert("Delete failed");
        } catch (err) {
          console.error("Delete failed:", err);
        }
      }
    }
  });

  searchInput?.addEventListener('input', renderInventory);
  sortSelect?.addEventListener('change', renderInventory);

  loadInventory();
});

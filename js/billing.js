let availableItems = [];
let selectedItems = [];

document.addEventListener('DOMContentLoaded', () => {
  loadItems();

  // Expose these to global for HTML inline calls
  window.showSearchResults = showSearchResults;
  window.searchBillItems = searchBillItems;
  window.addToBill = addToBill;
  window.updateQuantity = updateQuantity;
  window.removeItem = removeItem;
  window.generateBill = generateBill;
  window.printBill = printBill;
  window.loadHistory = loadHistory;
});

async function loadItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      headers: { 'Authorization': localStorage.getItem('token') }
    });
    availableItems = await response.json();
  } catch (error) {
    console.error('Failed to load items:', error);
    alert('Failed to load inventory items');
  }
}

function showSearchResults() {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = availableItems.map(item => `
    <div class="search-item" onclick="addToBill('${item._id}')">
      <img src="${cleanImage(item.image)}" alt="${item.name}">
      <span>${item.name} (₹${item.price}, Stock: ${item.quantity})</span>
    </div>
  `).join('');
  searchResults.style.display = 'block';
}

function searchBillItems() {
  const term = document.getElementById('billSearch').value.toLowerCase();
  const results = document.getElementById('searchResults');
  
  results.innerHTML = availableItems
    .filter(item => item.name.toLowerCase().includes(term))
    .map(item => `
      <div class="search-item" onclick="addToBill('${item._id}')">
        <img src="${cleanImage(item.image)}" alt="${item.name}">
        <span>${item.name} (₹${item.price}, Stock: ${item.quantity})</span>
      </div>
    `).join('');
}

function cleanImage(img) {
  return img && !img.includes('placeholder.com') 
    ? img 
    : 'https://dummyimage.com/60x60/cccccc/000000&text=No+Img';
}

function addToBill(itemId) {
  const item = availableItems.find(i => i._id === itemId);
  if (!item) return;

  const existingItem = selectedItems.find(i => i.id === itemId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    selectedItems.push({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  }

  renderBillItems();
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('billSearch').value = '';
}

function renderBillItems() {
  const container = document.getElementById('bill-items');
  container.innerHTML = selectedItems.map(item => `
    <div class="bill-item">
      <img src="${cleanImage(item.image)}" alt="${item.name}">
      <div class="bill-item-details">
        <h3>${item.name}</h3>
        <p>₹${item.price} × 
          <input type="number" value="${item.quantity}" min="1" 
                 onchange="updateQuantity('${item.id}', this.value)">
        </p>
      </div>
      <button class="remove-btn" onclick="removeItem('${item.id}')">×</button>
    </div>
  `).join('');
}

function updateQuantity(itemId, newQty) {
  const item = selectedItems.find(i => i.id === itemId);
  if (item) item.quantity = parseInt(newQty);
}

function removeItem(itemId) {
  selectedItems = selectedItems.filter(i => i.id !== itemId);
  renderBillItems();
}

async function generateBill() {
  if (selectedItems.length === 0) {
    alert("Please add items to generate a bill");
    return;
  }

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const invoiceNumber = Math.floor(Math.random() * 1000000);
  const billDate = new Date().toISOString();

  const billHTML = `
    <div class="bill-template">
      <header class="bill-header">
        <img src="assets/images/asthalogo.jpg" alt="Astha Electronics" class="bill-logo">
        <div class="shop-info">
          <h1>Astha Electronics</h1>
          <p>0, 0, 0, BASTI ROAD, MANER PATNA, Bihar 801108</p>
          <p>GSTIN: 22AAAAA0000A1Z5</p>
        </div>
      </header>
      
      <div class="bill-details">
        <p><strong>Bill No:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <table class="bill-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${selectedItems.map(item => `
            <tr>
              <td><div class="item-with-img"><img src="${cleanImage(item.image)}"> ${item.name}</div></td>
              <td>₹${item.price.toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="bill-totals">
        <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
        <p><strong>GST (18%):</strong> ₹${tax.toFixed(2)}</p>
        <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
      </div>
      
      <footer class="bill-footer">
        <p>Thank you for your business!</p>
        <p>Goods once sold will not be taken back</p>
      </footer>
      
      <div class="bill-actions">
        <button class="btn btn-primary" onclick="printBill()">Print Bill</button>
      </div>
    </div>
  `;

  document.getElementById('bill-result').innerHTML = billHTML;

  // Save to backend
  try {
    await fetch(`${API_BASE_URL}/billing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token')
      },
      body: JSON.stringify({
        items: selectedItems,
        subtotal,
        tax,
        total,
        invoiceNumber,
        date: billDate
      })
    });

    alert('Bill saved successfully!');
    selectedItems = [];
    renderBillItems();
  } catch (err) {
    console.error('Save failed:', err);
    alert("Error saving bill");
  }
}

function printBill() {
  const printContent = document.querySelector('.bill-template').outerHTML;
  const originalContent = document.body.innerHTML;
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
  renderBillItems();
}

async function loadHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/billing/history`, {
      headers: { 'Authorization': localStorage.getItem('token') }
    });

    if (!response.ok) throw new Error('Failed to load history');

    const history = await response.json();
    displayHistory(history);
  } catch (error) {
    console.error('Error loading history:', error);
    document.getElementById('billing-history').innerHTML = 
      '<p class="error">Error loading history. Please try again.</p>';
  }
}

function displayHistory(history) {
  const historyContainer = document.getElementById('billing-history');
  historyContainer.innerHTML = '';

  if (history.length === 0) {
    historyContainer.innerHTML = '<p>No billing history found</p>';
    return;
  }

  historyContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Bill No.</th>
          <th>Date</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${history.map(bill => `
          <tr>
            <td>${bill.invoiceNumber}</td>
            <td>${new Date(bill.date).toLocaleDateString()}</td>
            <td>₹${bill.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

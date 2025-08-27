async function generateBill() {
  // Get customer details and the total adjustment
  const customerName = document.getElementById('customer-name').value;
  const customerAddress = document.getElementById('customer-address').value;
  const totalAdjustment = parseFloat(document.getElementById('total-adjustment').value) || 0;

  // Check if any items are selected
  if (selectedItems.length === 0) {
    alert("Please add items to generate a bill");
    return;
  }

  // Calculate the subtotal, tax (18%), and total
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax + totalAdjustment; // Apply adjustment

  // Generate a random invoice number and get the current date
  const invoiceNumber = Math.floor(Math.random() * 1000000);
  const billDate = new Date().toISOString();

  // Create the HTML structure for the bill
  const billHTML = `
    <div class="bill-template">
      <!-- Header Section -->
      <header class="bill-header">
        <img src="assets/images/asthalogo.jpg" alt="Astha Electronics" class="bill-logo">
        <div class="shop-info">
          <h1>Astha Electronics</h1>
          <p>0, 0, 0, BASTI ROAD, MANER PATNA, Bihar 801108</p>
          <p>GSTIN: 22AAAAA0000A1Z5</p>
        </div>
      </header>

      <!-- Bill Details Section -->
      <div class="bill-details">
        <p><strong>Bill No:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Address:</strong> ${customerAddress}</p>
      </div>

      <!-- Bill Items Table -->
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
              <td><div class="item-with-img"><img src="${cleanImage(item.image)}" alt="${item.name}"> ${item.name}</div></td>
              <td>₹${item.price.toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Total Calculation Section -->
      <div class="bill-totals">
        <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
        <p><strong>GST (18%):</strong> ₹${tax.toFixed(2)}</p>
        <p><strong>Total Adjustment:</strong> ₹${totalAdjustment.toFixed(2)}</p>
        <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
      </div>

      <!-- Footer Section -->
      <footer class="bill-footer">
        <p>Thank you for your business!</p>
        <p>Goods once sold will not be taken back</p>
      </footer>

      <!-- Bill Action Buttons -->
      <div class="bill-actions">
        <button class="btn btn-primary" onclick="printBill()">Print Bill</button>
      </div>
    </div>
  `;

  // Display the generated bill HTML in the bill result container
  document.getElementById('bill-result').innerHTML = billHTML;

  // Save the bill to the backend
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
        date: billDate,
        customerName,
        customerAddress
      })
    });

    alert('Bill saved successfully!');
    selectedItems = [];  // Reset selected items after saving the bill
    renderBillItems();  // Re-render the items in the bill (should be empty now)
  } catch (err) {
    console.error('Save failed:', err);
    alert("Error saving bill");
  }
}

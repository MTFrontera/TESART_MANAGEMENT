const API_BASE = window.location.origin + '/api';

let orderDetails = [];
let orders = [];
let products = [];

// Load dropdowns
async function loadDropdowns() {
  const orderSelect = document.getElementById('orderSelect');
  const productSelect = document.getElementById('productSelect');

  orderSelect.innerHTML = '<option selected disabled>-- Order ID --</option>';
  productSelect.innerHTML = '<option selected disabled>-- Product --</option>';

  try {
    const [orderRes, productRes] = await Promise.all([
      fetch(`${API_BASE}/orders`),
      fetch(`${API_BASE}/products`)
    ]);

    orders = orderRes.ok ? await orderRes.json() : [];
    products = productRes.ok ? await productRes.json() : [];
  } catch (error) {
    console.error('Failed to load dropdown data:', error);
    orders = [];
    products = [];
  }

  orders.forEach(o => {
    orderSelect.innerHTML += `<option value="${o.OrderID}">#${o.OrderID}</option>`;
  });

  products.forEach(p => {
    productSelect.innerHTML += `<option value="${p.ProductID}" data-price="${p.UnitPrice}">${p.ProductName}</option>`;
  });
}

function bindProductPriceFill() {
  const productSelect = document.getElementById('productSelect');
  productSelect.addEventListener('change', () => {
    const price = productSelect.selectedOptions[0]?.dataset?.price;
    document.getElementById('priceInput').value = price ?? '';
  });
}

// Add order detail
async function addOrderDetail() {
  const orderId = document.getElementById('orderSelect').value;
  const productId = document.getElementById('productSelect').value;
  const qty = parseInt(document.getElementById('qtyInput').value, 10);
  const price = parseFloat(document.getElementById('priceInput').value);

  if (!orderId || !productId || !qty || !price) {
    alert('Please fill all fields');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/orderdetails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        OrderID: orderId,
        ProductID: productId,
        Quantity: qty,
        UnitPrice: price
      })
    });

    if (!res.ok) throw new Error(`Add failed (${res.status})`);

    await renderTable();
  } catch (error) {
    console.error('Failed to add order detail:', error);
    alert('Unable to add order detail. See console for details.');
  }
}

// Render table
async function renderTable() {
  try {
    orderDetails = await fetch(`${API_BASE}/orderdetails`).then(r => (r.ok ? r.json() : []));
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    orderDetails = [];
  }

  const table = document.getElementById('dataTableBody');
  table.innerHTML = '';

  orderDetails.forEach(d => {
    table.innerHTML += `
        <tr>
            <td>${d.OrderDetailID}</td>
            <td>${d.OrderID}</td>
            <td>${d.Date}</td>
            <td>${d.ProductName}</td>
            <td>${d.Quantity}</td>
            <td>₱${parseFloat(d.UnitPrice).toFixed(2)}</td>
            <td>₱${parseFloat(d.Subtotal).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteDetail(${d.OrderDetailID})">
                    Delete
                </button>
            </td>
        </tr>
        `;
  });
}

// Delete detail
async function deleteDetail(id) {
  if (!confirm('Delete this order detail?')) return;

  try {
    const res = await fetch(`${API_BASE}/orderdetails/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
    await renderTable();
  } catch (error) {
    console.error('Failed to delete order detail:', error);
    alert('Unable to delete order detail. See console for details.');
  }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  loadDropdowns();
  bindProductPriceFill();
  renderTable();
  document.getElementById('addDetailBtn').addEventListener('click', addOrderDetail);
});

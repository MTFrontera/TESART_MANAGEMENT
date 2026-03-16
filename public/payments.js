const API_URL = 'http://localhost:3000/api/payments';

async function loadPayments() {
    const res = await fetch(API_URL);
    const data = await res.json();
    const tbody = document.getElementById('paymentTableBody');
    
    tbody.innerHTML = data.map(p => `
        <tr>
            <td>#${p.PaymentID}</td>
            <td class="fw-bold text-primary">Order #${p.OrderID}</td>
            <td>${p.CustomerName}</td>
            <td class="text-muted small">${p.Date}</td>
            <td><span class="badge bg-light text-dark border">${p.PaymentMethod}</span></td>
            <td class="fw-bold">₱${parseFloat(p.AmountPaid).toFixed(2)}</td>
            <td>
                <span class="badge ${p.PaymentStatus === 'Full' ? 'bg-success' : 'bg-warning'}">
                    ${p.PaymentStatus}
                </span>
            </td>
        </tr>
    `).join('');
}

async function loadOrdersForDropdown() {
    const res = await fetch('http://localhost:3000/api/orders');
    const orders = await res.json();
    const select = document.getElementById('payOrderSelect');
    select.innerHTML += orders.map(o => `<option value="${o.OrderID}">#${o.OrderID} (${o.CustomerName})</option>`).join('');
}

async function recordPayment() {
    const body = {
        OrderID: document.getElementById('payOrderSelect').value,
        PaymentMethod: document.getElementById('payMethod').value,
        AmountPaid: document.getElementById('payAmount').value,
        PaymentStatus: document.getElementById('payStatus').value
    };

    if(!body.OrderID || !body.AmountPaid) return alert("Please fill in all fields");

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    document.getElementById('payAmount').value = "";
    loadPayments();
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrdersForDropdown();
    loadPayments();
    document.getElementById('paySubmitBtn').addEventListener('click', recordPayment);
});

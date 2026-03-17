const API_URL = window.location.origin + '/api/payments';

async function loadPayments() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();
        const tbody = document.getElementById('paymentTableBody');
        
        tbody.innerHTML = data.map(p => `
            <tr>
                <td>#${p.PaymentID}</td>
                <td class="fw-bold text-primary">Order #${p.OrderID}</td>
                <td>${p.CustomerName}</td>
                <td class="text-muted small">${p.Date}</td>
                <td><span class="badge bg-light text-dark border">${p.PaymentMethod}</span></td>
                <td class="fw-bold">₱${parseFloat(p.Amount).toFixed(2)}</td>
                <td>
                    <span class="badge ${p.Status === 'Full' ? 'bg-success' : 'bg-warning'}">
                        ${p.Status}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load payments:', err);
        const tbody = document.getElementById('paymentTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-danger">Unable to load payments. Check console for details.</td></tr>';
    }
}

async function loadOrdersForDropdown() {
    const res = await fetch(window.location.origin + '/api/orders');
    const orders = await res.json();
    const select = document.getElementById('payOrderSelect');
    select.innerHTML += orders.map(o => `<option value="${o.OrderID}">#${o.OrderID} (${o.CustomerName})</option>`).join('');
}

async function recordPayment() {
    const body = {
        OrderID: document.getElementById('payOrderSelect').value,
        PaymentMethod: document.getElementById('payMethod').value,
        AmountPaid: document.getElementById('payAmount').value,
        PaymentStatus: document.getElementById('payStatus').value || 'Pending'
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

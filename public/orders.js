async function loadInitialData() {
    try {
        // Load Customers for dropdown
        const custRes = await fetch(window.location.origin + '/api/customers');
        if (!custRes.ok) throw new Error(`Fetch customers failed (${custRes.status})`);
        const customers = await custRes.json();
        document.getElementById('selectCustomer').innerHTML += customers.map(c => 
            `<option value="${c.CustomerID}">${c.CustomerName}</option>`).join('');

        // Load Employees for dropdown
        const empRes = await fetch(window.location.origin + '/api/employees');
        if (!empRes.ok) throw new Error(`Fetch employees failed (${empRes.status})`);
        const employees = await empRes.json();
        document.getElementById('selectEmployee').innerHTML += employees.map(e => 
            `<option value="${e.EmployeeID}">${e.FirstName} ${e.LastName}</option>`).join('');

        loadOrders();
    } catch (err) {
        console.error('Failed to load initial data:', err);
        const tbody = document.getElementById('orderTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Unable to load orders. Check console for details.</td></tr>';
    }
}

async function loadOrders() {
    try {
        const res = await fetch(window.location.origin + '/api/orders');
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const orders = await res.json();
        const tbody = document.getElementById('orderTableBody');
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.OrderID}</td>
                <td class="fw-bold">${o.CustomerName}</td>
                <td>${o.EmployeeName}</td>
                <td>${o.Date}</td>
                <td><span class="badge ${o.OrderStatus === 'Completed' ? 'bg-success' : 'bg-warning'}">${o.OrderStatus}</span></td>
                <td>₱${parseFloat(o.TotalAmount || 0).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load orders:', err);
        const tbody = document.getElementById('orderTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Unable to load orders. Check console for details.</td></tr>';
    }
}

async function createOrder() {
    const body = {
        CustomerID: document.getElementById('selectCustomer').value,
        EmployeeID: document.getElementById('selectEmployee').value,
        OrderDate: document.getElementById('orderDate').value,
        OrderStatus: document.getElementById('orderStatus').value,
        DeliveryMethod: 'Pickup',
        TotalAmount: 0 // Initial amount
    };

    await fetch(window.location.origin + '/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    loadOrders();
}

window.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    document.getElementById('createOrderBtn').addEventListener('click', createOrder);
});

async function loadInitialData() {
    // Load Customers for dropdown
    const custRes = await fetch('http://localhost:3000/api/customers');
    const customers = await custRes.json();
    document.getElementById('selectCustomer').innerHTML += customers.map(c => 
        `<option value="${c.CustomerID}">${c.CustomerName}</option>`).join('');

    // Load Employees for dropdown
    const empRes = await fetch('http://localhost:3000/api/employees');
    const employees = await empRes.json();
    document.getElementById('selectEmployee').innerHTML += employees.map(e => 
        `<option value="${e.EmployeeID}">${e.FirstName} ${e.LastName}</option>`).join('');

    loadOrders();
}

async function loadOrders() {
    const res = await fetch('http://localhost:3000/api/orders');
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

    await fetch('http://localhost:3000/api/orders', {
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

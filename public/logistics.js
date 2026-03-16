const API_URL = window.location.origin + '/api/logistics';

async function loadLogistics() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();
        const tbody = document.getElementById('logisticsTableBody');
        
        tbody.innerHTML = data.map(l => `
            <tr>
                <td>#${l.DeliveryID}</td>
                <td class="fw-bold">#${l.OrderID}</td>
                <td>${l.CustomerName}</td>
                <td><span class="badge ${l.DeliveryType === 'Delivery' ? 'bg-primary' : 'bg-info'}">${l.DeliveryType}</span></td>
                <td>${l.Date}</td>
                <td><span class="badge ${l.DeliveryStatus === 'Completed' ? 'bg-success' : 'bg-secondary'}">${l.DeliveryStatus}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-dark" onclick="updateStatus(${l.DeliveryID})">Update Status</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load logistics:', error);
        const tbody = document.getElementById('logisticsTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Unable to load logistics. Check console for details.</td></tr>`;
    }
}

async function loadOrdersForDropdown() {
    try {
        const res = await fetch(window.location.origin + '/api/orders');
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const orders = await res.json();
        const select = document.getElementById('logOrderSelect');
        select.innerHTML += orders.map(o => `<option value="${o.OrderID}">Order #${o.OrderID}</option>`).join('');
    } catch (error) {
        console.error('Failed to load orders dropdown:', error);
    }
}

async function scheduleLogistics() {
    const body = {
        OrderID: document.getElementById('logOrderSelect').value,
        DeliveryType: document.getElementById('logType').value,
        DeliveryDate: document.getElementById('logDate').value,
        DeliveryStatus: document.getElementById('logStatus').value
    };
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`Create failed (${res.status})`);
        await loadLogistics();
    } catch (error) {
        console.error('Failed to schedule logistics:', error);
        alert('Unable to schedule logistics. See console for details.');
    }
}

async function updateStatus(id) {
    const newStatus = prompt("Enter Status (Pending, In Transit, Completed):", "Completed");
    if (newStatus) {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ DeliveryStatus: newStatus })
            });
            if (!res.ok) throw new Error(`Update failed (${res.status})`);
            await loadLogistics();
        } catch (error) {
            console.error('Failed to update logistics status:', error);
            alert('Unable to update status. See console for details.');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadOrdersForDropdown();
    loadLogistics();
    document.getElementById('scheduleBtn').addEventListener('click', scheduleLogistics);
});

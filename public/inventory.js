const API_URL = 'http://localhost:3000/api/inventory';

async function loadInventory() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();
        const tbody = document.getElementById('inventoryTableBody');
        
        tbody.innerHTML = data.map(i => `
            <tr>
                <td>#${i.InventoryID}</td>
                <td class="fw-bold">${i.ProductName}</td>
                <td>
                    <span class="fw-bold ${i.StockQuantity < 10 ? 'text-danger' : 'text-dark'}">
                        ${i.StockQuantity}
                    </span>
                </td>
                <td class="text-muted small">${i.LastUpdated}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adjustStock(${i.InventoryID}, ${i.StockQuantity})">Adjust</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load inventory:', error);
        const tbody = document.getElementById('inventoryTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Unable to load inventory. Check console for details.</td></tr>`;
    }
}

async function loadProductsForDropdown() {
    try {
        const res = await fetch('http://localhost:3000/api/products');
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const products = await res.json();
        const select = document.getElementById('invProductSelect');
        select.innerHTML += products.map(p => `<option value="${p.ProductID}">${p.ProductName}</option>`).join('');
    } catch (error) {
        console.error('Failed to load product dropdown:', error);
    }
}

async function addInventoryTracker() {
    const body = {
        ProductID: document.getElementById('invProductSelect').value,
        StockQuantity: document.getElementById('invQty').value
    };
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`Create failed (${res.status})`);
        await loadInventory();
    } catch (error) {
        console.error('Failed to add inventory tracker:', error);
        alert('Unable to add inventory tracker. See console for details.');
    }
}

async function adjustStock(id, current) {
    const newQty = prompt("Enter new total stock quantity:", current);
    if (newQty !== null) {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ StockQuantity: newQty })
            });
            if (!res.ok) throw new Error(`Update failed (${res.status})`);
            await loadInventory();
        } catch (error) {
            console.error('Failed to update stock:', error);
            alert('Unable to update stock. See console for details.');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadProductsForDropdown();
    loadInventory();
    document.getElementById('invAddBtn').addEventListener('click', addInventoryTracker);
});

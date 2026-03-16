async function loadInventoryReport() {
    try {
        const res = await fetch('http://localhost:3000/api/reports/inventory-status');
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

        const data = await res.json();
        const tbody = document.getElementById('inventoryReportBody');

        tbody.innerHTML = data.map(item => {
            // Logic to determine stock status
            let statusBadge = '<span class="badge bg-success">In Stock</span>';
            let stockClass = 'text-dark';

            if (item.StockQuantity <= 0) {
                statusBadge = '<span class="badge bg-danger">Out of Stock</span>';
                stockClass = 'text-danger fw-bold';
            } else if (item.StockQuantity < 5) {
                statusBadge = '<span class="badge bg-warning text-dark">Low Stock</span>';
                stockClass = 'text-warning fw-bold';
            }

            return `
                <tr>
                    <td>#${item.ProductID}</td>
                    <td class="fw-bold">${item.ProductName}</td>
                    <td>${item.Category || 'General'}</td>
                    <td class="${stockClass}">${item.StockQuantity || 0}</td>
                    <td>₱${parseFloat(item.UnitPrice).toFixed(2)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load inventory report:', error);
        const tbody = document.getElementById('inventoryReportBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Unable to load inventory report. See console for details.</td></tr>`;
    }
}

window.addEventListener('DOMContentLoaded', loadInventoryReport);

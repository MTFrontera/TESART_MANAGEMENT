async function loadSummary() {
    try {
        const res = await fetch(window.location.origin + '/api/reports/summary');
        if (!res.ok) throw new Error('Failed to load report summary');
        const data = await res.json();
        const tbody = document.getElementById('summaryTableBody');

        tbody.innerHTML = data.map(row => `
        <tr>
            <td class="fw-bold">#${row.OrderID}</td>
            <td>${row.CustomerName}</td>
            <td>${new Date(row.OrderDate).toLocaleDateString()}</td>
            <td class="text-success fw-bold">₱${parseFloat(row.TotalAmount).toFixed(2)}</td>
            <td>
                <span class="badge ${row.OrderStatus === 'Completed' ? 'bg-success' : 'bg-warning'}">
                    ${row.OrderStatus}
                </span>
            </td>
        </tr>
    `).join('');
    } catch (err) {
        console.error(err);
        const tbody = document.getElementById('summaryTableBody');
        tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Unable to load report data.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', loadSummary);
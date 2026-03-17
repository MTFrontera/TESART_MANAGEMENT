async function loadDashboard() {
    try {
        const res = await fetch(window.location.origin + '/api/dashboard/stats');
        const data = await res.json();

        // Update the UI with real numbers
        document.getElementById('statRevenue').innerText = `₱${parseFloat(data.revenue).toLocaleString()}`;
        document.getElementById('statCustomers').innerText = data.customers;
        document.getElementById('statStock').innerText = data.lowstock;
        
    } catch (error) {
        console.error("Dashboard failed to load:", error);
    }
}

loadDashboard();
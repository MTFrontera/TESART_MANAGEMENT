const API_URL = window.location.origin + '/api/customers';

async function loadCustomers() {
    const res = await fetch(API_URL);
    const data = await res.json();
    const tbody = document.getElementById('customerTableBody');
    
    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.CustomerID}</td>
            <td class="fw-bold">${c.FirstName} ${c.LastName}</td>
            <td>${c.Email}</td>
            <td>${c.PhoneNumber}</td>
            <td>${c.Address}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick='editMode(${JSON.stringify(c)})'>Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer(${c.CustomerID})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function saveCustomer() {
    const id = document.getElementById('editCustId').value;
    const body = {
        FirstName: document.getElementById('fName').value,
        LastName: document.getElementById('lName').value,
        Email: document.getElementById('cEmail').value,
        PhoneNumber: document.getElementById('cPhone').value,
        Address: document.getElementById('cAddress').value
    };

    await fetch(id ? `${API_URL}/${id}` : API_URL, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    resetForm();
    loadCustomers();
}

function editMode(c) {
    document.getElementById('formTitle').innerText = "Edit Customer #" + c.CustomerID;
    document.getElementById('editCustId').value = c.CustomerID;
    document.getElementById('fName').value = c.FirstName;
    document.getElementById('lName').value = c.LastName;
    document.getElementById('cEmail').value = c.Email;
    document.getElementById('cPhone').value = c.PhoneNumber;
    document.getElementById('cAddress').value = c.Address;
    document.getElementById('submitBtn').innerText = "Update Details";
}

function resetForm() {
    document.getElementById('formTitle').innerText = "Register New Customer";
    document.getElementById('editCustId').value = "";
    document.querySelectorAll('.form-control').forEach(i => i.value = "");
    document.getElementById('submitBtn').innerText = "Save Customer";
}

async function deleteCustomer(id) {
    if(confirm('Delete this customer?')) {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if(!res.ok) alert("Error: This customer likely has existing orders!");
        loadCustomers();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    document.getElementById('submitBtn').addEventListener('click', saveCustomer);
});

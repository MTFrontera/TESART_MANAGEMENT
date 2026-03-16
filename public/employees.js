const API_URL = window.location.origin + '/api/employees';

async function loadEmployees() {
    const res = await fetch(API_URL);
    const data = await res.json();
    const tbody = document.getElementById('employeeTableBody');
    
    tbody.innerHTML = data.map(e => `
        <tr>
            <td>${e.EmployeeID}</td>
            <td class="fw-bold">${e.FirstName} ${e.LastName}</td>
            <td><span class="badge bg-secondary">${e.Role}</span></td>
            <td>${e.ContactNumber}</td>
            <td>${e.ReportsTo || 'None'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick='editMode(${JSON.stringify(e)})'>Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${e.EmployeeID})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function saveEmployee() {
    const id = document.getElementById('editEmpId').value;
    const body = {
        FirstName: document.getElementById('eFName').value,
        LastName: document.getElementById('eLName').value,
        Role: document.getElementById('eRole').value,
        ContactNumber: document.getElementById('ePhone').value,
        ReportsTo: document.getElementById('eReports').value
    };

    await fetch(id ? `${API_URL}/${id}` : API_URL, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    resetForm();
    loadEmployees();
}

function editMode(e) {
    document.getElementById('formTitle').innerText = "Edit Staff #" + e.EmployeeID;
    document.getElementById('editEmpId').value = e.EmployeeID;
    document.getElementById('eFName').value = e.FirstName;
    document.getElementById('eLName').value = e.LastName;
    document.getElementById('eRole').value = e.Role;
    document.getElementById('ePhone').value = e.ContactNumber;
    document.getElementById('eReports').value = e.ReportsTo || "";
    document.getElementById('submitBtn').innerText = "Update Staff";
}

function resetForm() {
    document.getElementById('formTitle').innerText = "Add Staff Member";
    document.getElementById('editEmpId').value = "";
    document.querySelectorAll('.form-control').forEach(i => i.value = "");
    document.getElementById('submitBtn').innerText = "Save Employee";
}

async function deleteEmployee(id) {
    if(confirm('Remove this staff member?')) {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if(!res.ok) alert("Cannot delete: Employee has history in Orders!");
        loadEmployees();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    document.getElementById('submitBtn').addEventListener('click', saveEmployee);
});

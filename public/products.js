const API_URL = window.location.origin + '/api/products';

// 1. Load products on start
async function loadProducts() {
    const res = await fetch(API_URL);
    const data = await res.json();
    const tbody = document.getElementById('productTableBody');
    
    tbody.innerHTML = '';

    data.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.ProductID}</td>
            <td class="fw-bold">${p.ProductName}</td>
            <td>${p.Description || ''}</td>
            <td>₱${parseFloat(p.UnitPrice || 0).toFixed(2)}</td>
            <td><span class="badge bg-info text-dark">${p.Category || ''}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-edit">Edit</button>
                <button class="btn btn-sm btn-outline-danger btn-delete">Delete</button>
            </td>
        `;

        row.querySelector('.btn-edit').addEventListener('click', () => editMode(p));
        row.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(p.ProductID));

        tbody.appendChild(row);
    });
}

// 2. Add or Update Product
async function saveProduct() {
    const id = document.getElementById('editProductId').value;
    const body = {
        ProductName: document.getElementById('prodName').value,
        Description: document.getElementById('prodDesc').value,
        UnitPrice: document.getElementById('prodPrice').value,
        Category: document.getElementById('prodCategory').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Failed to save product');
        }

        resetForm();
        await loadProducts();
    } catch (err) {
        console.error(err);
        alert('Unable to save product. See console for details.');
    }
}

// 3. Switch form to "Edit Mode"
function editMode(product) {
    document.getElementById('formTitle').innerText = "Edit Product #" + product.ProductID;
    document.getElementById('editProductId').value = product.ProductID;
    document.getElementById('prodName').value = product.ProductName;
    document.getElementById('prodDesc').value = product.Description;
    document.getElementById('prodPrice').value = product.UnitPrice;
    document.getElementById('prodCategory').value = product.Category;
    document.getElementById('submitBtn').innerText = "Update Product";
}

function resetForm() {
    document.getElementById('formTitle').innerText = "Add New Product";
    document.getElementById('editProductId').value = "";
    document.getElementById('prodName').value = "";
    document.getElementById('prodDesc').value = "";
    document.getElementById('prodPrice').value = "";
    document.getElementById('submitBtn').innerText = "Save Product";
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Failed to delete product');
        }

        await loadProducts();
    } catch (err) {
        console.error(err);
        alert('Cannot delete product (it may be linked to existing orders).');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBtn').addEventListener('click', (event) => {
        event.preventDefault();
        saveProduct();
    });

    loadProducts();
});
const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

js = js.replace(/openDeleteProductModal/g, "openDeleteModal");
js = js.replace(/admin_token/g, "adminToken");
js = js.replace(/onclick="openDeleteModal\('\$\{product.ma_sp\}'\)"/g, "onclick=\"openDeleteModal('${product.ma_sp}', 'product')\"");

const confirmDeleteOld = `async function confirmDelete() {
    const id = document.getElementById('delete-item-id').value;
    const type = document.getElementById('delete-item-type').value;

    let url = '';
    if (type === 'product') url = \`\${API_BASE_URL}/products/\${id}\`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` }
        });
        if(res.ok) {
            showToast('Đã xóa thành công!', 'success');
            closeAllModals();
            if (type === 'product') fetchProducts();
        } else {
            showToast('Xóa thất bại', 'error');
        }
    } catch(e) {
        showToast('Lỗi kết nối Server', 'error');
    }
}`;

const confirmDeleteNew = `async function confirmDelete() {
    const id = document.getElementById('delete-item-id').value;
    const type = document.getElementById('delete-item-type').value;

    let url = '';
    if (type === 'product') url = \`\${API_BASE_URL}/products/\${id}\`;
    else if (type === 'customer') url = \`\${API_BASE_URL}/customers/\${id}\`;
    else if (type === 'order') url = \`\${API_BASE_URL}/orders/\${id}\`;
    else if (type === 'employee') url = \`\${API_BASE_URL}/employees/\${id}\`;
    else if (type === 'supplier') url = \`\${API_BASE_URL}/suppliers/\${id}\`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` }
        });
        if(res.ok) {
            showToast('Đã xóa thành công!', 'success');
            closeAllModals();
            if (type === 'product') fetchProducts();
            else if (type === 'customer') fetchCustomers();
            else if (type === 'order') fetchOrders();
            else if (type === 'employee') fetchEmployees();
            else if (type === 'supplier') fetchSuppliers();
        } else {
            showToast('Xóa thất bại', 'error');
        }
    } catch(e) {
        showToast('Lỗi kết nối Server', 'error');
    }
}`;
js = js.replace(confirmDeleteOld, confirmDeleteNew);

const newFunctions = `
// ---- CUSTOMER CRUD ----
async function openAddCustomerModal() {
    document.getElementById('c-is-edit').value = 'false';
    document.getElementById('modal-customer-title').innerText = 'Thêm Khách hàng';
    document.getElementById('form-customer').reset();
    document.getElementById('c-ma_kh').readOnly = false;
    openModal('modal-customer');
}

async function openEditCustomerModal(ma_kh) {
    try {
        const res = await fetch(\`\${API_BASE_URL}/customers\`);
        const items = await res.json();
        const c = items.find(x => x.ma_kh === ma_kh);
        if(!c) return showToast('Không tìm thấy KH', 'error');

        document.getElementById('c-is-edit').value = 'true';
        document.getElementById('modal-customer-title').innerText = 'Sửa Khách hàng: ' + ma_kh;
        document.getElementById('c-ma_kh').value = c.ma_kh;
        document.getElementById('c-ma_kh').readOnly = true;
        document.getElementById('c-hoten').value = c.ho_ten_kh || '';
        document.getElementById('c-diachi').value = c.dia_chi || '';
        document.getElementById('c-sdt').value = c.sdt || '';
        document.getElementById('c-email').value = c.email || '';
        document.getElementById('c-diem').value = c.diem_tich_luy || 0;
        document.getElementById('c-hang').value = c.hang_thanh_vien || 'Bronze';
        
        openModal('modal-customer');
    } catch(e) {
        showToast('Lỗi tải dữ liệu KH', 'error');
    }
}

async function submitCustomerForm() {
    const isEdit = document.getElementById('c-is-edit').value === 'true';
    const ma_kh = document.getElementById('c-ma_kh').value.trim();
    if(!ma_kh) return showToast('Vui lòng nhập Mã KH', 'error');

    const payload = {
        ma_kh: ma_kh,
        ho_ten_kh: document.getElementById('c-hoten').value.trim(),
        dia_chi: document.getElementById('c-diachi').value.trim(),
        sdt: document.getElementById('c-sdt').value.trim(),
        email: document.getElementById('c-email').value.trim(),
        diem_tich_luy: parseInt(document.getElementById('c-diem').value) || 0,
        hang_thanh_vien: document.getElementById('c-hang').value
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? \`\${API_BASE_URL}/customers/\${ma_kh}\` : \`\${API_BASE_URL}/customers\`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật KH!' : 'Đã thêm KH mới!', 'success');
            closeAllModals();
            fetchCustomers();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Có lỗi xảy ra', 'error');
        }
    } catch(e) {
        showToast('Lỗi kết nối Server', 'error');
    }
}

// ---- ORDER CRUD ----
async function openAddOrderModal() {
    document.getElementById('o-is-edit').value = 'false';
    document.getElementById('modal-order-title').innerText = 'Thêm Đơn hàng';
    document.getElementById('form-order').reset();
    document.getElementById('o-ma_hd').readOnly = false;
    openModal('modal-order');
}

async function openEditOrderModal(ma_hd) {
    try {
        const res = await fetch(\`\${API_BASE_URL}/orders\`);
        const items = await res.json();
        const o = items.find(x => x.ma_hd === ma_hd);
        if(!o) return showToast('Không tìm thấy HĐ', 'error');

        document.getElementById('o-is-edit').value = 'true';
        document.getElementById('modal-order-title').innerText = 'Sửa Đơn hàng: ' + ma_hd;
        document.getElementById('o-ma_hd').value = o.ma_hd;
        document.getElementById('o-ma_hd').readOnly = true;
        document.getElementById('o-ma_kh').value = o.ma_kh || '';
        document.getElementById('o-ma_nv').value = o.ma_nv || '';
        document.getElementById('o-ngay').value = o.ngay_tao || '';
        document.getElementById('o-tong').value = o.tong_tien || 0;
        document.getElementById('o-tt').value = o.phuong_thuc_thanh_toan || 'Cash';
        document.getElementById('o-trangthai').value = o.trang_thai || 'Pending';
        
        openModal('modal-order');
    } catch(e) {
        showToast('Lỗi tải dữ liệu HĐ', 'error');
    }
}

async function submitOrderForm() {
    const isEdit = document.getElementById('o-is-edit').value === 'true';
    const ma_hd = document.getElementById('o-ma_hd').value.trim();
    if(!ma_hd) return showToast('Vui lòng nhập Mã HĐ', 'error');

    const payload = {
        ma_hd: ma_hd,
        ma_kh: document.getElementById('o-ma_kh').value.trim(),
        ma_nv: document.getElementById('o-ma_nv').value.trim(),
        ngay_tao: document.getElementById('o-ngay').value,
        tong_tien: parseFloat(document.getElementById('o-tong').value) || 0,
        phuong_thuc_thanh_toan: document.getElementById('o-tt').value,
        trang_thai: document.getElementById('o-trangthai').value
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? \`\${API_BASE_URL}/orders/\${ma_hd}\` : \`\${API_BASE_URL}/orders\`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật HĐ!' : 'Đã thêm HĐ mới!', 'success');
            closeAllModals();
            fetchOrders();
        } else {
            showToast('Có lỗi xảy ra', 'error');
        }
    } catch(e) {
        showToast('Lỗi Server', 'error');
    }
}

// ---- EMPLOYEE CRUD ----
async function openAddEmployeeModal() {
    document.getElementById('e-is-edit').value = 'false';
    document.getElementById('modal-employee-title').innerText = 'Thêm Nhân viên';
    document.getElementById('form-employee').reset();
    document.getElementById('e-ma_nv').readOnly = false;
    openModal('modal-employee');
}

async function openEditEmployeeModal(ma_nv) {
    try {
        const res = await fetch(\`\${API_BASE_URL}/employees\`);
        const items = await res.json();
        const e = items.find(x => x.ma_nv === ma_nv);
        if(!e) return showToast('Không tìm thấy NV', 'error');

        document.getElementById('e-is-edit').value = 'true';
        document.getElementById('modal-employee-title').innerText = 'Sửa Nhân viên: ' + ma_nv;
        document.getElementById('e-ma_nv').value = e.ma_nv;
        document.getElementById('e-ma_nv').readOnly = true;
        document.getElementById('e-hoten').value = e.ho_ten_nv || '';
        document.getElementById('e-ngaysinh').value = e.ngay_sinh || '';
        document.getElementById('e-gioitinh').value = e.gioi_tinh || 'Nam';
        document.getElementById('e-sdt').value = e.sdt || '';
        document.getElementById('e-vitri').value = e.ma_vi_tri || '';
        
        openModal('modal-employee');
    } catch(err) {
        showToast('Lỗi tải dữ liệu NV', 'error');
    }
}

async function submitEmployeeForm() {
    const isEdit = document.getElementById('e-is-edit').value === 'true';
    const ma_nv = document.getElementById('e-ma_nv').value.trim();
    if(!ma_nv) return showToast('Vui lòng nhập Mã NV', 'error');

    const payload = {
        ma_nv: ma_nv,
        ho_ten_nv: document.getElementById('e-hoten').value.trim(),
        ngay_sinh: document.getElementById('e-ngaysinh').value || null,
        gioi_tinh: document.getElementById('e-gioitinh').value || null,
        sdt: document.getElementById('e-sdt').value.trim(),
        ma_vi_tri: document.getElementById('e-vitri').value.trim()
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? \`\${API_BASE_URL}/employees/\${ma_nv}\` : \`\${API_BASE_URL}/employees\`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật NV!' : 'Đã thêm NV mới!', 'success');
            closeAllModals();
            fetchEmployees();
        } else {
            showToast('Có lỗi xảy ra', 'error');
        }
    } catch(err) {
        showToast('Lỗi Server', 'error');
    }
}

// ---- SUPPLIER CRUD ----
async function openAddSupplierModal() {
    document.getElementById('s-is-edit').value = 'false';
    document.getElementById('modal-supplier-title').innerText = 'Thêm Nhà cung cấp';
    document.getElementById('form-supplier').reset();
    document.getElementById('s-ma_ncc').readOnly = false;
    openModal('modal-supplier');
}

async function openEditSupplierModal(ma_ncc) {
    try {
        const res = await fetch(\`\${API_BASE_URL}/suppliers\`);
        const items = await res.json();
        const s = items.find(x => x.ma_ncc === ma_ncc);
        if(!s) return showToast('Không tìm thấy NCC', 'error');

        document.getElementById('s-is-edit').value = 'true';
        document.getElementById('modal-supplier-title').innerText = 'Sửa Nhà cung cấp: ' + ma_ncc;
        document.getElementById('s-ma_ncc').value = s.ma_ncc;
        document.getElementById('s-ma_ncc').readOnly = true;
        document.getElementById('s-ten').value = s.ten_ncc || '';
        document.getElementById('s-sdt').value = s.sdt || '';
        document.getElementById('s-email').value = s.email || '';
        document.getElementById('s-diachi').value = s.dia_chi || '';
        
        openModal('modal-supplier');
    } catch(err) {
        showToast('Lỗi tải dữ liệu NCC', 'error');
    }
}

async function submitSupplierForm() {
    const isEdit = document.getElementById('s-is-edit').value === 'true';
    const ma_ncc = document.getElementById('s-ma_ncc').value.trim();
    if(!ma_ncc) return showToast('Vui lòng nhập Mã NCC', 'error');

    const payload = {
        ma_ncc: ma_ncc,
        ten_ncc: document.getElementById('s-ten').value.trim(),
        sdt: document.getElementById('s-sdt').value.trim(),
        email: document.getElementById('s-email').value.trim(),
        dia_chi: document.getElementById('s-diachi').value.trim()
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? \`\${API_BASE_URL}/suppliers/\${ma_ncc}\` : \`\${API_BASE_URL}/suppliers\`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật NCC!' : 'Đã thêm NCC mới!', 'success');
            closeAllModals();
            fetchSuppliers();
        } else {
            showToast('Có lỗi xảy ra', 'error');
        }
    } catch(err) {
        showToast('Lỗi Server', 'error');
    }
}
`;
if (!js.includes('openAddCustomerModal')) {
    js += newFunctions;
}
fs.writeFileSync('app.js', js, 'utf8');
console.log('done updating app.js');

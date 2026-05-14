const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../html/index.html');
const jsPath = path.join(__dirname, '../js/app.js');

let html = fs.readFileSync(htmlPath, 'utf8');

// Replace table controls
html = html.replace(/<button class="btn-filter"[\s\S]*?filterTable\('crud-customers-body','search-customers'\).*?>[\s\S]*?Lọc<\/button>/, '<button class="btn-filter" onclick="openFilterCustomerModal()"><i class="fas fa-filter"></i> Lọc chi tiết</button>');
html = html.replace(/<button class="btn-filter-clear" onclick="clearFilter\('crud-customers-body','search-customers'\)">Xóa<\/button>/, '<button class="btn-filter-clear" onclick="clearFilterAPI_Customer()">Xóa</button>');

html = html.replace(/<button class="btn-filter"[\s\S]*?filterTable\('crud-orders-body','search-orders'\).*?>[\s\S]*?Lọc<\/button>/, '<button class="btn-filter" onclick="openFilterOrderModal()"><i class="fas fa-filter"></i> Lọc chi tiết</button>');
html = html.replace(/<button class="btn-filter-clear" onclick="clearFilter\('crud-orders-body','search-orders'\)">Xóa<\/button>/, '<button class="btn-filter-clear" onclick="clearFilterAPI_Order()">Xóa</button>');

html = html.replace(/<button class="btn-filter"[\s\S]*?filterTable\('crud-employees-body','search-employees'\).*?>[\s\S]*?Lọc<\/button>/, '<button class="btn-filter" onclick="openFilterEmployeeModal()"><i class="fas fa-filter"></i> Lọc chi tiết</button>');
html = html.replace(/<button class="btn-filter-clear" onclick="clearFilter\('crud-employees-body','search-employees'\)">Xóa<\/button>/, '<button class="btn-filter-clear" onclick="clearFilterAPI_Employee()">Xóa</button>');

html = html.replace(/<button class="btn-filter"[\s\S]*?filterTable\('crud-suppliers-body','search-suppliers'\).*?>[\s\S]*?Lọc<\/button>/, '<button class="btn-filter" onclick="openFilterSupplierModal()"><i class="fas fa-filter"></i> Lọc chi tiết</button>');
html = html.replace(/<button class="btn-filter-clear" onclick="clearFilter\('crud-suppliers-body','search-suppliers'\)">Xóa<\/button>/, '<button class="btn-filter-clear" onclick="clearFilterAPI_Supplier()">Xóa</button>');

// Append Modals
const modals = `
    <!-- 8. Advanced Filter Modal (Customers) -->
    <div id="modal-filter-customer" class="modal-box" style="display: none;">
        <div class="modal-header">
            <h5>Lọc Khách hàng Nâng cao</h5>
            <button type="button" class="close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="form-filter-customer" onsubmit="event.preventDefault(); applyFilterCustomer();">
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Hạng TV</label>
                    <div class="col-sm-8">
                        <select id="f-c-hang" class="form-control">
                            <option value="">-- Tất cả --</option>
                             <option value="Vô hạng">Vô hạng</option>
                             <option value="Sắt">Sắt</option>
                             <option value="Đồng">Đồng</option>
                             <option value="Vàng">Vàng</option>
                             <option value="Bạch kim">Bạch kim</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Điểm từ</label>
                    <div class="col-sm-8"><input type="number" id="f-c-diem-min" class="form-control" placeholder="0"></div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="applyFilterCustomer()"><i class="fas fa-filter"></i> Áp dụng Lọc</button>
            <button class="btn btn-secondary" onclick="closeAllModals()"><i class="fas fa-times"></i> Hủy</button>
        </div>
    </div>

    <!-- 9. Advanced Filter Modal (Orders) -->
    <div id="modal-filter-order" class="modal-box" style="display: none;">
        <div class="modal-header">
            <h5>Lọc Đơn hàng Nâng cao</h5>
            <button type="button" class="close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="form-filter-order" onsubmit="event.preventDefault(); applyFilterOrder();">
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Ngày tạo</label>
                    <div class="col-sm-8"><input type="date" id="f-o-ngay" class="form-control"></div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Trạng thái</label>
                    <div class="col-sm-8">
                        <select id="f-o-trangthai" class="form-control">
                            <option value="">-- Tất cả --</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Đang xử lý">Đang xử lý</option>
                            <option value="Đã hủy">Đã hủy</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Thanh toán</label>
                    <div class="col-sm-8">
                        <select id="f-o-tt" class="form-control">
                            <option value="">-- Tất cả --</option>
                            <option value="Tiền mặt">Tiền mặt</option>
                            <option value="Chuyển khoản">Chuyển khoản</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="applyFilterOrder()"><i class="fas fa-filter"></i> Áp dụng Lọc</button>
            <button class="btn btn-secondary" onclick="closeAllModals()">&times;</button>
        </div>
    </div>

    <!-- 10. Advanced Filter Modal (Employees) -->
    <div id="modal-filter-employee" class="modal-box" style="display: none;">
        <div class="modal-header">
            <h5>Lọc Nhân viên Nâng cao</h5>
            <button type="button" class="close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="form-filter-employee" onsubmit="event.preventDefault(); applyFilterEmployee();">
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Giới tính</label>
                    <div class="col-sm-8">
                        <select id="f-e-gioitinh" class="form-control">
                            <option value="">-- Tất cả --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Vị trí (Mã)</label>
                    <div class="col-sm-8"><input type="text" id="f-e-vitri" class="form-control" placeholder="Mã ví trí"></div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="applyFilterEmployee()"><i class="fas fa-filter"></i> Áp dụng Lọc</button>
            <button class="btn btn-secondary" onclick="closeAllModals()"><i class="fas fa-times"></i> Hủy</button>
        </div>
    </div>

    <!-- 11. Advanced Filter Modal (Suppliers) -->
    <div id="modal-filter-supplier" class="modal-box" style="display: none;">
        <div class="modal-header">
            <h5>Lọc Nhà cung cấp Nâng cao</h5>
            <button type="button" class="close" onclick="closeAllModals()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="form-filter-supplier" onsubmit="event.preventDefault(); applyFilterSupplier();">
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Tên NCC</label>
                    <div class="col-sm-8"><input type="text" id="f-s-ten" class="form-control" placeholder="Nhập một phần tên"></div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-4 col-form-label">Địa chỉ</label>
                    <div class="col-sm-8"><input type="text" id="f-s-diachi" class="form-control" placeholder="Thành phố / Tỉnh"></div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" onclick="applyFilterSupplier()"><i class="fas fa-filter"></i> Áp dụng Lọc</button>
            <button class="btn btn-secondary" onclick="closeAllModals()"><i class="fas fa-times"></i> Hủy</button>
        </div>
    </div>
`;

if (!html.includes('id="modal-filter-customer"')) {
    html = html.replace('</body>', modals + '</body>');
} else {
    // If modal already exists, we should update the select options
    html = html.replace(/<select id="f-c-hang"[\s\S]*?<\/select>/, `
                        <select id="f-c-hang" class="form-control">
                            <option value="">-- Tất cả --</option>
                             <option value="Vô hạng">Vô hạng</option>
                             <option value="Sắt">Sắt</option>
                             <option value="Đồng">Đồng</option>
                             <option value="Vàng">Vàng</option>
                             <option value="Bạch kim">Bạch kim</option>
                        </select>
    `);
}

fs.writeFileSync(htmlPath, html, 'utf8');

// Also update app.js with the filter functions
let js = fs.readFileSync(jsPath, 'utf8');

const filterLogic = `
// ================= ADVANCED FILTERS =================

// CUSTOMER
function openFilterCustomerModal() {
    document.getElementById('form-filter-customer').reset();
    openModal('modal-filter-customer');
}

async function applyFilterCustomer() {
    const hang = document.getElementById('f-c-hang').value;
    const minDiem = parseInt(document.getElementById('f-c-diem-min').value);
    
    try {
        const res = await fetch(\`\${API_BASE_URL}/customers\`);
        let items = await res.json();
        
        if (hang) items = items.filter(x => x.ten_hang === hang);
        if (!isNaN(minDiem)) items = items.filter(x => (x.diem_tich_luy||0) >= minDiem);
        
        const crudBody = document.getElementById('crud-customers-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = \`<tr><td colspan="8" class="text-center">Không tìm thấy khách hàng.</td></tr>\`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                    <td class="text-center"><span class="badge-secondary border-0">\${item.ma_kh}</span></td>
                    <td>\${item.ho_ten_kh}</td>
                    <td>\${item.dia_chi || ''}</td>
                    <td class="text-center">\${item.sdt || ''}</td>
                    <td>\${item.email || ''}</td>
                    <td class="text-center">\${item.diem_tich_luy}</td>
                    <td class="text-center">\${item.ten_hang}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditCustomerModal('\${item.ma_kh}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('\${item.ma_kh}', 'customer')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                \`;
                crudBody.appendChild(tr);
            });
            initSortable('crud-customers-body');
        }
        closeAllModals();
        showToast(\`Đã lọc ra \${items.length} kết quả\`, 'info');
    } catch(e) { showToast('Lỗi Server', 'error'); }
}

function clearFilterAPI_Customer() {
    document.getElementById('search-customers').value = '';
    fetchCustomers();
    showToast('Đã xóa bộ lọc', 'info');
}

// ORDER
function openFilterOrderModal() {
    document.getElementById('form-filter-order').reset();
    openModal('modal-filter-order');
}

async function applyFilterOrder() {
    const ngay = document.getElementById('f-o-ngay').value;
    const tt = document.getElementById('f-o-trangthai').value;
    const method = document.getElementById('f-o-tt').value;
    
    try {
        const res = await fetch(\`\${API_BASE_URL}/orders\`);
        let items = await res.json();
        
        if (ngay) items = items.filter(x => x.ngay_tao === ngay);
        if (tt) items = items.filter(x => x.trang_thai === tt);
        if (method) items = items.filter(x => x.phuong_thuc_thanh_toan === method);
        
        const crudBody = document.getElementById('crud-orders-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = \`<tr><td colspan="8" class="text-center">Không tìm thấy đơn hàng.</td></tr>\`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                    <td class="text-center"><span class="badge-secondary border-0">\${item.ma_hd}</span></td>
                    <td class="text-center">\${item.ngay_tao}</td>
                    <td class="text-center">\${item.tong_tien_sau_giam.toLocaleString('vi-VN')} đ</td>
                    <td class="text-center">\${item.phuong_thuc_thanh_toan}</td>
                    <td class="text-center">\${item.trang_thai}</td>
                    <td class="text-center">\${item.ma_kh}</td>
                    <td class="text-center">\${item.ma_nv}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditOrderModal('\${item.ma_hd}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('\${item.ma_hd}', 'order')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                \`;
                crudBody.appendChild(tr);
            });
            initSortable('crud-orders-body');
        }
        closeAllModals();
        showToast(\`Đã lọc ra \${items.length} kết quả\`, 'info');
    } catch(e) { showToast('Lỗi Server', 'error'); }
}

function clearFilterAPI_Order() {
    document.getElementById('search-orders').value = '';
    fetchOrders();
    showToast('Đã xóa bộ lọc', 'info');
}

// EMPLOYEE
function openFilterEmployeeModal() {
    document.getElementById('form-filter-employee').reset();
    openModal('modal-filter-employee');
}

async function applyFilterEmployee() {
    const gt = document.getElementById('f-e-gioitinh').value;
    const vitri = document.getElementById('f-e-vitri').value.trim().toLowerCase();
    
    try {
        const res = await fetch(\`\${API_BASE_URL}/employees\`);
        let items = await res.json();
        
        if (gt) items = items.filter(x => x.gioi_tinh === gt);
        if (vitri) items = items.filter(x => (x.ma_vi_tri||'').toLowerCase().includes(vitri));
        
        const crudBody = document.getElementById('crud-employees-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = \`<tr><td colspan="7" class="text-center">Không tìm thấy nhân viên.</td></tr>\`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                    <td class="text-center"><span class="badge-secondary border-0">\${item.ma_nv}</span></td>
                    <td>\${item.ho_ten_nv}</td>
                    <td class="text-center">\${item.ngay_sinh || ''}</td>
                    <td class="text-center">\${item.gioi_tinh || ''}</td>
                    <td class="text-center">\${item.sdt || ''}</td>
                    <td class="text-center">\${item.ma_vi_tri || ''}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditEmployeeModal('\${item.ma_nv}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('\${item.ma_nv}', 'employee')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                \`;
                crudBody.appendChild(tr);
            });
            initSortable('crud-employees-body');
        }
        closeAllModals();
        showToast(\`Đã lọc ra \${items.length} kết quả\`, 'info');
    } catch(e) { showToast('Lỗi Server', 'error'); }
}

function clearFilterAPI_Employee() {
    document.getElementById('search-employees').value = '';
    fetchEmployees();
    showToast('Đã xóa bộ lọc', 'info');
}

// SUPPLIER
function openFilterSupplierModal() {
    document.getElementById('form-filter-supplier').reset();
    openModal('modal-filter-supplier');
}

async function applyFilterSupplier() {
    const ten = document.getElementById('f-s-ten').value.trim().toLowerCase();
    const diachi = document.getElementById('f-s-diachi').value.trim().toLowerCase();
    
    try {
        const res = await fetch(\`\${API_BASE_URL}/suppliers\`);
        let items = await res.json();
        
        if (ten) items = items.filter(x => (x.ten_ncc||'').toLowerCase().includes(ten));
        if (diachi) items = items.filter(x => (x.dia_chi||'').toLowerCase().includes(diachi));
        
        const crudBody = document.getElementById('crud-suppliers-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = \`<tr><td colspan="6" class="text-center">Không tìm thấy nhà cung cấp.</td></tr>\`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                    <td class="text-center"><span class="badge-secondary border-0">\${item.ma_ncc}</span></td>
                    <td>\${item.ten_ncc}</td>
                    <td>\${item.dia_chi || ''}</td>
                    <td class="text-center">\${item.sdt || ''}</td>
                    <td>\${item.email || ''}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditSupplierModal('\${item.ma_ncc}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('\${item.ma_ncc}', 'supplier')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                \`;
                crudBody.appendChild(tr);
            });
            initSortable('crud-suppliers-body');
        }
        closeAllModals();
        showToast(\`Đã lọc ra \${items.length} kết quả\`, 'info');
    } catch(e) { showToast('Lỗi Server', 'error'); }
}

function clearFilterAPI_Supplier() {
    document.getElementById('search-suppliers').value = '';
    fetchSuppliers();
    showToast('Đã xóa bộ lọc', 'info');
}
`;

if (!js.includes('applyFilterSupplier')) {
    js += filterLogic;
} else {
    js = js.replace(/if \(hang\) items = items\.filter\(x => x\.hang_thanh_vien === hang\);/g, 'if (hang) items = items.filter(x => x.ten_hang === hang);');
    js = js.replace(/<td class="text-center">\${item\.hang_thanh_vien}<\/td>/g, '<td class="text-center">${item.ten_hang}</td>');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('done formatting filters');

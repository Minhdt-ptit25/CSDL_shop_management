const API_BASE_URL = 'http://localhost:8000/api/v1';

// ── Search / Filter / Sort ──────────────────────────────────────────────────

/**
 * Filter table rows by searching all cell text content.
 * @param {string} tbodyId - id of the <tbody>
 * @param {string} inputId - id of the search <input>
 */
function filterTable(tbodyId, inputId) {
    const query = document.getElementById(inputId).value.trim().toLowerCase();
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const rows = tbody.querySelectorAll(`tr:not(.no-results-row)`);
    let visibleCount = 0;

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (!query || text.includes(query)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    let noResultsRow = document.getElementById(`no-results-${tbodyId}`);
    if (visibleCount === 0 && rows.length > 0) {
        if (!noResultsRow) {
            const cols = rows[0].cells.length || 1;
            noResultsRow = document.createElement('tr');
            noResultsRow.id = `no-results-${tbodyId}`;
            noResultsRow.className = 'no-results-row';
            noResultsRow.innerHTML = `<td colspan="${cols}" class="text-center text-danger" style="padding: 2rem 0;"><i class="fas fa-exclamation-circle mb-2" style="font-size: 1.5rem; display: block;"></i> Không tìm thấy thông tin nào phù hợp.</td>`;
            tbody.appendChild(noResultsRow);
        }
        noResultsRow.style.display = '';
    } else if (noResultsRow) {
        noResultsRow.style.display = 'none';
    }
}

/** Clear filter and show all rows */
function clearFilter(tbodyId, inputId) {
    const input = document.getElementById(inputId);
    if (input) input.value = '';
    document.querySelectorAll(`#${tbodyId} tr`).forEach(row => row.style.display = '');
    const noResultsRow = document.getElementById(`no-results-${tbodyId}`);
    if (noResultsRow) noResultsRow.style.display = 'none';
}

/** Attach click-to-sort to all .sortable th elements inside a table */
function initSortable(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const table = tbody.closest('table');
    if (!table) return;
    table.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const colIdx = parseInt(th.getAttribute('data-col'));
            const asc = !th.classList.contains('asc');
            // Reset all headers in this table
            table.querySelectorAll('th.sortable').forEach(h => h.classList.remove('asc', 'desc'));
            th.classList.add(asc ? 'asc' : 'desc');
            // Sort visible rows
            const rows = Array.from(tbody.querySelectorAll('tr:not(.no-results-row)'));
            rows.sort((a, b) => {
                const aText = (a.cells[colIdx]?.textContent || '').trim().toLowerCase();
                const bText = (b.cells[colIdx]?.textContent || '').trim().toLowerCase();
                const aNum = parseFloat(aText.replace(/[^\d.-]/g, ''));
                const bNum = parseFloat(bText.replace(/[^\d.-]/g, ''));
                if (!isNaN(aNum) && !isNaN(bNum)) return asc ? aNum - bNum : bNum - aNum;
                return asc ? aText.localeCompare(bText, 'vi') : bText.localeCompare(aText, 'vi');
            });
            rows.forEach(r => tbody.appendChild(r));
        });
    });
}

// Map the inputs to their responsive tbodys since we removed the onclick on the 'Filter' button
document.addEventListener('DOMContentLoaded', () => {
    const tableMap = {
        'search-products': 'crud-products-body',
        'search-customers': 'crud-customers-body',
        'search-orders': 'crud-orders-body',
        'search-employees': 'crud-employees-body',
        'search-suppliers': 'crud-suppliers-body'
    };

    document.querySelectorAll('.table-search-input').forEach(input => {
        input.addEventListener('input', () => {
            const tbodyId = tableMap[input.id];
            if (tbodyId) filterTable(tbodyId, input.id);
        });
    });
});

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Fetch Dashboard Stats
async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('stat-orders').innerHTML = `<span>${stats.total_orders}</span>`;
        document.getElementById('stat-revenue').innerHTML = `<span>${formatCurrency(stats.total_revenue)}</span>`;
        document.getElementById('stat-customers').innerHTML = `<span>${stats.total_customers}</span>`;
        document.getElementById('stat-products').innerHTML = `<span>${stats.total_products}</span>`;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Fetch Products
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        const dashboardBody = document.getElementById('products-table-body');
        const crudBody = document.getElementById('crud-products-body');
        
        if (dashboardBody) dashboardBody.innerHTML = '';
        if (crudBody) crudBody.innerHTML = '';
        
        if (products.length === 0) {
            const emptyMsg = `<tr><td colspan="5" class="text-center">Không tìm thấy sản phẩm.</td></tr>`;
            if (dashboardBody) dashboardBody.innerHTML = emptyMsg;
            if (crudBody) crudBody.innerHTML = emptyMsg;
            return;
        }

        products.forEach((product) => {
            // Dashboard Row
            if (dashboardBody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center"><span class="badge-secondary border-0">${product.ma_sp}</span></td>
                    <td>
                        <div class="product-name-column">
                            <div class="table-info-heading">${product.ten_sp}</div>
                        </div>
                    </td>
                    <td class="text-center">${product.danh_muc}</td>
                    <td class="text-center"><span class="badge-info">${product.mua_vu}</span></td>
                `;
                dashboardBody.appendChild(tr);
            }

            // CRUD Management Row
            if (crudBody) {
                const tr2 = document.createElement('tr');
                tr2.innerHTML = `
                    <td class="text-center"><span class="badge-secondary border-0">${product.ma_sp}</span></td>
                    <td><div class="table-info-heading">${product.ten_sp}</div></td>
                    <td class="text-center">${product.danh_muc}</td>
                    <td class="text-center">${product.chat_lieu}</td>
                    <td class="text-center"><span class="badge-info">${product.mua_vu}</span></td>
                    <td class="text-center">${product.gioi_tinh}</td>
                    <td class="text-center">${product.ma_ncc}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditProductModal('${product.ma_sp}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${product.ma_sp}', 'product')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                crudBody.appendChild(tr2);
            }
        });
        initSortable('crud-products-body');
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Fetch Customers
async function fetchCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/customers`);
        const items = await response.json();
        const crudBody = document.getElementById('crud-customers-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) return crudBody.innerHTML = `<tr><td colspan="7" class="text-center">Không có dữ liệu.</td></tr>`;
        
        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center"><span class="badge-secondary border-0">${item.ma_kh}</span></td>
                <td><div class="table-info-heading">${item.ho_ten_kh}</div></td>
                <td>${item.dia_chi}</td>
                <td class="text-center">${item.sdt}</td>
                <td>${item.email}</td>
                <td class="text-center">${item.diem_tich_luy}</td>
                <td class="text-center"><span class="badge-info">${item.hang_thanh_vien}</span></td>
                <td class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-warning" onclick="openEditCustomerModal('${item.ma_kh}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_kh}', 'customer')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            crudBody.appendChild(tr);
        });
        initSortable('crud-customers-body');
    } catch (e) {}
}

// Fetch Orders
async function fetchOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const items = await response.json();
        const crudBody = document.getElementById('crud-orders-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) return crudBody.innerHTML = `<tr><td colspan="7" class="text-center">Không có dữ liệu.</td></tr>`;
        
        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center"><span class="badge-secondary border-0">${item.ma_hd}</span></td>
                <td class="text-center">${item.ngay_tao}</td>
                <td class="text-center" style="font-weight:bold;">${formatCurrency(item.tong_tien)}</td>
                <td class="text-center">${item.phuong_thuc_thanh_toan}</td>
                <td class="text-center"><span class="badge-info">${item.trang_thai}</span></td>
                <td class="text-center">${item.ma_kh}</td>
                <td class="text-center">${item.ma_nv}</td>
                <td class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-warning" onclick="openEditOrderModal('${item.ma_hd}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_hd}', 'order')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            crudBody.appendChild(tr);
        });
        initSortable('crud-orders-body');
    } catch (e) {}
}

// Fetch Employees
async function fetchEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`);
        const items = await response.json();
        const crudBody = document.getElementById('crud-employees-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) return crudBody.innerHTML = `<tr><td colspan="6" class="text-center">Không có dữ liệu.</td></tr>`;
        
        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center"><span class="badge-secondary border-0">${item.ma_nv}</span></td>
                <td><div class="table-info-heading">${item.ho_ten_nv}</div></td>
                <td class="text-center">${item.ngay_sinh}</td>
                <td class="text-center">${item.gioi_tinh}</td>
                <td class="text-center">${item.sdt}</td>
                <td class="text-center"><span class="badge-info">${item.ma_vi_tri}</span></td>
                <td class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-warning" onclick="openEditEmployeeModal('${item.ma_nv}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_nv}', 'employee')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            crudBody.appendChild(tr);
        });
        initSortable('crud-employees-body');
    } catch (e) {}
}

// Fetch Suppliers
async function fetchSuppliers() {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`);
        const items = await response.json();
        const crudBody = document.getElementById('crud-suppliers-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) return crudBody.innerHTML = `<tr><td colspan="5" class="text-center">Không có dữ liệu.</td></tr>`;
        
        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center"><span class="badge-secondary border-0">${item.ma_ncc}</span></td>
                <td><div class="table-info-heading">${item.ten_ncc}</div></td>
                <td>${item.dia_chi}</td>
                <td class="text-center">${item.sdt}</td>
                <td>${item.email}</td>
                <td class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-warning" onclick="openEditSupplierModal('${item.ma_ncc}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_ncc}', 'supplier')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            crudBody.appendChild(tr);
        });
        initSortable('crud-suppliers-body');
    } catch (e) {
        console.error('Error fetching suppliers:', e);
    }
}

// SPA Routing Logic
function initRouting() {
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    const views = document.querySelectorAll('.app-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('mm-active'));
            views.forEach(v => v.classList.remove('active'));
            
            link.classList.add('mm-active');
            
            const targetViewId = 'view-' + link.getAttribute('data-view');
            const targetView = document.getElementById(targetViewId);
            if(targetView) {
                targetView.classList.add('active');
            }
        });
    });
}

// Authentication Flow
function showLoginModal() {
    document.getElementById('login-overlay').classList.add('active');
}

function hideLoginModal() {
    document.getElementById('login-overlay').classList.remove('active');
}

function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    // Check if we are on the new home.html file
    const isHomePage = window.location.pathname.endsWith('home.html');

    if(token) {
        if(isHomePage) {
            window.location.href = 'index.html';
            return;
        }

        // We are on index.html, setup dashboard layout naturally
        document.body.classList.remove('logged-out-layout');
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.remove('active');
        
        const authHeader = document.getElementById('header-auth');
        if (authHeader) authHeader.style.display = 'block';
        const unauthHeader = document.getElementById('header-unauth');
        if (unauthHeader) unauthHeader.style.display = 'none';

        const searchBar = document.getElementById('header-search-bar');
        const logoUnauth = document.getElementById('header-logo-unauth');
        if(searchBar) searchBar.style.display = '';
        if(logoUnauth) logoUnauth.style.display = 'none';

        // Assure a view is active
        if (!document.querySelector('.app-view.active')) {
            const dash = document.getElementById('view-dashboard');
            if(dash) dash.classList.add('active');
        }
    } else {
        if(!isHomePage) {
            // Not logged in but viewing index.html -> redirect to home.html
            window.location.href = 'home.html';
            return;
        }

        // We are on home.html, configure the basic landing UI
        document.body.classList.add('logged-out-layout');
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.remove('active'); // Hide popup, wait for button
        
        const authHeader = document.getElementById('header-auth');
        if (authHeader) authHeader.style.display = 'none';
        const unauthHeader = document.getElementById('header-unauth');
        if (unauthHeader) unauthHeader.style.display = 'flex';

        const sidebar = document.querySelector('.app-sidebar');
        const headerLeft = document.querySelector('.app-header-left');
        const mainOuter = document.querySelector('.app-main__outer');
        const header = document.querySelector('.app-header');
        const searchBar = document.getElementById('header-search-bar');
        const logoUnauth = document.getElementById('header-logo-unauth');

        if(sidebar) sidebar.style.display = 'none';
        if(headerLeft) headerLeft.style.display = '';
        if(mainOuter) mainOuter.style.paddingLeft = '0';
        if(header) { header.style.marginLeft = '0'; header.style.width = '100%'; }
        
        if(searchBar) searchBar.style.display = 'none';
        if(logoUnauth) logoUnauth.style.display = 'block';

        document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
        if(document.getElementById('view-home')) document.getElementById('view-home').classList.add('active');
    }
}

async function attemptLogin() {
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    const errDiv = document.getElementById('login-error');
    errDiv.style.display = 'none';

    try {
        const resp = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        if(resp.ok) {
            const data = await resp.json();
            localStorage.setItem('adminToken', data.access_token);
            checkAuthStatus();
            showToast('Đăng nhập thành công!', 'success');
        } else {
            errDiv.innerText = 'Sai tài khoản hoặc mật khẩu!';
            errDiv.style.display = 'block';
        }
    } catch(e) {
        errDiv.innerText = 'Lỗi kết nối server.';
        errDiv.style.display = 'block';
    }
}

// Admin dropdown uses CSS :hover, so we don't need JS toggles.

function logout(e) {
    if(e) e.stopPropagation();
    localStorage.removeItem('adminToken');
    checkAuthStatus();
    showToast('Đã đăng xuất tài khoản.', 'info');
}

// Toast Notification System
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; padding: 15px 25px; border-radius: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; font-weight: 500; transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); color: white;';
        document.body.appendChild(toast);
    }
    
    let bgColor = '#28a745'; // success
    let icon = 'fa-check-circle';
    if (type === 'error') { bgColor = '#dc3545'; icon = 'fa-exclamation-circle'; }
    if (type === 'info') { bgColor = '#17a2b8'; icon = 'fa-info-circle'; }
    
    toast.style.background = bgColor;
    toast.innerHTML = `<i class="fas ${icon} fa-lg"></i> <span style="font-size: 1.05rem;">${message}</span>`;
    
    // Animate in
    setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 50);
    
    // Auto hide
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initRouting();
    fetchStats();
    fetchProducts();
    fetchCustomers();
    fetchOrders();
    fetchEmployees();
    fetchSuppliers();
    
    // Auto-refresh dashboard every 5 seconds (stats)
    setInterval(() => {
        fetchStats();
    }, 5000);
    
    // Auto-refresh tables every 10 seconds (data)
    setInterval(() => {
        fetchProducts();
        fetchCustomers();
        fetchOrders();
        fetchEmployees();
        fetchSuppliers();
    }, 10000);
});

// ===================== MODAL LOGIC =====================
function openModal(id) {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById(id).style.display = 'flex';
}

function closeAllModals() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
}

// ---- PRODUCT CRUD ----
async function openAddProductModal() {
    document.getElementById('p-is-edit').value = 'false';
    document.getElementById('modal-product-title').innerText = 'Thêm Sản phẩm';
    document.getElementById('form-product').reset();
    document.getElementById('p-ma_sp').readOnly = false;
    openModal('modal-product');
}

async function openEditProductModal(ma_sp) {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);
        const products = await res.json();
        const p = products.find(x => x.ma_sp === ma_sp);
        if(!p) return showToast('Không tìm thấy SP', 'error');

        document.getElementById('p-is-edit').value = 'true';
        document.getElementById('modal-product-title').innerText = 'Sửa Sản phẩm: ' + ma_sp;
        document.getElementById('p-ma_sp').value = p.ma_sp;
        document.getElementById('p-ma_sp').readOnly = true;
        document.getElementById('p-ten_sp').value = p.ten_sp || '';
        document.getElementById('p-gia').value = p.gia_ban || p.gia_nhap || 0;
        document.getElementById('p-soluong').value = p.so_luong_ton || 0;
        document.getElementById('p-maloai').value = p.ma_loai || '';
        document.getElementById('p-hang').value = p.ma_ncc || '';
        openModal('modal-product');
    } catch(e) {
        showToast('Lỗi tải dữ liệu SP', 'error');
    }
}

async function submitProductForm() {
    const isEdit = document.getElementById('p-is-edit').value === 'true';
    const ma_sp = document.getElementById('p-ma_sp').value.trim();
    if(!ma_sp) return showToast('Vui lòng nhập Mã SP', 'error');

    const payload = {
        ma_sp: ma_sp,
        ten_sp: document.getElementById('p-ten_sp').value.trim(),
        gia_ban: parseFloat(document.getElementById('p-gia').value) || 0,
        gia_nhap: parseFloat(document.getElementById('p-gia').value) || 0,
        so_luong_ton: parseInt(document.getElementById('p-soluong').value) || 0,
        ma_loai: document.getElementById('p-maloai').value.trim(),
        ma_ncc: document.getElementById('p-hang').value.trim(),
        danh_muc: "Thời Trang", mua_vu: "All", gioi_tinh: "Unisex", chat_lieu: "Cotton"
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_BASE_URL}/products/${ma_sp}` : `${API_BASE_URL}/products`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật SP!' : 'Đã thêm SP mới!', 'success');
            closeAllModals();
            fetchStats();
            fetchProducts();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Có lỗi xảy ra', 'error');
        }
    } catch(e) {
        showToast('Lỗi kết nối Server', 'error');
    }
}

// ---- DELETE LOGIC ----
function openDeleteModal(id, type = 'product') {
    document.getElementById('delete-target-id').innerText = id;
    document.getElementById('delete-item-id').value = id;
    document.getElementById('delete-item-type').value = type;
    openModal('modal-delete');
}

async function confirmDelete() {
    const id = document.getElementById('delete-item-id').value;
    const type = document.getElementById('delete-item-type').value;

    let url = '';
    if (type === 'product') url = `${API_BASE_URL}/products/${id}`;
    else if (type === 'customer') url = `${API_BASE_URL}/customers/${id}`;
    else if (type === 'order') url = `${API_BASE_URL}/orders/${id}`;
    else if (type === 'employee') url = `${API_BASE_URL}/employees/${id}`;
    else if (type === 'supplier') url = `${API_BASE_URL}/suppliers/${id}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if(res.ok) {
            showToast('Đã xóa thành công!', 'success');
            closeAllModals();
            fetchStats(); // Refresh stats after delete
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
}

// ---- FILTER LOGIC ----
function openFilterProductModal() {
    document.getElementById('form-filter-product').reset();
    openModal('modal-filter-product');
}

async function applyAdvancedFilterProduct() {
    const maLoai = document.getElementById('f-p-maloai').value.trim().toLowerCase();
    const hang = document.getElementById('f-p-hang').value.trim().toLowerCase();
    const minPrice = parseFloat(document.getElementById('f-p-minprice').value);
    const maxPrice = parseFloat(document.getElementById('f-p-maxprice').value);

    try {
        const res = await fetch(`${API_BASE_URL}/products`);
        let products = await res.json();

        if (maLoai) products = products.filter(p => (p.ma_loai||'').toLowerCase().includes(maLoai));
        if (hang) products = products.filter(p => (p.ma_ncc||'').toLowerCase().includes(hang));
        if (!isNaN(minPrice)) products = products.filter(p => parseFloat(p.gia_ban) >= minPrice || parseFloat(p.gia_nhap) >= minPrice);
        if (!isNaN(maxPrice)) products = products.filter(p => parseFloat(p.gia_ban) <= maxPrice || parseFloat(p.gia_nhap) <= maxPrice);

        renderFilteredProducts(products);
        closeAllModals();
        showToast(`Đã lọc ra ${products.length} kết quả`, 'info');
    } catch(e) {
        showToast('Lỗi Server', 'error');
    }
}

function clearFilterAPI() {
    document.getElementById('search-products').value = '';
    fetchProducts();
    showToast('Đã xóa bộ lọc', 'info');
}

function renderFilteredProducts(products) {
    const crudBody = document.getElementById('crud-products-body');
    if (!crudBody) return;
    crudBody.innerHTML = '';
    if (products.length === 0) {
        crudBody.innerHTML = `<tr><td colspan="8" class="text-center">Không tìm thấy sản phẩm.</td></tr>`;
        return;
    }
    products.forEach((product) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center"><span class="badge-secondary border-0">${product.ma_sp}</span></td>
            <td><div class="table-info-heading">${product.ten_sp}</div></td>
            <td class="text-center">${product.danh_muc}</td>
            <td class="text-center">${product.chat_lieu}</td>
            <td class="text-center"><span class="badge-info">${product.mua_vu}</span></td>
            <td class="text-center">${product.gioi_tinh}</td>
            <td class="text-center">${product.ma_ncc}</td>
            <td class="text-center">
                <div class="btn-group">
                    <button class="btn btn-sm btn-warning" onclick="openEditProductModal('${product.ma_sp}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${product.ma_sp}', 'product')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        crudBody.appendChild(tr);
    });
    initSortable('crud-products-body');
}

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
        const res = await fetch(`${API_BASE_URL}/customers`);
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
    const url = isEdit ? `${API_BASE_URL}/customers/${ma_kh}` : `${API_BASE_URL}/customers`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật KH!' : 'Đã thêm KH mới!', 'success');
            closeAllModals();
            fetchStats();
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
        const res = await fetch(`${API_BASE_URL}/orders`);
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
    const url = isEdit ? `${API_BASE_URL}/orders/${ma_hd}` : `${API_BASE_URL}/orders`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật HĐ!' : 'Đã thêm HĐ mới!', 'success');
            closeAllModals();
            fetchStats();
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
        const res = await fetch(`${API_BASE_URL}/employees`);
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
    const url = isEdit ? `${API_BASE_URL}/employees/${ma_nv}` : `${API_BASE_URL}/employees`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật NV!' : 'Đã thêm NV mới!', 'success');
            closeAllModals();
            fetchStats();
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
        const res = await fetch(`${API_BASE_URL}/suppliers`);
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
    const url = isEdit ? `${API_BASE_URL}/suppliers/${ma_ncc}` : `${API_BASE_URL}/suppliers`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            showToast(isEdit ? 'Đã cập nhật NCC!' : 'Đã thêm NCC mới!', 'success');
            closeAllModals();
            fetchStats();
            fetchSuppliers();
        } else {
            showToast('Có lỗi xảy ra', 'error');
        }
    } catch(err) {
        showToast('Lỗi Server', 'error');
    }
}

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
        const res = await fetch(`${API_BASE_URL}/customers`);
        let items = await res.json();
        
        if (hang) items = items.filter(x => x.hang_thanh_vien === hang);
        if (!isNaN(minDiem)) items = items.filter(x => (x.diem_tich_luy||0) >= minDiem);
        
        const crudBody = document.getElementById('crud-customers-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = `<tr><td colspan="8" class="text-center">Không tìm thấy khách hàng.</td></tr>`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center"><span class="badge-secondary border-0">${item.ma_kh}</span></td>
                    <td>${item.ho_ten_kh}</td>
                    <td>${item.dia_chi || ''}</td>
                    <td class="text-center">${item.sdt || ''}</td>
                    <td>${item.email || ''}</td>
                    <td class="text-center">${item.diem_tich_luy}</td>
                    <td class="text-center">${item.hang_thanh_vien}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditCustomerModal('${item.ma_kh}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_kh}', 'customer')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                crudBody.appendChild(tr);
            });
            initSortable('crud-customers-body');
        }
        closeAllModals();
        showToast(`Đã lọc ra ${items.length} kết quả`, 'info');
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
        const res = await fetch(`${API_BASE_URL}/orders`);
        let items = await res.json();
        
        if (ngay) items = items.filter(x => x.ngay_tao === ngay);
        if (tt) items = items.filter(x => x.trang_thai === tt);
        if (method) items = items.filter(x => x.phuong_thuc_thanh_toan === method);
        
        const crudBody = document.getElementById('crud-orders-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = `<tr><td colspan="8" class="text-center">Không tìm thấy đơn hàng.</td></tr>`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center"><span class="badge-secondary border-0">${item.ma_hd}</span></td>
                    <td class="text-center">${item.ngay_tao}</td>
                    <td class="text-center">${item.tong_tien.toLocaleString('vi-VN')} đ</td>
                    <td class="text-center">${item.phuong_thuc_thanh_toan}</td>
                    <td class="text-center">${item.trang_thai}</td>
                    <td class="text-center">${item.ma_kh}</td>
                    <td class="text-center">${item.ma_nv}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditOrderModal('${item.ma_hd}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_hd}', 'order')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                crudBody.appendChild(tr);
            });
            initSortable('crud-orders-body');
        }
        closeAllModals();
        showToast(`Đã lọc ra ${items.length} kết quả`, 'info');
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
        const res = await fetch(`${API_BASE_URL}/employees`);
        let items = await res.json();
        
        if (gt) items = items.filter(x => x.gioi_tinh === gt);
        if (vitri) items = items.filter(x => (x.ma_vi_tri||'').toLowerCase().includes(vitri));
        
        const crudBody = document.getElementById('crud-employees-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = `<tr><td colspan="7" class="text-center">Không tìm thấy nhân viên.</td></tr>`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center"><span class="badge-secondary border-0">${item.ma_nv}</span></td>
                    <td>${item.ho_ten_nv}</td>
                    <td class="text-center">${item.ngay_sinh || ''}</td>
                    <td class="text-center">${item.gioi_tinh || ''}</td>
                    <td class="text-center">${item.sdt || ''}</td>
                    <td class="text-center">${item.ma_vi_tri || ''}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditEmployeeModal('${item.ma_nv}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_nv}', 'employee')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                crudBody.appendChild(tr);
            });
            initSortable('crud-employees-body');
        }
        closeAllModals();
        showToast(`Đã lọc ra ${items.length} kết quả`, 'info');
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
        const res = await fetch(`${API_BASE_URL}/suppliers`);
        let items = await res.json();
        
        if (ten) items = items.filter(x => (x.ten_ncc||'').toLowerCase().includes(ten));
        if (diachi) items = items.filter(x => (x.dia_chi||'').toLowerCase().includes(diachi));
        
        const crudBody = document.getElementById('crud-suppliers-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (items.length === 0) {
            crudBody.innerHTML = `<tr><td colspan="6" class="text-center">Không tìm thấy nhà cung cấp.</td></tr>`;
        } else {
            items.forEach((item) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center"><span class="badge-secondary border-0">${item.ma_ncc}</span></td>
                    <td>${item.ten_ncc}</td>
                    <td>${item.dia_chi || ''}</td>
                    <td class="text-center">${item.sdt || ''}</td>
                    <td>${item.email || ''}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="openEditSupplierModal('${item.ma_ncc}')"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${item.ma_ncc}', 'supplier')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                crudBody.appendChild(tr);
            });
            initSortable('crud-suppliers-body');
        }
        closeAllModals();
        showToast(`Đã lọc ra ${items.length} kết quả`, 'info');
    } catch(e) { showToast('Lỗi Server', 'error'); }
}

function clearFilterAPI_Supplier() {
    document.getElementById('search-suppliers').value = '';
    fetchSuppliers();
    showToast('Đã xóa bộ lọc', 'info');
}

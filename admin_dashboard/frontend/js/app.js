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

// Ngưỡng điểm theo ERD: Vô hạng < Sắt < Đồng < Vàng
const getMemberTier = (points) => {
    if (points >= 250) return 'Vàng';
    if (points >= 150) return 'Đồng';
    if (points >= 50)  return 'Sắt';
    return 'Vô hạng';
    if (points >= 2000) return 'Vàng';
    if (points >= 500) return 'Bạc';
    return 'Đồng';
};

let categorySalesChart = null;
let monthlyRevenueChart = null;
let yearlyRevenueChart = null;

function renderCategorySalesChart(data) {
    const ctx = document.getElementById('category-sales-chart');
    if (!ctx) return;

    const labels = data.map(item => item.category || 'Khác');
    const values = data.map(item => item.quantity || 0);
    const colors = [
        '#3f6ad8', '#16aaff', '#3ac47d', '#f7b924', '#d92550', '#434343', '#8c61ff', '#17a2b8'
    ];

    if (categorySalesChart) {
        categorySalesChart.data.labels = labels;
        categorySalesChart.data.datasets[0].data = values;
        categorySalesChart.update();
        return;
    }

    categorySalesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#fff',
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
                tooltip: { callbacks: { label: context => `${context.label}: ${context.parsed}` } }
            },
        },
    });
}

function renderMonthlyRevenueChart(data) {
    const ctx = document.getElementById('monthly-revenue-chart');
    if (!ctx) return;

    const labels = data.map(item => item.month);
    const values = data.map(item => item.revenue || 0);

    if (monthlyRevenueChart) {
        monthlyRevenueChart.data.labels = labels;
        monthlyRevenueChart.data.datasets[0].data = values;
        monthlyRevenueChart.update();
        return;
    }

    monthlyRevenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: values,
                backgroundColor: '#3f6ad8',
                borderColor: '#3152a5',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => value >= 1000 ? new Intl.NumberFormat('vi-VN').format(value) : value }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${formatCurrency(context.parsed.y)}`
                    }
                }
            }
        },
    });
}

function renderYearlyRevenueChart(data) {
    const ctx = document.getElementById('yearly-revenue-chart');
    if (!ctx) return;

    const labels = data.map(item => item.year);
    const values = data.map(item => item.revenue || 0);

    if (yearlyRevenueChart) {
        yearlyRevenueChart.data.labels = labels;
        yearlyRevenueChart.data.datasets[0].data = values;
        yearlyRevenueChart.update();
        return;
    }

    yearlyRevenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Doanh thu theo năm',
                data: values,
                backgroundColor: 'rgba(63,106,216,0.12)',
                borderColor: '#3f6ad8',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#3f6ad8',
                fill: true,
                tension: 0.25,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => value >= 1000 ? new Intl.NumberFormat('vi-VN').format(value) : value }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${formatCurrency(context.parsed.y)}`
                    }
                }
            }
        },
    });
}

function renderTopCustomersList(customers) {
    const list = document.getElementById('top-customers-list');
    if (!list) return;
    list.innerHTML = '';

    if (!Array.isArray(customers) || customers.length === 0) {
        list.innerHTML = '<li class="empty-state">Chưa có dữ liệu khách hàng.</li>';
        return;
    }

    customers.forEach((customer, index) => {
        const rank = index + 1;
        const crown = rank <= 3 ? `<span class="crown rank-${rank}" aria-hidden="true"></span>` : '';
        const li = document.createElement('li');
        li.className = 'top-customers-item';
        li.innerHTML = `
            <span class="customer-rank">${rank}</span>
            ${crown}
            <div class="customer-info">
                <div class="customer-name">${customer.ho_ten_kh}</div>
                <div class="customer-points">${customer.diem_tich_luy} điểm</div>
            </div>
        `;
        list.appendChild(li);
    });
}

async function fetchDashboardCharts() {
    try {
        const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` };
        const [categoryResp, monthlyResp, yearlyResp, topCustomersResp] = await Promise.all([
            fetch(`${API_BASE_URL}/report/category-sales`, { headers: authHeader }),
            fetch(`${API_BASE_URL}/report/sales-monthly`, { headers: authHeader }),
            fetch(`${API_BASE_URL}/report/sales-yearly`, { headers: authHeader }),
            fetch(`${API_BASE_URL}/report/top-customers`, { headers: authHeader }),
        ]);

        const [categoryData, monthlyData, yearlyData, topCustomersData] = await Promise.all([
            categoryResp.ok ? categoryResp.json() : [],
            monthlyResp.ok ? monthlyResp.json() : [],
            yearlyResp.ok ? yearlyResp.json() : [],
            topCustomersResp.ok ? topCustomersResp.json() : [],
        ]);

        renderCategorySalesChart(Array.isArray(categoryData) ? categoryData : []);
        renderMonthlyRevenueChart(Array.isArray(monthlyData) ? monthlyData : []);
        renderYearlyRevenueChart(Array.isArray(yearlyData) ? yearlyData : []);
        renderTopCustomersList(Array.isArray(topCustomersData) ? topCustomersData : []);
    } catch (error) {
        console.error('Error fetching dashboard charts:', error);
    }
}

// Fetch Dashboard Stats
async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const stats = await response.json();
        
        const elOrders = document.getElementById('stat-orders');
        const elRevenue = document.getElementById('stat-revenue');
        const elCustomers = document.getElementById('stat-customers');
        const elLowStock = document.getElementById('stat-low-stock');

        if (elOrders) elOrders.innerHTML = `<span>${stats.total_orders || 0}</span>`;
        if (elRevenue) elRevenue.innerHTML = `<span>${formatCurrency(stats.total_revenue || 0)}</span>`;
        if (elCustomers) elCustomers.innerHTML = `<span>${stats.total_customers || 0}</span>`;
        if (elLowStock) elLowStock.innerHTML = `<span>${stats.low_stock_count || 0}</span>`;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Fetch Products
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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
                    <td class="text-center"><span class="badge-info">${product.chat_lieu}</span></td>
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
                    <td class="text-center">${product.gioi_tinh}</td>
                    <td class="text-center">${product.ma_ncc}</td>
                    <td class="text-center">${product.so_luong_du || 0}</td>
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
        const response = await fetch(`${API_BASE_URL}/customers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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
                <td>${item.dia_chi || ''}</td>
                <td class="text-center">${item.sdt}</td>
                <td>${item.email || ''}</td>
                <td class="text-center">${item.diem_tich_luy}</td>
                <td class="text-center"><span class="badge-info">${item.ten_hang}</span></td>
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
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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
                <td class="text-center" style="font-weight:bold;">${formatCurrency(item.tong_tien_sau_giam)}</td>
                <td class="text-center" style="font-weight:bold;">${formatCurrency(item.tong_tien_sau_giam)}</td>
                <td class="text-center">${item.phuong_thuc_thanh_toan}</td>
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
        const response = await fetch(`${API_BASE_URL}/employees`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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
        const response = await fetch(`${API_BASE_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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

// Fetch Delete Requests (Admin)
async function fetchRequests() {
    try {
        const token = localStorage.getItem('adminToken');
        
        // Fetch cart item delete requests
        const resCart = await fetch(`${API_BASE_URL}/orders/cart/delete-requests/list?trang_thai=pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const cartItems = resCart.ok ? await resCart.json() : [];
        
        // Fetch order delete requests
        const resOrder = await fetch(`${API_BASE_URL}/orders/delete-requests/list?trang_thai=pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orderItems = resOrder.ok ? await resOrder.json() : [];

        // Normalize data
        const allRequests = [
            ...cartItems.map(item => ({
                id: item.id,
                type: 'cart',
                typeStr: 'Xóa SP (Giỏ)',
                target: item.ma_sku,
                cashier: item.ten_nv_cashier,
                reason: item.ly_do,
                date: new Date(item.ngay_tao)
            })),
            ...orderItems.map(item => ({
                id: item.ma_hd,
                type: 'order',
                typeStr: 'Xóa Hóa đơn',
                target: item.ma_hd,
                cashier: item.ten_nv_cashier,
                reason: item.ly_do,
                date: new Date(item.ngay_tao)
            }))
        ];

        // Sort by date descending
        allRequests.sort((a, b) => b.date - a.date);

        const crudBody = document.getElementById('crud-requests-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        
        if (allRequests.length === 0) {
            return crudBody.innerHTML = `<tr><td colspan="8" class="text-center">Không có yêu cầu chờ duyệt.</td></tr>`;
        }
        
        allRequests.forEach(item => {
            const tr = document.createElement('tr');
            
            let actionBtns = '';
            if (item.type === 'cart') {
                actionBtns = `
                    <button class="btn btn-sm btn-success" onclick="approveCartRequest('${item.id}')" title="Duyệt"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="rejectCartRequest('${item.id}')" title="Từ chối"><i class="fas fa-times"></i></button>
                `;
            } else if (item.type === 'order') {
                actionBtns = `
                    <button class="btn btn-sm btn-success" onclick="approveOrderRequest('${item.id}')" title="Duyệt"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="rejectOrderRequest('${item.id}')" title="Từ chối"><i class="fas fa-times"></i></button>
                `;
            }

            tr.innerHTML = `
                <td class="text-center"><span class="badge-secondary border-0">${item.id.slice(-6)}</span></td>
                <td class="text-center"><span class="badge ${item.type === 'cart' ? 'badge-info' : 'badge-danger'}">${item.typeStr}</span></td>
                <td class="text-center">${item.cashier}</td>
                <td class="text-center"><strong>${item.target}</strong></td>
                <td>${item.reason || ''}</td>
                <td class="text-center">${item.date.toLocaleString('vi-VN')}</td>
                <td class="text-center"><span class="text-warning">Chờ duyệt</span></td>
                <td class="text-center">
                    <div class="btn-group">
                        ${actionBtns}
                    </div>
                </td>
            `;
            crudBody.appendChild(tr);
        });
    } catch (e) {
        console.error('Error fetching requests:', e);
    }
}

async function approveCartRequest(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/cart/delete-requests/${id}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
            showToast('Đã duyệt yêu cầu xóa!', 'success');
            fetchRequests();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Lỗi duyệt yêu cầu', 'error');
        }
    } catch (e) {
        showToast('Lỗi kết nối', 'error');
    }
}

async function rejectCartRequest(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/cart/delete-requests/${id}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
            showToast('Đã từ chối yêu cầu xóa!', 'info');
            fetchRequests();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Lỗi từ chối yêu cầu', 'error');
        }
    } catch (e) {
        showToast('Lỗi kết nối', 'error');
    }
}

async function approveOrderRequest(ma_hd) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${ma_hd}/confirm-delete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
            showToast('Đã duyệt yêu cầu xóa hóa đơn!', 'success');
            fetchRequests();
            fetchOrders();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Lỗi duyệt yêu cầu', 'error');
        }
    } catch (e) {
        showToast('Lỗi kết nối', 'error');
    }
}

async function rejectOrderRequest(ma_hd) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${ma_hd}/reject-delete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
            showToast('Đã từ chối yêu cầu xóa hóa đơn!', 'info');
            fetchRequests();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Lỗi từ chối yêu cầu', 'error');
        }
    } catch (e) {
        showToast('Lỗi kết nối', 'error');
    }
}
// SPA Routing Logic
const viewFetchMap = {
    'dashboard': () => { fetchStats(); fetchDashboardCharts(); },
    'products':  fetchProducts,
    'customers': fetchCustomers,
    'orders':    fetchOrders,
    'employees': fetchEmployees,
    'suppliers': fetchSuppliers,
    'requests':  fetchRequests,
    'imports':   fetchImports,
};

function initRouting() {
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    const views    = document.querySelectorAll('.app-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('mm-active'));
            views.forEach(v => v.classList.remove('active'));

            link.classList.add('mm-active');

            const view = link.getAttribute('data-view');
            const targetView = document.getElementById('view-' + view);
            if (targetView) targetView.classList.add('active');

            // Reload data của tab vừa mở
            const fetchFn = viewFetchMap[view];
            if (fetchFn) fetchFn();
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

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    const isHomePage = window.location.pathname.endsWith('home.html');

    if(token) {
        if(isHomePage) {
            window.location.href = 'index.html';
            return;
        }

        const user = parseJwt(token);
        if (user) {
            const nameEl = document.querySelector('.sidebar-user-name');
            const roleEl = document.querySelector('.sidebar-user-role');
            if (nameEl) nameEl.innerText = user.ho_ten || 'User';
            if (roleEl) {
                const roles = { admin: 'Quản lý', cashier: 'Thu ngân', warehouse: 'Nhân viên kho' };
                roleEl.innerText = roles[user.vai_tro] || user.vai_tro;
            }

            // RBAC: Hide menu items
            const navLinks = document.querySelectorAll('.nav-link[data-view]');
            navLinks.forEach(link => {
                const view = link.getAttribute('data-view');
                let visible = true;
                if (user.vai_tro === 'cashier' && !['dashboard', 'customers', 'orders'].includes(view)) visible = false;
                if (user.vai_tro === 'warehouse' && !['dashboard', 'products', 'suppliers', 'imports'].includes(view)) visible = false;
                link.parentElement.style.display = visible ? 'block' : 'none';
            });
            
            // Hiện menu Yêu cầu duyệt nếu là admin
            const menuReq = document.getElementById('menu-requests-admin');
            if (menuReq) menuReq.style.display = user.vai_tro === 'admin' ? 'block' : 'none';

            // Hiện menu Nhập hàng nếu là admin hoặc warehouse
            const menuImports = document.getElementById('menu-imports');
            if (menuImports) menuImports.style.display = (user.vai_tro === 'admin' || user.vai_tro === 'warehouse') ? 'block' : 'none';
        }

        document.body.classList.remove('logged-out-layout');
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.remove('active');
        
        const authSidebar = document.getElementById('sidebar-auth');
        if (authSidebar) authSidebar.style.display = 'flex';
        const unauthSidebar = document.getElementById('sidebar-unauth');
        if (unauthSidebar) unauthSidebar.style.display = 'none';

        if (!document.querySelector('.app-view.active')) {
            const dash = document.getElementById('view-dashboard');
            if(dash) dash.classList.add('active');
        }
    } else {
        if(!isHomePage) {
            window.location.href = 'home.html';
            return;
        }
        document.body.classList.add('logged-out-layout');
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.remove('active');
        
        const authSidebar = document.getElementById('sidebar-auth');
        if (authSidebar) authSidebar.style.display = 'none';
        const unauthSidebar = document.getElementById('sidebar-unauth');
        if (unauthSidebar) unauthSidebar.style.display = 'flex';

        const sidebar = document.querySelector('.app-sidebar');
        if(sidebar) sidebar.style.display = 'none';

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
            // Refresh data
            location.reload();
        } else {
            const data = await resp.json();
            errDiv.innerText = data.detail || 'Sai tài khoản hoặc mật khẩu!';
            errDiv.style.display = 'block';
        }
    } catch(e) {
        errDiv.innerText = 'Lỗi kết nối server.';
        errDiv.style.display = 'block';
    }
}

// Admin dropdown uses CSS :hover, so we don't need JS toggles.

// Sidebar user dropdown toggle
function toggleSidebarUserMenu(e) {
    e.stopPropagation();
    const dropdown = e.currentTarget;
    const menu = document.getElementById('sidebar-user-menu');
    
    dropdown.classList.toggle('active');
    menu.classList.toggle('active');
}

// Close sidebar menu when clicking outside
document.addEventListener('click', () => {
    const dropdown = document.querySelector('.sidebar-user-dropdown');
    const menu = document.getElementById('sidebar-user-menu');
    if (dropdown && menu) {
        dropdown.classList.remove('active');
        menu.classList.remove('active');
    }
});

function toggleAdminMenu() {
    const menu = document.getElementById('admin-menu');
    if (!menu) return;
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
}

// Đóng admin menu khi click ra ngoài
document.addEventListener('click', (e) => {
    const group = document.getElementById('admin-dropdown-group');
    const menu  = document.getElementById('admin-menu');
    if (menu && group && !group.contains(e.target)) {
        menu.style.display = 'none';
    }
});

function logout(e) {
    if(e) e.stopPropagation();
    
    // Close the menu
    const dropdown = document.querySelector('.sidebar-user-dropdown');
    const menu = document.getElementById('sidebar-user-menu');
    if (dropdown && menu) {
        dropdown.classList.remove('active');
        menu.classList.remove('active');
    }
    
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
    
    const token = localStorage.getItem('adminToken');
    const user = parseJwt(token);

    fetchStats();
    fetchDashboardCharts();

    if (user) {
        if (user.vai_tro === 'admin') {
            fetchProducts();
            fetchCustomers();
            fetchOrders();
            fetchEmployees();
            fetchSuppliers();
            fetchRequests();
            fetchImports();
        } else if (user.vai_tro === 'cashier') {
            fetchCustomers();
            fetchOrders();
        } else if (user.vai_tro === 'warehouse') {
            fetchProducts();
            fetchSuppliers();
            fetchImports();
        }
    }
    
    // Auto-refresh dashboard every 5 seconds (stats + charts)
    setInterval(() => {
        fetchStats();
        fetchDashboardCharts();
    }, 5000);
    
    // Update customer tier when points change
    const customerPointsInput = document.getElementById('c-diem');
    const customerTierInput = document.getElementById('c-hang');
    if (customerPointsInput && customerTierInput) {
        customerPointsInput.addEventListener('input', () => {
            const points = parseInt(customerPointsInput.value) || 0;
            customerTierInput.value = getMemberTier(points);
        });
    }

    // Không auto-refresh table — data được reload khi chuyển tab (xem initRouting)
});

// ===================== MODAL LOGIC =====================
let pendingRemoveRow = null;

function openModal(id) {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById(id).style.display = 'flex';
}

function closeAllModals() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
    
    pendingRemoveRow = null;
    const authUser = document.getElementById('admin-auth-username');
    if(authUser) authUser.value = '';
    const authPass = document.getElementById('admin-auth-password');
    if(authPass) authPass.value = '';
    const authErr = document.getElementById('admin-auth-error');
    if(authErr) authErr.style.display = 'none';
}

// ---- PRODUCT CRUD ----
function addSkuRow(sku = {}) {
    const tbody = document.getElementById('sku-rows-body');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="form-control form-control-sm sku-ma" placeholder="VD: SP07-D-M" value="${sku.ma_sku || ''}" required></td>
        <td><input type="text" class="form-control form-control-sm sku-mau" placeholder="Đỏ" value="${sku.mau_sac || ''}"></td>
        <td><input type="text" class="form-control form-control-sm sku-kich" placeholder="M" value="${sku.kich_co || ''}"></td>
        <td><input type="number" class="form-control form-control-sm sku-gia" placeholder="150000" value="${sku.gia_ban || ''}"></td>
        <td><input type="number" class="form-control form-control-sm sku-sl" placeholder="0" value="${sku.so_luong_ton ?? 0}"></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="fas fa-times"></i></button></td>
    `;
    tbody.appendChild(tr);
}

async function openAddProductModal() {
    document.getElementById('p-is-edit').value = 'false';
    document.getElementById('modal-product-title').innerText = 'Thêm Sản phẩm';
    document.getElementById('form-product').reset();
    document.getElementById('p-ma_sp').readOnly = false;
    document.getElementById('sku-rows-body').innerHTML = '';
    openModal('modal-product');
}

async function openEditProductModal(ma_sp) {
    try {
        const res = await fetch(`${API_BASE_URL}/products/${ma_sp}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const p = await res.json();
        if(!res.ok) return showToast(p.detail || 'Không tìm thấy SP', 'error');

        document.getElementById('p-is-edit').value = 'true';
        document.getElementById('modal-product-title').innerText = 'Sửa Sản phẩm: ' + ma_sp;
        document.getElementById('p-ma_sp').value = p.ma_sp;
        document.getElementById('p-ma_sp').readOnly = true;
        document.getElementById('p-ten_sp').value = p.ten_sp || '';
        document.getElementById('p-danhmuc').value = p.danh_muc;
        document.getElementById('p-chatlieu').value = p.chat_lieu;
        document.getElementById('p-gioitinh').value = p.gioi_tinh;
        document.getElementById('p-ma_ncc').value = p.ma_ncc || '';

        // Load existing SKU rows
        document.getElementById('sku-rows-body').innerHTML = '';
        (p.bienthes || []).forEach(sku => addSkuRow(sku));

        openModal('modal-product');
    } catch(e) {
        showToast('Lỗi tải dữ liệu SP', 'error');
    }
}

async function submitProductForm() {
    const isEdit = document.getElementById('p-is-edit').value === 'true';
    const ma_sp = document.getElementById('p-ma_sp').value.trim();
    if(!ma_sp) return showToast('Vui lòng nhập Mã SP', 'error');

    // Collect SKU rows
    const skuRows = document.querySelectorAll('#sku-rows-body tr');
    const bienthes = [];
    for (const row of skuRows) {
        const ma_sku = row.querySelector('.sku-ma').value.trim();
        const mau_sac = row.querySelector('.sku-mau').value.trim();
        const kich_co = row.querySelector('.sku-kich').value.trim();
        const gia_ban = parseFloat(row.querySelector('.sku-gia').value);
        const so_luong_ton = parseInt(row.querySelector('.sku-sl').value) || 0;
        if (!ma_sku) { showToast('Mã SKU không được để trống', 'error'); return; }
        bienthes.push({ ma_sku, mau_sac, kich_co, gia_ban, so_luong_ton });
    }

    const payload = {
        ma_sp:     ma_sp,
        ten_sp:    document.getElementById('p-ten_sp').value.trim(),
        danh_muc:  document.getElementById('p-danhmuc').value.trim() || 'Thời Trang',
        chat_lieu: document.getElementById('p-chatlieu').value.trim() || 'Cotton',
        gioi_tinh: document.getElementById('p-gioitinh').value.trim() || 'Unisex',
        ma_ncc:    document.getElementById('p-ma_ncc').value.trim(),
        bienthes,
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
    
    const modalDelete = document.getElementById('modal-delete');
    if (type === 'order') {
        modalDelete.classList.add('shake-animation');
        setTimeout(() => modalDelete.classList.remove('shake-animation'), 400);
    }
    openModal('modal-delete');
}

async function confirmDelete() {
    const id = document.getElementById('delete-item-id').value;
    const type = document.getElementById('delete-item-type').value;
    const token = localStorage.getItem('adminToken');
    const user = parseJwt(token);

    if (user && user.vai_tro !== 'admin') {
        if (user.vai_tro === 'warehouse' && type === 'product') {
            await executeDeleteRequest(id, type, token);
            return;
        }
        if (user.vai_tro === 'cashier' && type === 'order') {
            await executeDeleteRequest(id, type, token);
            return;
        }
        // Not admin, show approval modal
        openModal('modal-admin-auth');
        return;
    }

    executeDelete(id, type, token);
}

async function executeDeleteRequest(id, type, token) {
    let url = '';
    if (type === 'product') url = `${API_BASE_URL}/products/${id}/delete-request`;
    else if (type === 'order') url = `${API_BASE_URL}/orders/${id}/delete-request`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ly_do: "Yêu cầu từ nhân viên" })
        });
        if(res.ok) {
            showToast('Đã gửi yêu cầu xóa tới Admin!', 'success');
            closeAllModals();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Gửi yêu cầu xóa thất bại', 'error');
        }
    } catch(e) {
        showToast('Lỗi kết nối Server', 'error');
    }
}

async function approveDeletion() {
    const user = document.getElementById('admin-auth-username').value;
    const pass = document.getElementById('admin-auth-password').value;
    const errDiv = document.getElementById('admin-auth-error');
    errDiv.style.display = 'none';

    try {
        const resp = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            if (data.user.vai_tro !== 'admin') {
                errDiv.innerText = 'Tài khoản phê duyệt phải là Admin!';
                errDiv.style.display = 'block';
                return;
            }

            if (pendingRemoveRow) {
                pendingRemoveRow.remove();
                closeAllModals();
                return;
            }

            const id = document.getElementById('delete-item-id').value;
            const type = document.getElementById('delete-item-type').value;
            
            // Use the admin's token for this deletion
            await executeDelete(id, type, data.access_token);
            closeAllModals();
        } else {
            errDiv.innerText = 'Sai tài khoản hoặc mật khẩu Admin!';
            errDiv.style.display = 'block';
        }
    } catch(e) {
        errDiv.innerText = 'Lỗi kết nối server.';
        errDiv.style.display = 'block';
    }
}

async function executeDelete(id, type, token) {
    let url = '';
    if (type === 'product') url = `${API_BASE_URL}/products/${id}`;
    else if (type === 'customer') url = `${API_BASE_URL}/customers/${id}`;
    else if (type === 'order') url = `${API_BASE_URL}/orders/${id}`;
    else if (type === 'employee') url = `${API_BASE_URL}/employees/${id}`;
    else if (type === 'supplier') url = `${API_BASE_URL}/suppliers/${id}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            showToast('Đã xóa thành công!', 'success');
            closeAllModals();
            fetchStats();
            if (type === 'product') fetchProducts();
            else if (type === 'customer') fetchCustomers();
            else if (type === 'order') fetchOrders();
            else if (type === 'employee') fetchEmployees();
            else if (type === 'supplier') fetchSuppliers();
        } else {
            const err = await res.json();
            showToast(err.detail || 'Xóa thất bại', 'error');
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

        if (maLoai) products = products.filter(p => (p.danh_muc||'').toLowerCase().includes(maLoai));
        if (hang)   products = products.filter(p => (p.ma_ncc||'').toLowerCase().includes(hang));

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
    document.getElementById('c-hang').value = 'Vô hạng';
    openModal('modal-customer');
}

async function openEditCustomerModal(ma_kh) {
    try {
        const res = await fetch(`${API_BASE_URL}/customers/${ma_kh}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const c = await res.json();
        if(!res.ok) return showToast(c.detail || 'Không tìm thấy KH', 'error');

        document.getElementById('c-is-edit').value = 'true';
        document.getElementById('modal-customer-title').innerText = 'Sửa Khách hàng: ' + ma_kh;
        document.getElementById('c-ma_kh').value = c.ma_kh;
        document.getElementById('c-ma_kh').readOnly = true;
        document.getElementById('c-hoten').value = c.ho_ten_kh || '';
        document.getElementById('c-sdt').value = c.sdt || '';
        document.getElementById('c-diem').value = c.diem_tich_luy || 0;
        document.getElementById('c-hang').value = getMemberTier(c.diem_tich_luy || 0);
        
        openModal('modal-customer');
    } catch(e) {
        showToast('Lỗi tải dữ liệu KH', 'error');
    }
}

async function submitCustomerForm() {
    const isEdit = document.getElementById('c-is-edit').value === 'true';
    const ma_kh = document.getElementById('c-ma_kh').value.trim();
    if(!ma_kh) return showToast('Vui lòng nhập Mã KH', 'error');

    const points = parseInt(document.getElementById('c-diem').value) || 0;
    const payload = {
        ma_kh: ma_kh,
        ho_ten_kh: document.getElementById('c-hoten').value.trim(),
        sdt: document.getElementById('c-sdt').value.trim(),
        diem_tich_luy: points,
        ten_hang: getMemberTier(points)
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
let _orderCustomerInfo = null;
let _skuPriceCache = {};
let _tierDiscountCache = {};

function addOrderItem(sku = '', qty = 1) {
    const list = document.getElementById('order-items-list');
    const div = document.createElement('div');
    div.className = 'order-item-row';
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 8px; align-items: center;';
    div.innerHTML = `
        <input type="text" class="form-control item-sku" placeholder="Ma SKU" value="${sku}" required oninput="recalcOrderTotal()">
        <input type="number" class="form-control item-qty" placeholder="SL" value="${qty}" min="1" style="width: 85px;" required oninput="recalcOrderTotal()">
        <button type="button" class="btn btn-outline-danger" style="padding: 0.4rem 0.75rem;" onclick="promptRemoveOrderItem(this)"><i class="fas fa-times"></i></button>
    `;
    list.appendChild(div);
    recalcOrderTotal();
}

function promptRemoveOrderItem(btn) {
    const token = localStorage.getItem('adminToken');
    const user = parseJwt(token);

    if (user && user.vai_tro !== 'admin') {
        const sku = btn.parentElement.querySelector('.item-sku').value || '(Trống)';
        pendingRemoveRow = btn.parentElement;
        
        document.getElementById('cart-delete-sku').innerText = sku;
        document.getElementById('cart-delete-reason').value = '';
        openModal('modal-request-cart-delete');
    } else {
        btn.parentElement.remove();
    }
}

// ---- CART ITEM DELETE REQUEST (Cashier side) ----
async function submitCartItemDeleteRequest() {
    const sku = document.getElementById('cart-delete-sku').innerText;
    const reason = document.getElementById('cart-delete-reason').value.trim();
    if (!reason) return showToast('Vui lòng nhập lý do xóa', 'error');

    try {
        const res = await fetch(`${API_BASE_URL}/orders/cart/delete-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ ma_sku: sku, ly_do: reason })
        });
        
        if (res.ok) {
            const data = await res.json();
            // Đóng modal request, mở modal waiting
            document.getElementById('modal-request-cart-delete').style.display = 'none';
            document.getElementById('waiting-request-id').value = data.id;
            
            // Hiện overlay cố định không cho click đóng
            const overlay = document.getElementById('modal-overlay');
            overlay.style.display = 'block';
            overlay.onclick = null; // Chặn đóng modal khi click ra ngoài
            
            document.getElementById('modal-waiting-approval').style.display = 'block';
            
            // Bắt đầu poll
            pollCartItemDeleteRequest(data.id);
        } else {
            const err = await res.json();
            showToast(err.detail || 'Gửi yêu cầu thất bại', 'error');
        }
    } catch(e) {
        showToast('Lỗi kết nối Server', 'error');
    }
}

async function pollCartItemDeleteRequest(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/cart/delete-requests/status/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.trang_thai === 'approved') {
                if (pendingRemoveRow) pendingRemoveRow.remove();
                closeAllModals();
                // Khôi phục overlay click close
                document.getElementById('modal-overlay').onclick = closeAllModals;
                showToast('Admin đã duyệt xóa sản phẩm', 'success');
                return;
            } else if (data.trang_thai === 'rejected') {
                closeAllModals();
                document.getElementById('modal-overlay').onclick = closeAllModals;
                showToast('Admin đã TỪ CHỐI yêu cầu xóa', 'error');
                return;
            }
        }
    } catch (e) {
        console.error("Poll error:", e);
    }
    
    // Check if modal is still open before continuing to poll
    if (document.getElementById('modal-waiting-approval').style.display === 'block') {
        setTimeout(() => pollCartItemDeleteRequest(id), 3000); // 3 seconds
    }
}

async function openAddOrderModal() {
    _orderCustomerInfo = null;
    _currentVoucher = null;
    _skuPriceCache = {};
    document.getElementById('o-is-edit').value = 'false';
    document.getElementById('modal-order-title').innerText = 'Th\u00eam \u0110\u01a1n h\u00e0ng';
    document.getElementById('form-order').reset();
    document.getElementById('order-items-list').innerHTML = '';
    
    const rowMember = document.getElementById('row-member-info');
    if (rowMember) rowMember.style.display = 'none';
    
    const msgEl = document.getElementById('o-voucher-msg');
    if (msgEl) msgEl.style.display = 'none';
    
    recalcOrderTotal();
    addOrderItem();
    openModal('modal-order');
}

// Debounce timer for KH lookup
let _khTimer = null;
function onOrderCustomerChange() {
    clearTimeout(_khTimer);
    _khTimer = setTimeout(async () => {
        const ma_kh = document.getElementById('o-ma_kh').value.trim();
        const rowInfo = document.getElementById('row-member-info');
        if (!ma_kh) {
            _orderCustomerInfo = null;
            if (rowInfo) rowInfo.style.display = 'none';
            recalcOrderTotal();
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/customers/${ma_kh}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                const kh = await res.json();
                _orderCustomerInfo = kh;
                const el = document.getElementById('o-hang-tv');
                if (el) el.value = `${kh.ten_hang}  (\u0111i\u1ec3m: ${kh.diem_tich_luy})`;
                if (rowInfo) rowInfo.style.display = '';
                recalcOrderTotal();
            } else {
                _orderCustomerInfo = null;
                if (rowInfo) rowInfo.style.display = 'none';
                recalcOrderTotal();
            }
        } catch(e) {
            console.error('L\u1ed7i l\u1ea5y th\u00f4ng tin KH:', e);
        }
    }, 500);
}

// Debounce timer for Voucher lookup
let _voucherTimer = null;
let _currentVoucher = null;
function onOrderVoucherChange() {
    clearTimeout(_voucherTimer);
    _voucherTimer = setTimeout(async () => {
        const ma_voucher = document.getElementById('o-ma_voucher').value.trim();
        const msgEl = document.getElementById('o-voucher-msg');
        
        if (!ma_voucher) {
            _currentVoucher = null;
            if (msgEl) msgEl.style.display = 'none';
            recalcOrderTotal();
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/vouchers/${ma_voucher}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                const v = await res.json();
                
                // Check valid date
                const now = new Date();
                const startDate = new Date(v.ngay_bat_dau);
                const endDate = new Date(v.ngay_het_han);
                if (now < startDate || now > endDate) {
                    _currentVoucher = null;
                    if (msgEl) {
                        msgEl.innerText = "Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng";
                        msgEl.className = "form-text mt-1 text-danger";
                        msgEl.style.display = 'block';
                    }
                } else if (v.so_luong_da_dung >= v.so_luong_phat_hanh) {
                    _currentVoucher = null;
                    if (msgEl) {
                        msgEl.innerText = "Mã giảm giá đã hết lượt sử dụng";
                        msgEl.className = "form-text mt-1 text-danger";
                        msgEl.style.display = 'block';
                    }
                } else {
                    _currentVoucher = v;
                }
            } else {
                const err = await res.json();
                _currentVoucher = null;
                if (msgEl) {
                    msgEl.innerText = err.detail || "Mã voucher không hợp lệ";
                    msgEl.className = "form-text mt-1 text-danger";
                    msgEl.style.display = 'block';
                }
            }
        } catch(e) {
            console.error("Lỗi lấy thông tin Voucher:", e);
        }
        recalcOrderTotal();
    }, 500);
}

// Map t\u1ef7 l\u1ec7 gi\u1ea3m gi\u00e1 theo h\u1ea1ng th\u00e0nh vi\u00ean (ph\u1ea3i kh\u1edbp v\u1edbi HangThanhVien trong DB)
const TIER_DISCOUNT_MAP = { 'V\u00e0ng': 10, '\u0110\u1ed3ng': 5, 'S\u1eaft': 2, 'V\u00f4 h\u1ea1ng': 0 };
function getTierDiscountPct(tenHang) {
    return TIER_DISCOUNT_MAP[tenHang] ?? 0;
}

async function recalcOrderTotal() {
    const rows = document.querySelectorAll('.order-item-row');
    let tongHang = 0;
    const fetches = [];

    rows.forEach(row => {
        const ma_sku = row.querySelector('.item-sku')?.value.trim();
        const qty = parseInt(row.querySelector('.item-qty')?.value) || 0;
        if (!ma_sku || qty <= 0) return;
        fetches.push((async () => {
            if (_skuPriceCache[ma_sku] === undefined) {
                try {
                    const r = await fetch(`${API_BASE_URL}/skus/${ma_sku}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                    });
                    _skuPriceCache[ma_sku] = r.ok ? (Number((await r.json()).gia_ban) || 0) : -1;
                } catch(e) { _skuPriceCache[ma_sku] = -1; }
            }
            const skuInput = row.querySelector('.item-sku');
            if (_skuPriceCache[ma_sku] === -1) {
                skuInput.classList.add('is-invalid');
            } else {
                skuInput.classList.remove('is-invalid');
                tongHang += _skuPriceCache[ma_sku] * qty;
            }
        })());
    });
    await Promise.all(fetches);

    const pctHang = _orderCustomerInfo ? getTierDiscountPct(_orderCustomerInfo.ten_hang) : 0;
    const giamHang = Math.floor(tongHang * pctHang / 100);
    
    let giamVoucher = 0;
    const msgEl = document.getElementById('o-voucher-msg');
    
    if (_currentVoucher) {
        if (tongHang < _currentVoucher.gia_tri_don_toithieu) {
            if (msgEl) {
                msgEl.innerText = `Đơn hàng chưa đạt giá trị tối thiểu ${_currentVoucher.gia_tri_don_toithieu.toLocaleString('vi-VN')} đ để dùng voucher này. Vui lòng thêm sản phẩm hoặc đổi voucher khác.`;
                msgEl.className = "form-text mt-1 text-danger";
                msgEl.style.display = 'block';
            }
        } else {
            giamVoucher = Math.floor(tongHang * _currentVoucher.phan_tram_giam / 100);
            if (giamVoucher > _currentVoucher.so_tien_giam_toida && _currentVoucher.so_tien_giam_toida > 0) {
                giamVoucher = _currentVoucher.so_tien_giam_toida;
            }
            if (msgEl) {
                msgEl.innerText = `Voucher hợp lệ! Giảm ${_currentVoucher.phan_tram_giam}%, tối đa ${_currentVoucher.so_tien_giam_toida.toLocaleString('vi-VN')} đ`;
                msgEl.className = "form-text mt-1 text-success";
                msgEl.style.display = 'block';
            }
        }
    }

    const thanhTien = Math.max(0, tongHang - giamHang - giamVoucher);

    const fmt = n => n.toLocaleString('vi-VN') + ' \u0111';
    const setEl = (id, v) => { const el = document.getElementById(id); if(el) el.innerText = v; };
    setEl('o-pct-hang',    pctHang);
    setEl('o-tong-hang',   fmt(tongHang));
    setEl('o-giam-hang',   '-' + fmt(giamHang));
    setEl('o-giam-voucher','-' + fmt(giamVoucher));
    setEl('o-thanh-tien',  fmt(thanhTien));
}

async function openEditOrderModal(ma_hd) {
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${ma_hd}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const o = await res.json();
        if(!res.ok) return showToast(o.detail || 'Không tìm thấy HĐ', 'error');

        document.getElementById('o-is-edit').value = 'true';
        document.getElementById('modal-order-title').innerText = 'Sửa Đơn hàng: ' + ma_hd;
        document.getElementById('o-ma_hd').value = o.ma_hd;
        document.getElementById('o-ma_hd').readOnly = true;
        
        document.getElementById('o-ma_kh').value = o.ma_kh || '';
        document.getElementById('o-ma_voucher').value = o.ma_voucher || '';
        
        const ttEl = document.getElementById('o-tt');
        if (ttEl) ttEl.value = o.phuong_thuc_thanh_toan || 'Tiền mặt';

        // Xóa danh sách hiện tại
        const list = document.getElementById('order-items-list');
        list.innerHTML = '';

        // Thêm sản phẩm từ chi tiết hóa đơn
        if (o.chitiet && o.chitiet.length > 0) {
            o.chitiet.forEach(item => {
                addOrderItem(item.ma_sku, item.so_luong);
            });
        } else {
            addOrderItem();
        }

        openModal('modal-order');

        // Trigger updates để tải dữ liệu khách, voucher, tổng giá trị...
        onOrderCustomerChange();
        onOrderVoucherChange();
        
    } catch(e) {
        showToast('Lỗi tải dữ liệu HĐ', 'error');
        console.error(e);
    }
}

async function submitOrderForm() {
    const isEdit = document.getElementById('o-is-edit').value === 'true';
    if (isEdit) return showToast('Sửa hóa đơn trực tiếp không được khuyến khích. Vui lòng xóa và tạo mới để đảm bảo tồn kho.', 'info');

    const ma_hd = document.getElementById('o-ma_hd').value.trim();
    const ma_kh = document.getElementById('o-ma_kh').value.trim();
    const ma_voucher = document.getElementById('o-ma_voucher').value.trim();
    const ptth = document.getElementById('o-tt').value;

    const itemRows = document.querySelectorAll('.order-item-row');
    const items = [];
    itemRows.forEach(row => {
        const sku = row.querySelector('.item-sku').value.trim();
        const qty = parseInt(row.querySelector('.item-qty').value);
        if (sku && qty > 0) items.push({ ma_sku: sku, so_luong: qty });
    });

    if (items.length === 0) return showToast('Vui lòng thêm ít nhất 1 sản phẩm', 'error');

    const payload = {
        ma_hd: ma_hd || undefined,
        ma_kh,
        ma_voucher: ma_voucher || undefined,
        phuong_thuc_thanh_toan: ptth,
        items
    };

    try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Đã tạo hóa đơn thành công!', 'success');
            closeAllModals();
            fetchStats();
            fetchOrders();
        } else {
            const err = await res.json().catch(() => ({}));
            showToast(err.detail || 'Có lỗi xảy ra', 'error');
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
        const res = await fetch(`${API_BASE_URL}/employees/${ma_nv}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const e = await res.json();
        if(!res.ok) return showToast(e.detail || 'Không tìm thấy NV', 'error');

        document.getElementById('e-is-edit').value = 'true';
        document.getElementById('modal-employee-title').innerText = 'Sửa Nhân viên: ' + ma_nv;
        document.getElementById('e-ma_nv').value = e.ma_nv;
        document.getElementById('e-ma_nv').readOnly = true;
        document.getElementById('e-hoten').value = e.ho_ten_nv || '';
        document.getElementById('e-ngaysinh').value = e.ngay_sinh || '';
        document.getElementById('e-gioitinh').value = e.gioi_tinh || 'Nam';
        document.getElementById('e-sdt').value = e.sdt || '';
        document.getElementById('e-vitri').value = e.ma_vi_tri || '';
        document.getElementById('e-ma_ch').value = e.ma_ch || '';
        document.getElementById('e-diachi').value = e.dia_chi || '';
        document.getElementById('e-email').value = e.email || '';
        document.getElementById('e-ngayvaolam').value = e.ngay_vao_lam ? e.ngay_vao_lam.slice(0, 10) : '';
        
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
        ngay_sinh: document.getElementById('e-ngaysinh').value,
        gioi_tinh: document.getElementById('e-gioitinh').value,
        dia_chi: document.getElementById('e-diachi').value.trim(),
        sdt: document.getElementById('e-sdt').value.trim(),
        email: document.getElementById('e-email').value.trim(),
        ngay_vao_lam: document.getElementById('e-ngayvaolam').value,
        ma_vi_tri: document.getElementById('e-vitri').value.trim(),
        ma_ch: document.getElementById('e-ma_ch').value.trim(),
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
            const err = await res.json().catch(() => ({}));
            showToast(err.detail || 'Có lỗi xảy ra', 'error');
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
        const res = await fetch(`${API_BASE_URL}/suppliers/${ma_ncc}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const s = await res.json();
        if(!res.ok) return showToast(s.detail || 'Không tìm thấy NCC', 'error');

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
            const err = await res.json().catch(() => ({}));
            showToast(err.detail || 'Có lỗi xảy ra', 'error');
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
        const res = await fetch(`${API_BASE_URL}/customers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        let items = await res.json();
        
        if (hang) items = items.filter(x => x.ten_hang === hang);
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
                    <td class="text-center">${item.sdt || ''}</td>
                    <td class="text-center">${item.diem_tich_luy}</td>
                    <td class="text-center">${item.ten_hang}</td>
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
        const res = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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
                    <td class="text-center">${(item.tong_tien_sau_giam||0).toLocaleString('vi-VN')} đ</td>
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
        const res = await fetch(`${API_BASE_URL}/employees`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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
        const res = await fetch(`${API_BASE_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
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

// ══════════════════════════════════════════════════════════════════
// IMPORTS – Nhập hàng
// ══════════════════════════════════════════════════════════════════

let importItemCounter = 0;

function formatCurrencyVN(num) {
    const n = Number(num);
    if (!isFinite(n)) return '0 đ';
    return n.toLocaleString('vi-VN') + ' đ';
}

// ── Fetch & render list ──────────────────────────────────────────
async function fetchImports() {
    try {
        const response = await fetch(`${API_BASE_URL}/imports`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const items = await response.json();
        const crudBody = document.getElementById('crud-imports-body');
        if (!crudBody) return;
        crudBody.innerHTML = '';
        if (!Array.isArray(items) || items.length === 0) {
            crudBody.innerHTML = `<tr><td colspan="8" class="text-center">Không có dữ liệu.</td></tr>`;
            return;
        }
        items.forEach(item => {
            const totalQty = (item.chitiet || []).reduce((s, c) => s + (c.so_luong || 0), 0);
            const avgPrice = totalQty > 0
                ? (item.chitiet || []).reduce((s, c) => s + (Number(c.gia_nhap) * c.so_luong), 0) / totalQty
                : 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center"><span class="badge-secondary border-0">${item.ma_pn}</span></td>
                <td class="text-center">${item.ngay_nhap || ''}</td>
                <td class="text-center">${item.ma_ncc}</td>
                <td class="text-center">${item.ma_nv}</td>
                <td class="text-center">${totalQty.toLocaleString('vi-VN')}</td>
                <td class="text-center">${formatCurrencyVN(avgPrice)}</td>
                <td class="text-center" style="font-weight:bold;">${formatCurrencyVN(item.tong_tien)}</td>
                <td class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info" title="Xem chi tiết" onclick="openImportDetail('${item.ma_pn}')"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-danger" title="Xóa (admin)" onclick="deleteImport('${item.ma_pn}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            crudBody.appendChild(tr);
        });
        initSortable('crud-imports-body');
    } catch (e) {
        console.error('fetchImports error', e);
    }
}

// ── Open add modal ────────────────────────────────────────────────
function openAddImportModal() {
    importItemCounter = 0;
    document.getElementById('im-ma_pn').value = '';
    document.getElementById('im-ma_ncc').value = '';

    // Auto-fill current datetime (readonly)
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    document.getElementById('im-ngay_nhap').value = dateStr;

    // Auto-fill employee from token
    const token = localStorage.getItem('adminToken');
    const user = parseJwt(token);
    document.getElementById('im-ma_nv').value = user ? (user.ma_nv || user.sub || '') : '';

    // Clear items list and summary
    document.getElementById('import-items-list').innerHTML = '';
    document.getElementById('im-tong-sl').textContent = '0';
    document.getElementById('im-tong-tien').textContent = '0 đ';

    // Add one blank row
    addImportItem();

    openModal('modal-import');
}

// ── Add item row ──────────────────────────────────────────────────
function addImportItem() {
    importItemCounter++;
    const id = importItemCounter;
    const container = document.getElementById('import-items-list');
    const row = document.createElement('div');
    row.className = 'import-item-row';
    row.id = `import-item-${id}`;
    row.style.cssText = 'display:grid; grid-template-columns:1fr 90px 110px 36px; gap:6px; margin-bottom:6px; align-items:center;';
    row.innerHTML = `
        <input type="text" class="form-control form-control-sm im-sku" placeholder="Mã SKU" oninput="recalcImportTotal()">
        <input type="number" class="form-control form-control-sm im-qty" placeholder="SL" min="1" value="1" oninput="recalcImportTotal()">
        <input type="number" class="form-control form-control-sm im-price" placeholder="Giá nhập" min="0" step="1000" value="0" oninput="recalcImportTotal()">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeImportItem(${id})" title="Xóa dòng"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(row);
    recalcImportTotal();
}

function removeImportItem(id) {
    const el = document.getElementById(`import-item-${id}`);
    if (el) el.remove();
    recalcImportTotal();
}

// ── Recalculate totals ─────────────────────────────────────────────
function recalcImportTotal() {
    const rows = document.querySelectorAll('.import-item-row');
    let totalQty = 0, totalMoney = 0;
    rows.forEach(row => {
        const qty = parseInt(row.querySelector('.im-qty').value) || 0;
        const price = parseFloat(row.querySelector('.im-price').value) || 0;
        totalQty += qty;
        totalMoney += qty * price;
    });
    document.getElementById('im-tong-sl').textContent = totalQty.toLocaleString('vi-VN');
    document.getElementById('im-tong-tien').textContent = formatCurrencyVN(totalMoney);
}

// ── Submit form ───────────────────────────────────────────────────
async function submitImportForm() {
    const maPn = document.getElementById('im-ma_pn').value.trim();
    const maNcc = document.getElementById('im-ma_ncc').value.trim();

    if (!maNcc) {
        showToast('Vui lòng nhập Mã NCC', 'error');
        return;
    }

    // Collect items
    const rows = document.querySelectorAll('.import-item-row');
    const items = [];
    let hasError = false;
    rows.forEach(row => {
        const ma_sku = row.querySelector('.im-sku').value.trim();
        const so_luong = parseInt(row.querySelector('.im-qty').value) || 0;
        const gia_nhap = parseFloat(row.querySelector('.im-price').value) || 0;
        if (!ma_sku) return; // skip blank
        if (so_luong <= 0) { hasError = true; return; }
        items.push({ ma_sku, so_luong, gia_nhap });
    });

    if (hasError) { showToast('Số lượng nhập phải lớn hơn 0', 'error'); return; }
    if (items.length === 0) { showToast('Vui lòng thêm ít nhất một dòng SKU', 'error'); return; }

    const payload = { ma_ncc: maNcc, items };
    if (maPn) payload.ma_pn = maPn;

    try {
        const res = await fetch(`${API_BASE_URL}/imports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.detail || 'Lỗi khi tạo phiếu nhập', 'error');
            return;
        }
        showToast(`Tạo phiếu nhập ${data.ma_pn} thành công!`, 'success');
        closeAllModals();
        fetchImports();
    } catch (e) {
        showToast('Lỗi kết nối server', 'error');
    }
}

// ── Delete import (admin only) ────────────────────────────────────
async function deleteImport(maPn) {
    const token = localStorage.getItem('adminToken');
    const user = parseJwt(token);
    if (!user || user.vai_tro !== 'admin') {
        showToast('Chỉ Admin mới có quyền xóa phiếu nhập', 'error');
        return;
    }
    if (!confirm(`Xóa phiếu nhập ${maPn}? Tồn kho sẽ được hoàn về.`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/imports/${maPn}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.detail || 'Lỗi xóa phiếu nhập', 'error'); return; }
        showToast('Đã xóa phiếu nhập và hoàn tồn kho', 'success');
        fetchImports();
    } catch (e) {
        showToast('Lỗi kết nối server', 'error');
    }
}

// ── View detail modal ─────────────────────────────────────────────
async function openImportDetail(maPn) {
    try {
        const res = await fetch(`${API_BASE_URL}/imports`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const list = await res.json();
        const item = list.find(i => i.ma_pn === maPn);
        if (!item) { showToast('Không tìm thấy phiếu nhập', 'error'); return; }

        const rows = (item.chitiet || []).map(c => `
            <tr>
                <td class="text-center">${c.ma_sku}</td>
                <td class="text-center">${c.so_luong.toLocaleString('vi-VN')}</td>
                <td class="text-center">${formatCurrencyVN(c.gia_nhap)}</td>
                <td class="text-center" style="font-weight:600;">${formatCurrencyVN(Number(c.gia_nhap) * c.so_luong)}</td>
            </tr>
        `).join('');

        document.getElementById('import-detail-content').innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1rem;">
                <div style="background:#f8f9fa; border-radius:8px; padding:0.75rem 1rem; border-left:3px solid #4da6ff;">
                    <div style="font-size:0.75rem; color:#888; margin-bottom:2px;">Mã phiếu nhập</div>
                    <div style="font-weight:700; font-size:1rem;">${item.ma_pn}</div>
                </div>
                <div style="background:#f8f9fa; border-radius:8px; padding:0.75rem 1rem; border-left:3px solid #4da6ff;">
                    <div style="font-size:0.75rem; color:#888; margin-bottom:2px;">Ngày nhập</div>
                    <div style="font-weight:600;">${item.ngay_nhap}</div>
                </div>
                <div style="background:#f8f9fa; border-radius:8px; padding:0.75rem 1rem; border-left:3px solid #6f42c1;">
                    <div style="font-size:0.75rem; color:#888; margin-bottom:2px;">Mã NCC</div>
                    <div style="font-weight:600;">${item.ma_ncc}</div>
                </div>
                <div style="background:#f8f9fa; border-radius:8px; padding:0.75rem 1rem; border-left:3px solid #6f42c1;">
                    <div style="font-size:0.75rem; color:#888; margin-bottom:2px;">Mã NV</div>
                    <div style="font-weight:600;">${item.ma_nv}</div>
                </div>
                <div style="grid-column:1/-1; background:#fff3f5; border-radius:8px; padding:0.75rem 1rem; border-left:3px solid #d92550; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:0.75rem; color:#888;">Tổng tiền nhập</div>
                    <div style="font-size:1.2rem; font-weight:700; color:#d92550;">${formatCurrencyVN(item.tong_tien)}</div>
                </div>
            </div>
            <h6 style="font-weight:700; margin-bottom:0.5rem; color:#333;">Chi tiết sản phẩm nhập</h6>
            <div class="table-responsive">
                <table class="table table-sm table-bordered" style="font-size:0.875rem;">
                    <thead class="thead-light">
                        <tr>
                            <th class="text-center">Mã SKU</th>
                            <th class="text-center">Số lượng</th>
                            <th class="text-center">Giá nhập</th>
                            <th class="text-center">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
        openModal('modal-import-detail');
    } catch (e) {
        showToast('Lỗi tải chi tiết phiếu nhập', 'error');
    }
}

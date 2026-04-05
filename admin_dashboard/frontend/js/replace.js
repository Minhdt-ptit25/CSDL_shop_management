const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace("alert('Tính năng Thêm Khách hàng đang phát triển.')", "openAddCustomerModal()");
html = html.replace("alert('Tính năng Thêm Đơn hàng đang phát triển.')", "openAddOrderModal()");
html = html.replace("alert('Tính năng Thêm Nhân viên đang phát triển.')", "openAddEmployeeModal()");
html = html.replace("alert('Tính năng Thêm Nhà cung cấp đang phát triển.')", "openAddSupplierModal()");
fs.writeFileSync('index.html', html, 'utf8');

let js = fs.readFileSync('js/app.js', 'utf8');
js = js.replace(/alert\('Sửa KH \$\{item\.ma_kh\}'\)/g, "openEditCustomerModal('${item.ma_kh}')");
js = js.replace(/alert\('Xóa \$\{item\.ma_kh\}'\)/g, "openDeleteModal('${item.ma_kh}', 'customer')");

js = js.replace(/alert\('Sửa HĐ \$\{item\.ma_hd\}'\)/g, "openEditOrderModal('${item.ma_hd}')");
js = js.replace(/alert\('Xóa \$\{item\.ma_hd\}'\)/g, "openDeleteModal('${item.ma_hd}', 'order')");

js = js.replace(/alert\('Sửa NV \$\{item\.ma_nv\}'\)/g, "openEditEmployeeModal('${item.ma_nv}')");
js = js.replace(/alert\('Xóa \$\{item\.ma_nv\}'\)/g, "openDeleteModal('${item.ma_nv}', 'employee')");

js = js.replace(/alert\('Sửa NCC \$\{item\.ma_ncc\}'\)/g, "openEditSupplierModal('${item.ma_ncc}')");
js = js.replace(/alert\('Xóa \$\{item\.ma_ncc\}'\)/g, "openDeleteModal('${item.ma_ncc}', 'supplier')");

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('done');

# P&L Management - Trading Accounts

Ứng dụng quản lý P&L (Profit & Loss) cho các tài khoản trading với hybrid approach - vừa có dữ liệu cứng trong JSON để khởi tạo, vừa cho phép nhập mới và lưu vào localStorage, kèm tính năng Export/Import JSON để backup dữ liệu lâu dài.

## Tính năng chính

- 📊 **Quản lý nhiều tài khoản trading** (VD: Nhi, Thi, Thiện)
- 💾 **Hybrid data storage**: Load từ JSON ban đầu, lưu mới vào localStorage
- 📈 **Tính toán P&L tự động**: P&L ngày và P&L tích lũy
- 📅 **Lọc dữ liệu**: Theo ngày và theo tài khoản
- 🔄 **Reset dữ liệu**: Về dữ liệu gốc từ JSON
- 💾 **Export/Import JSON**: Backup và restore dữ liệu
- 📱 **Responsive design**: Hoạt động tốt trên mọi thiết bị

## Cài đặt và chạy

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Chạy development server:**
   ```bash
   npm run dev
   ```

3. **Build cho production:**
   ```bash
   npm run build
   ```

## Cấu trúc dự án

```
src/
├── components/
│   ├── PnLForm.jsx        # Form nhập dữ liệu mới
│   ├── PnLTable.jsx       # Bảng hiển thị lịch sử
│   ├── SummaryCard.jsx    # Card tổng hợp
│   ├── DataExportBtn.jsx  # Nút export JSON
│   └── DataImportBtn.jsx  # Nút import JSON
├── data/
│   └── pnlData.json       # Dữ liệu mẫu ban đầu
├── App.jsx
├── main.jsx
└── index.css
```

## Cách sử dụng

1. **Xem dữ liệu hiện tại**: Ứng dụng sẽ tự động load dữ liệu từ localStorage (nếu có) hoặc từ file JSON gốc
2. **Nhập dữ liệu mới**: Sử dụng form ở trên để nhập ngày, tài khoản, số dư, nạp/rút
3. **Xem báo cáo**: Bảng dưới hiển thị toàn bộ lịch sử với P&L được tính tự động
4. **Lọc dữ liệu**: Sử dụng các filter để xem dữ liệu theo tài khoản hoặc khoảng thời gian
5. **Export dữ liệu**: Nhấn nút "Save Data as JSON" để tải file JSON về máy
6. **Import dữ liệu**: Nhấn nút "Import JSON" để nạp dữ liệu từ file JSON
7. **Reset dữ liệu**: Nhấn nút "Reset về dữ liệu gốc" để xóa localStorage và load lại từ JSON

## Tính năng Export/Import

### Export JSON
- **Mục đích**: Backup dữ liệu hiện tại ra file JSON
- **Cách dùng**: Nhấn nút "Save Data as JSON" → file sẽ được tải về máy
- **Tên file**: `pnlData_YYYY-MM-DD.json`
- **Lưu ý**: Có thể thay thế file `/src/data/pnlData.json` thủ công để "đóng băng" dữ liệu mới

### Import JSON
- **Mục đích**: Nạp dữ liệu từ file JSON đã export trước đó
- **Cách dùng**: Nhấn nút "Import JSON" → chọn file JSON → dữ liệu sẽ được nạp vào app
- **Validation**: App sẽ kiểm tra cấu trúc dữ liệu trước khi import
- **Lưu ý**: Dữ liệu import sẽ ghi đè hoàn toàn dữ liệu hiện tại

### Reset Data
- **Mục đích**: Quay về dữ liệu gốc ban đầu từ `/src/data/pnlData.json`
- **Cách dùng**: Nhấn nút "Reset về dữ liệu gốc"
- **Lưu ý**: Sẽ xóa toàn bộ dữ liệu trong localStorage

## Công nghệ sử dụng

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **LocalStorage** - Data persistence
- **JSON** - Initial data source & backup format

## Tính năng P&L

- **P&L ngày**: Số dư cuối ngày - (Vốn ban đầu + Nạp - Rút)
- **P&L tích lũy**: (Số dư + Tổng rút - Tổng nạp - Vốn ban đầu)

## Lưu ý

- Dữ liệu được lưu trong localStorage của trình duyệt
- Khi reload trang, dữ liệu sẽ được giữ nguyên
- Export/Import giúp backup dữ liệu lâu dài và chia sẻ giữa các thiết bị
- Reset sẽ xóa toàn bộ dữ liệu đã nhập và quay về dữ liệu JSON gốc
# trading-pnl-management

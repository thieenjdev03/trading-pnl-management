import React, { useRef } from 'react';

const DataImportBtn = ({ onImport }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Vui lòng chọn file JSON!');
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!Array.isArray(jsonData)) {
          throw new Error('Dữ liệu phải là một mảng');
        }

        // Validate each entry
        for (let i = 0; i < jsonData.length; i++) {
          const entry = jsonData[i];
          if (!entry.date || !entry.accounts || typeof entry.accounts !== 'object') {
            throw new Error(`Entry ${i + 1} không hợp lệ: thiếu date hoặc accounts`);
          }

          // Validate accounts
          Object.entries(entry.accounts).forEach(([accountName, accountData]) => {
            if (typeof accountData !== 'object' || 
                typeof accountData.balance !== 'number' ||
                (accountData.deposit !== undefined && typeof accountData.deposit !== 'number') ||
                (accountData.withdraw !== undefined && typeof accountData.withdraw !== 'number')) {
              throw new Error(`Tài khoản "${accountName}" trong entry ${i + 1} không hợp lệ`);
            }
          });
        }

        // If validation passes, call onImport
        if (onImport) {
          onImport(jsonData);
        }

        alert('Import dữ liệu thành công!');
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert(`Lỗi khi đọc file: ${error.message}`);
      }
    };

    reader.onerror = () => {
      alert('Có lỗi xảy ra khi đọc file!');
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        title="Import dữ liệu từ file JSON"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        Import JSON
      </button>
    </>
  );
};

export default DataImportBtn;

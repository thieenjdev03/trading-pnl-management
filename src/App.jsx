import React, { useState, useEffect } from 'react';
import pnlData from './data/pnlData.json';
import PnLForm from './components/PnLForm';
import PnLTable from './components/PnLTable';
import SummaryCard from './components/SummaryCard';
import DataExportBtn from './components/DataExportBtn';
import DataImportBtn from './components/DataImportBtn';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage or fallback to JSON
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem('pnlData');
        if (savedData) {
          setData(JSON.parse(savedData));
        } else {
          setData(pnlData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setData(pnlData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage
  const saveData = (newData) => {
    try {
      localStorage.setItem('pnlData', JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Add new entry
  const addEntry = (newEntry) => {
    const newData = [...data, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    saveData(newData);
  };

  // Reset to default data
  const resetToDefault = () => {
    if (window.confirm('Bạn có chắc chắn muốn reset về dữ liệu gốc? Tất cả dữ liệu đã nhập sẽ bị mất!')) {
      localStorage.removeItem('pnlData');
      setData(pnlData);
    }
  };

  // Import data from JSON file
  const handleImport = (importedData) => {
    try {
      // Validate imported data
      if (!Array.isArray(importedData)) {
        throw new Error('Dữ liệu import phải là một mảng');
      }

      // Sort by date
      const sortedData = importedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Save to localStorage and update state
      saveData(sortedData);
      
      alert('Import dữ liệu thành công!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert(`Lỗi khi import dữ liệu: ${error.message}`);
    }
  };

  // Export data callback
  const handleExport = () => {
    console.log('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý P&L Trading Accounts
          </h1>
          <p className="text-gray-600">
            Theo dõi lãi/lỗ của các tài khoản trading
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCard data={data} />

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Nhập dữ liệu mới
          </h2>
          <PnLForm onAddEntry={addEntry} existingAccounts={getAllAccounts(data)} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Lịch sử giao dịch
            </h2>
            <div className="flex flex-wrap gap-2">
              <DataExportBtn data={data} onExport={handleExport} />
              <DataImportBtn onImport={handleImport} />
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset về dữ liệu gốc
              </button>
            </div>
          </div>
          <PnLTable data={data} />
        </div>
      </div>
    </div>
  );
}

// Helper function to get all unique account names
const getAllAccounts = (data) => {
  const accounts = new Set();
  data.forEach(entry => {
    Object.keys(entry.accounts).forEach(account => accounts.add(account));
  });
  return Array.from(accounts).sort();
};

export default App;

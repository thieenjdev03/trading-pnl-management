import React, { useState, useMemo } from 'react';
import EditTransactionModal from './EditTransactionModal';

const PnLTable = ({ data, onEditTransaction, onDeleteTransaction }) => {
  const [filterAccount, setFilterAccount] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Set default filter to last 1 month
  React.useEffect(() => {
    if (data.length > 0) {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      
      // Format dates for input
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      setFilterDateFrom(formatDate(oneMonthAgo));
      setFilterDateTo(formatDate(today));
    }
  }, [data]);

  // Get all unique accounts
  const allAccounts = useMemo(() => {
    const accounts = new Set();
    data.forEach(entry => {
      Object.keys(entry.accounts).forEach(account => accounts.add(account));
    });
    return Array.from(accounts).sort();
  }, [data]);

  // Calculate P&L for each entry
  const calculatePnL = (entry, accountName) => {
    const account = entry.accounts[accountName];
    if (!account) return { dailyPnL: 0, cumulativePnL: 0 };

    // Get initial balance (first entry for this account)
    const firstEntry = data.find(e => e.accounts[accountName]);
    const initialBalance = firstEntry ? firstEntry.accounts[accountName].balance : account.balance;

    // Calculate total deposits and withdrawals up to this point
    const currentDate = new Date(entry.date);
    const previousEntries = data.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate < currentDate && e.accounts[accountName];
    });

    const totalDeposits = previousEntries.reduce((sum, e) => 
      sum + (e.accounts[accountName]?.deposit || 0), 0) + (account.deposit || 0);
    
    const totalWithdrawals = previousEntries.reduce((sum, e) => 
      sum + (e.accounts[accountName]?.withdraw || 0), 0) + (account.withdraw || 0);

    // P&L calculations
    const dailyPnL = account.balance - (initialBalance + totalDeposits - totalWithdrawals);
    const cumulativePnL = account.balance + totalWithdrawals - totalDeposits - initialBalance;

    return { dailyPnL, cumulativePnL };
  };

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(entry => {
      // Account filter
      if (filterAccount && !entry.accounts[filterAccount]) {
        return false;
      }

      // Date filter
      if (filterDateFrom && new Date(entry.date) < new Date(filterDateFrom)) {
        return false;
      }
      if (filterDateTo && new Date(entry.date) > new Date(filterDateTo)) {
        return false;
      }

      return true;
    });
  }, [data, filterAccount, filterDateFrom, filterDateTo]);

  // Flatten data for table display
  const tableData = useMemo(() => {
    const flattened = [];
    
    filteredData.forEach(entry => {
      Object.keys(entry.accounts).forEach(accountName => {
        const account = entry.accounts[accountName];
        const { dailyPnL, cumulativePnL } = calculatePnL(entry, accountName);
        
        flattened.push({
          date: entry.date,
          account: accountName,
          balance: account.balance,
          deposit: account.deposit || 0,
          withdraw: account.withdraw || 0,
          dailyPnL,
          cumulativePnL
        });
      });
    });

    return flattened.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData, data]);

  // Calculate totals based on filtered data
  const totals = useMemo(() => {
    const accountTotals = {};
    
    // Get accounts that appear in filtered data
    const filteredAccounts = new Set();
    filteredData.forEach(entry => {
      Object.keys(entry.accounts).forEach(account => filteredAccounts.add(account));
    });
    
    filteredAccounts.forEach(accountName => {
      // Get all entries for this account (not just filtered ones)
      const accountEntries = data.filter(entry => entry.accounts[accountName]);
      if (accountEntries.length === 0) return;

      // Find the first entry for this account (initial balance)
      const firstEntry = accountEntries[0];
      const initialBalance = firstEntry.accounts[accountName].balance;
      
      // Find the last entry within the filtered date range
      const filteredAccountEntries = filteredData.filter(entry => entry.accounts[accountName]);
      if (filteredAccountEntries.length === 0) return;
      
      const lastFilteredEntry = filteredAccountEntries[filteredAccountEntries.length - 1];
      const currentBalance = lastFilteredEntry.accounts[accountName].balance;
      
      // Calculate deposits and withdrawals only within the filtered period
      const totalDeposits = filteredAccountEntries.reduce((sum, entry) => 
        sum + (entry.accounts[accountName]?.deposit || 0), 0);
      
      const totalWithdrawals = filteredAccountEntries.reduce((sum, entry) => 
        sum + (entry.accounts[accountName]?.withdraw || 0), 0);

      // Calculate P&L for the filtered period
      // For filtered period, we need to find the balance at the start of the period
      const startOfPeriodBalance = (() => {
        if (filterDateFrom) {
          const startDate = new Date(filterDateFrom);
          const entriesBeforePeriod = accountEntries.filter(entry => 
            new Date(entry.date) < startDate
          );
          if (entriesBeforePeriod.length > 0) {
            const lastEntryBeforePeriod = entriesBeforePeriod[entriesBeforePeriod.length - 1];
            return lastEntryBeforePeriod.accounts[accountName].balance;
          }
        }
        return initialBalance;
      })();

      accountTotals[accountName] = {
        initialBalance: startOfPeriodBalance,
        currentBalance,
        totalDeposits,
        totalWithdrawals,
        totalPnL: currentBalance + totalWithdrawals - totalDeposits - startOfPeriodBalance,
        periodStart: filterDateFrom || 'Tất cả',
        periodEnd: filterDateTo || 'Hiện tại'
      };
    });

    return accountTotals;
  }, [data, filteredData, allAccounts, filterDateFrom, filterDateTo]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Handle save edited transaction
  const handleSaveTransaction = (updatedTransaction) => {
    if (onEditTransaction) {
      onEditTransaction(updatedTransaction);
    }
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  // Handle delete transaction
  const handleDeleteTransaction = (transaction) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(transaction);
    }
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lọc theo tài khoản
          </label>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả tài khoản</option>
            {allAccounts.map(account => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tài khoản
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số dư
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nạp
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rút
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L ngày
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L tích lũy
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(row.date).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.account}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatNumber(row.balance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                  {row.deposit > 0 ? `+${formatNumber(row.deposit)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                  {row.withdraw > 0 ? `-${formatNumber(row.withdraw)}` : '-'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                  row.dailyPnL > 0 ? 'text-green-600' : row.dailyPnL < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {row.dailyPnL > 0 ? '+' : ''}{formatNumber(row.dailyPnL.toFixed(2))}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                  row.cumulativePnL > 0 ? 'text-green-600' : row.cumulativePnL < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {row.cumulativePnL > 0 ? '+' : ''}{formatNumber(row.cumulativePnL.toFixed(2))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleEditTransaction(row)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                    title="Chỉnh sửa giao dịch"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {Object.keys(totals).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tổng hợp theo tài khoản</h3>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Khoảng thời gian:</span> {totals[Object.keys(totals)[0]]?.periodStart} - {totals[Object.keys(totals)[0]]?.periodEnd}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(totals).map(([accountName, totals]) => (
              <div key={accountName} className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">{accountName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số dư đầu kỳ:</span>
                    <span className="font-medium">{formatNumber(totals.initialBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số dư cuối kỳ:</span>
                    <span className="font-medium">{formatNumber(totals.currentBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng nạp:</span>
                    <span className="text-green-600">+{formatNumber(totals.totalDeposits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng rút:</span>
                    <span className="text-red-600">-{formatNumber(totals.totalWithdrawals)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium text-gray-900">P&L kỳ:</span>
                    <span className={`font-bold ${
                      totals.totalPnL > 0 ? 'text-green-600' : totals.totalPnL < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {totals.totalPnL > 0 ? '+' : ''}{formatNumber(totals.totalPnL.toFixed(2))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        transaction={editingTransaction}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        existingAccounts={allAccounts}
      />
    </div>
  );
};

export default PnLTable;

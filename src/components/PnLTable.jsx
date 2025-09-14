import React, { useState, useMemo } from 'react';

const PnLTable = ({ data }) => {
  const [filterAccount, setFilterAccount] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

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

  // Calculate totals
  const totals = useMemo(() => {
    const accountTotals = {};
    
    allAccounts.forEach(accountName => {
      const accountEntries = data.filter(entry => entry.accounts[accountName]);
      if (accountEntries.length === 0) return;

      const firstEntry = accountEntries[0];
      const initialBalance = firstEntry.accounts[accountName].balance;
      
      const lastEntry = accountEntries[accountEntries.length - 1];
      const currentBalance = lastEntry.accounts[accountName].balance;
      
      const totalDeposits = accountEntries.reduce((sum, entry) => 
        sum + (entry.accounts[accountName]?.deposit || 0), 0);
      
      const totalWithdrawals = accountEntries.reduce((sum, entry) => 
        sum + (entry.accounts[accountName]?.withdraw || 0), 0);

      accountTotals[accountName] = {
        initialBalance,
        currentBalance,
        totalDeposits,
        totalWithdrawals,
        totalPnL: currentBalance + totalWithdrawals - totalDeposits - initialBalance
      };
    });

    return accountTotals;
  }, [data, allAccounts]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {Object.keys(totals).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng hợp theo tài khoản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(totals).map(([accountName, totals]) => (
              <div key={accountName} className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">{accountName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vốn ban đầu:</span>
                    <span className="font-medium">{formatNumber(totals.initialBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số dư hiện tại:</span>
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
                    <span className="font-medium text-gray-900">P&L tổng:</span>
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
    </div>
  );
};

export default PnLTable;

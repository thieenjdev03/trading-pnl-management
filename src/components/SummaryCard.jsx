import React, { useMemo } from 'react';

const SummaryCard = ({ data }) => {
  const summary = useMemo(() => {
    const accountTotals = {};
    
    // Process each entry
    data.forEach(entry => {
      Object.entries(entry.accounts).forEach(([accountName, accountData]) => {
        if (!accountTotals[accountName]) {
          accountTotals[accountName] = {
            initialBalance: accountData.balance,
            currentBalance: accountData.balance,
            totalDeposits: 0,
            totalWithdrawals: 0,
            lastUpdate: entry.date
          };
        } else {
          // Update current balance
          accountTotals[accountName].currentBalance = accountData.balance;
          accountTotals[accountName].lastUpdate = entry.date;
        }
        
        // Add deposits and withdrawals
        accountTotals[accountName].totalDeposits += accountData.deposit || 0;
        accountTotals[accountName].totalWithdrawals += accountData.withdraw || 0;
      });
    });

    // Calculate totals
    const totalInitialBalance = Object.values(accountTotals).reduce((sum, account) => 
      sum + account.initialBalance, 0);
    
    const totalCurrentBalance = Object.values(accountTotals).reduce((sum, account) => 
      sum + account.currentBalance, 0);
    
    const totalDeposits = Object.values(accountTotals).reduce((sum, account) => 
      sum + account.totalDeposits, 0);
    
    const totalWithdrawals = Object.values(accountTotals).reduce((sum, account) => 
      sum + account.totalWithdrawals, 0);
    
    const totalPnL = totalCurrentBalance + totalWithdrawals - totalDeposits - totalInitialBalance;

    return {
      totalInitialBalance,
      totalCurrentBalance,
      totalDeposits,
      totalWithdrawals,
      totalPnL,
      accountCount: Object.keys(accountTotals).length
    };
  }, [data]);

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Initial Balance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng vốn ban đầu</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatNumber(summary.totalInitialBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Current Balance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng số dư hiện tại</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatNumber(summary.totalCurrentBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Total P&L */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              summary.totalPnL > 0 ? 'bg-green-100' : summary.totalPnL < 0 ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <svg className={`w-5 h-5 ${
                summary.totalPnL > 0 ? 'text-green-600' : summary.totalPnL < 0 ? 'text-red-600' : 'text-gray-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng P&L</p>
            <p className={`text-2xl font-semibold ${
              summary.totalPnL > 0 ? 'text-green-600' : summary.totalPnL < 0 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {summary.totalPnL > 0 ? '+' : ''}{formatNumber(summary.totalPnL.toFixed(2))}
            </p>
          </div>
        </div>
      </div>

      {/* Account Count */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Số tài khoản</p>
            <p className="text-2xl font-semibold text-gray-900">
              {summary.accountCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;

import React, { useState } from 'react';

const PnLForm = ({ onAddEntry, existingAccounts }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    balance: '',
    deposit: '',
    withdraw: ''
  });
  const [isNewAccount, setIsNewAccount] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccountChange = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setIsNewAccount(true);
      setFormData(prev => ({ ...prev, account: '' }));
    } else {
      setIsNewAccount(false);
      setFormData(prev => ({ ...prev, account: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.date || !formData.account || formData.balance === '') {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const balance = parseFloat(formData.balance) || 0;
    const deposit = parseFloat(formData.deposit) || 0;
    const withdraw = parseFloat(formData.withdraw) || 0;

    if (balance < 0 || deposit < 0 || withdraw < 0) {
      alert('Số dư, nạp và rút không được âm!');
      return;
    }

    // Create new entry
    const newEntry = {
      date: formData.date,
      accounts: {
        [formData.account]: {
          balance: balance,
          deposit: deposit,
          withdraw: withdraw
        }
      }
    };

    onAddEntry(newEntry);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      account: '',
      balance: '',
      deposit: '',
      withdraw: ''
    });
    setIsNewAccount(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tài khoản <span className="text-red-500">*</span>
          </label>
          {!isNewAccount ? (
            <select
              name="account"
              value={formData.account}
              onChange={handleAccountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Chọn tài khoản</option>
              {existingAccounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
              <option value="new">+ Tài khoản mới</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                name="account"
                value={formData.account}
                onChange={handleInputChange}
                placeholder="Tên tài khoản mới"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setIsNewAccount(false)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số dư cuối ngày <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="balance"
            value={formData.balance}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Deposit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nạp (+)
          </label>
          <input
            type="number"
            name="deposit"
            value={formData.deposit}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Withdraw */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rút (-)
          </label>
          <input
            type="number"
            name="withdraw"
            value={formData.withdraw}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Lưu dữ liệu
          </button>
        </div>
      </div>
    </form>
  );
};

export default PnLForm;

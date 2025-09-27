import React, { useState, useEffect } from 'react';

const EditTransactionModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  onSave, 
  onDelete,
  existingAccounts 
}) => {
  const [formData, setFormData] = useState({
    date: '',
    account: '',
    balance: '',
    deposit: '',
    withdraw: ''
  });
  const [isNewAccount, setIsNewAccount] = useState(false);

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        account: transaction.account,
        balance: transaction.balance.toString(),
        deposit: (transaction.deposit || 0).toString(),
        withdraw: (transaction.withdraw || 0).toString()
      });
      setIsNewAccount(!existingAccounts.includes(transaction.account));
    }
  }, [transaction, existingAccounts]);

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

    // Create updated transaction
    const updatedTransaction = {
      ...transaction,
      date: formData.date,
      account: formData.account,
      balance: balance,
      deposit: deposit,
      withdraw: withdraw
    };

    onSave(updatedTransaction);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      onDelete(transaction);
      onClose();
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa giao dịch
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa giao dịch
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;

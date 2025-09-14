import React from 'react';

const DataExportBtn = ({ data, onExport }) => {
  const handleExport = () => {
    try {
      // Create JSON string with proper formatting
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `pnlData_${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Call callback if provided
      if (onExport) {
        onExport();
      }
      
      // Show success message
      alert('Dữ liệu đã được export thành công!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Có lỗi xảy ra khi export dữ liệu!');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
      title="Xuất dữ liệu hiện tại ra file JSON"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Save Data as JSON
    </button>
  );
};

export default DataExportBtn;

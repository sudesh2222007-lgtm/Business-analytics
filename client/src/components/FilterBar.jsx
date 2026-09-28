import { useRef } from 'react';
import { exportToExcel, readExcelFile } from '../utils/excel.js';

export default function FilterBar({ options, filters, onChange, onReset, exportData, onImportData }) {
  const { regions = [], categories = [], segments = [] } = options || {};
  const fileInputRef = useRef(null);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const handleExport = () => {
    const dataToExport = exportData || [
      { Category: 'Technology', Sales: 450000, Profit: 85000, Region: 'West' },
      { Category: 'Furniture', Sales: 280000, Profit: 42000, Region: 'East' },
      { Category: 'Office Supplies', Sales: 310000, Profit: 64000, Region: 'Central' },
      { Category: 'Electronics', Sales: 520000, Profit: 110000, Region: 'South' },
    ];
    exportToExcel(dataToExport, 'Analytics_Report');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const rows = await readExcelFile(file);
      if (rows && rows.length > 0) {
        if (onImportData) {
          onImportData(rows, file.name);
        } else {
          alert(`Successfully imported ${rows.length} rows from ${file.name}`);
        }
      } else {
        alert('The uploaded Excel file appears to be empty.');
      }
    } catch (err) {
      alert(`Error parsing Excel file: ${err.message}`);
    }
  };

  return (
    <div className="filter-bar-header">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <div className="filter-group">
          <label>Start Date</label>
          <input type="date" value={filters.startDate || ''} onChange={(e) => update('startDate', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input type="date" value={filters.endDate || ''} onChange={(e) => update('endDate', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Region</label>
          <select value={filters.region || 'All'} onChange={(e) => update('region', e.target.value)}>
            <option value="All">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={filters.category || 'All'} onChange={(e) => update('category', e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Segment</label>
          <select value={filters.segment || 'All'} onChange={(e) => update('segment', e.target.value)}>
            <option value="All">All Segments</option>
            {segments.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls, .csv"
          style={{ display: 'none' }}
        />
        <button className="btn-excel-import" onClick={() => fileInputRef.current?.click()} title="Import .xlsx or .csv data">
          📁 Import Excel
        </button>
        <button className="btn-excel-export" onClick={handleExport} title="Export report to Excel">
          📊 Export Excel
        </button>
        <button className="btn-reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

import React from 'react';

interface ResultsTableProps {
  columns: string[];
  rows: any[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ columns, rows }) => {
  if (!columns.length) return null;

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full text-left text-sm">
        <thead className="bg-purple-900/40 text-xs font-medium uppercase tracking-wider text-purple-300/80 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 border-b border-purple-500/20">
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-500/10">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-purple-500/10 transition-colors">
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 font-mono text-purple-100/90">
                  {row[col]?.toString() || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
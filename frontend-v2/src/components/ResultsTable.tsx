import React from 'react';

interface ResultsTableProps {
  columns: string[];
  rows: any[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ columns, rows }) => {
  if (!columns.length) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-800/50 text-xs font-medium uppercase tracking-wider text-zinc-400">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3">
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 font-mono text-zinc-300">
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

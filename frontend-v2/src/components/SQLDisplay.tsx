import React from 'react';
import { Copy } from 'lucide-react';

interface SQLDisplayProps {
  sql: string;
}

export const SQLDisplay: React.FC<SQLDisplayProps> = ({ sql }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
  };

  return (
    <div className="relative group p-4 font-mono text-sm">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded bg-purple-500/20 border border-purple-500/30 px-2 py-1 text-xs text-purple-300 hover:bg-purple-500/30 hover:text-purple-200"
        >
          <Copy size={12} />
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto text-violet-300 whitespace-pre-wrap">
        {sql.split('\n').map((line, i) => {
          // Syntax highlighting with purple theme
          const highlighted = line
            .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|HAVING|ORDER BY|LIMIT|AND|OR|IN|AS|INT|VARCHAR|FLOAT|NOT|NULL|IS|LIKE|BETWEEN|EXISTS|UNION|ALL|DISTINCT|INTO|VALUES|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|DROP|ALTER|ADD|SET|ASC|DESC)\b/gi, '<span class="text-fuchsia-400 font-semibold">$1</span>')
            .replace(/\b(AVG|COUNT|SUM|MIN|MAX|ROUND|COALESCE|CONCAT|UPPER|LOWER|LENGTH|SUBSTRING|TRIM|NOW|DATE|YEAR|MONTH|DAY)\b/gi, '<span class="text-pink-400">$1</span>')
            .replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>')
            .replace(/(\d+\.?\d*)/g, '<span class="text-amber-400">$1</span>');

          return (
            <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
          );
        })}
      </pre>
    </div>
  );
};
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
    <div className="relative group rounded-lg border border-zinc-800 bg-[#121212] p-4 font-mono text-sm">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
        >
          <Copy size={12} />
          Copy SQL
        </button>
      </div>
      <pre className="overflow-x-auto text-blue-400 whitespace-pre-wrap">
        {sql.split('\n').map((line, i) => {
          // Very basic syntax highlighting
          const highlighted = line
            .replace(/\b(SELECT|FROM|WHERE|JOIN|ON|GROUP BY|HAVING|ORDER BY|LIMIT|AND|OR|IN|AS|INT|VARCHAR|FLOAT)\b/g, '<span class="text-purple-400">$1</span>')
            .replace(/\b(AVG|COUNT|SUM|MIN|MAX)\b/g, '<span class="text-orange-400">$1</span>');
          
          return (
            <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
          );
        })}
      </pre>
    </div>
  );
};

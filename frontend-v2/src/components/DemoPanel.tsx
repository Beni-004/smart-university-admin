import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDemoCategories, getDemoCategoryResults, DemoCategory, DemoCategoryResponse, DemoQueryResult } from '../services/apiService';
import { SQLDisplay } from './SQLDisplay';
import { ResultsTable } from './ResultsTable';

interface QueryPresentation {
  categoryId: string;
  categoryLabel: string;
  section: string;
  query: DemoQueryResult;
}

export function DemoPanel() {
  const [categories, setCategories] = useState<DemoCategory[]>([]);
  const [queries, setQueries] = useState<QueryPresentation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDemoData();
  }, []);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [currentIndex, queries.length]);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      const { categories: cats } = await getDemoCategories();
      setCategories(cats);

      const allResults = await Promise.all(
        cats.map(cat => getDemoCategoryResults(cat.id))
      );

      const flatQueries: QueryPresentation[] = [];
      allResults.forEach(catData => {
        catData.queries.forEach(query => {
          flatQueries.push({
            categoryId: catData.category,
            categoryLabel: catData.label,
            section: catData.section,
            query,
          });
        });
      });

      setQueries(flatQueries);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo data');
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < queries.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const jumpToCategory = (categoryId: string) => {
    const idx = queries.findIndex(q => q.categoryId === categoryId);
    if (idx !== -1) setCurrentIndex(idx);
  };

  if (loading) {
    return (
      <motion.div
        key="dbms-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center"
      >
        <div className="flex items-center gap-3 text-purple-400">
          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0.2s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0.4s]" />
          <span className="ml-2 text-sm text-purple-200/70">Loading demo queries...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        key="dbms-error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center"
      >
        <div className="rounded-xl border border-red-500/30 bg-red-900/20 px-6 py-4 text-red-300 backdrop-blur-xl">
          ⚠️ {error}
        </div>
      </motion.div>
    );
  }

  if (queries.length === 0) {
    return (
      <motion.div
        key="dbms-empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center text-purple-300/50"
      >
        No demo queries available
      </motion.div>
    );
  }

  const currentQuery = queries[currentIndex];
  const sectionColor = getSectionColor(currentQuery.section);

  return (
    <motion.div
      key="dbms"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full"
    >
      {/* Top Bar with Categories and Navigation - Purple glass theme */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-purple-500/20 bg-purple-900/20 px-6 py-3 backdrop-blur-xl rounded-t-xl">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isActive = queries.find((q, idx) => idx === currentIndex)?.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => jumpToCategory(cat.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all backdrop-blur-md ${
                  isActive
                    ? 'border-violet-400/50 bg-violet-500/30 text-violet-200'
                    : 'border-purple-500/20 bg-purple-900/20 text-purple-300/70 hover:border-violet-400/30 hover:text-violet-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-300/50">
            {currentIndex + 1} / {queries.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-900/20 text-purple-300 transition-all hover:border-violet-400/50 hover:text-violet-300 disabled:opacity-30 backdrop-blur-md"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === queries.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-900/20 text-purple-300 transition-all hover:border-violet-400/50 hover:text-violet-300 disabled:opacity-30 backdrop-blur-md"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Split Layout: SQL Query (30%) + Results (70%) */}
      <div className="flex-1 grid grid-cols-10 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Column: Query Info & SQL (30%) */}
        <div className="col-span-3 flex flex-col space-y-3 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            {/* Query Header */}
            <div className="space-y-2">
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${sectionColor}`}>
                {currentQuery.section}
              </span>
              <h3 className="text-base font-bold text-white line-clamp-2">{currentQuery.query.title}</h3>
              <p className="text-xs text-purple-200/60 line-clamp-2">{currentQuery.query.question}</p>
            </div>
          </motion.div>

          {/* SQL Query - Fixed Height with Scroll - Purple glass theme */}
          <div className="flex-1 flex flex-col space-y-2 min-h-0 overflow-hidden">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60 flex-shrink-0">SQL Query</h4>
            <div className="flex-1 rounded-xl overflow-hidden border border-purple-500/20 bg-purple-900/20 backdrop-blur-xl min-h-0">
              <div className="h-full overflow-y-auto custom-scrollbar">
                <SQLDisplay sql={currentQuery.query.sql} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results (70%) - Purple glass theme */}
        <div className="col-span-7 flex flex-col space-y-2 overflow-hidden">
          <div className="flex items-center justify-between flex-shrink-0">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">Query Results</h4>
            {!currentQuery.query.error && currentQuery.query.rows.length > 0 && (
              <span className="rounded bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                {currentQuery.query.row_count} row{currentQuery.query.row_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-h-0 overflow-hidden"
          >
            {currentQuery.query.error ? (
              <div className="flex items-center justify-center h-full rounded-xl border border-red-500/30 bg-red-900/20 px-6 py-4 text-red-300 backdrop-blur-xl">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className="text-sm">{currentQuery.query.error}</div>
                </div>
              </div>
            ) : currentQuery.query.rows.length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-purple-500/20 bg-purple-900/20 backdrop-blur-xl h-full">
                <ResultsTable
                  columns={currentQuery.query.columns}
                  rows={currentQuery.query.rows.map(row => {
                    const obj: any = {};
                    currentQuery.query.columns.forEach((col, idx) => {
                      obj[col] = row[idx];
                    });
                    return obj;
                  })}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full rounded-xl border border-purple-500/20 bg-purple-900/20 px-6 py-8 text-center text-purple-300/50 backdrop-blur-xl">
                <div>
                  <div className="text-2xl mb-2">📭</div>
                  <div className="text-sm">No rows returned</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function getSectionColor(section: string): string {
  // Purple-based color palette for sections
  const colors: Record<string, string> = {
    '1.1': 'bg-violet-500/30 text-violet-200 border border-violet-400/30',
    '1.2': 'bg-purple-500/30 text-purple-200 border border-purple-400/30',
    '1.3': 'bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/30',
    '1.4': 'bg-pink-500/30 text-pink-200 border border-pink-400/30',
    '1.5': 'bg-rose-500/30 text-rose-200 border border-rose-400/30',
    '1.6': 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30',
    '1.7': 'bg-blue-500/30 text-blue-200 border border-blue-400/30',
    '1.8': 'bg-violet-600/30 text-violet-200 border border-violet-400/30',
    '1.9': 'bg-purple-600/30 text-purple-200 border border-purple-400/30',
    '1.10': 'bg-fuchsia-600/30 text-fuchsia-200 border border-fuchsia-400/30',
  };

  return colors[section] || 'bg-purple-500/30 text-purple-200 border border-purple-400/30';
}
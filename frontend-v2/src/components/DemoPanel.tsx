import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {getDemoCategories, getDemoCategoryResults, DemoCategory, DemoCategoryResponse, DemoQueryResult } from '../services/apiService';
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

      // Load all category results
      const allResults = await Promise.all(
        cats.map(cat => getDemoCategoryResults(cat.id))
      );

      // Flatten into a single array of queries with metadata
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
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.2s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.4s]" />
          <span className="ml-2 text-sm">Loading demo queries...</span>
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
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400 backdrop-blur-xl">
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
        className="flex h-full items-center justify-center text-zinc-500"
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
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Top Bar with Categories and Navigation */}
      <div className="flex items-center justify-between border-b border-white/5 bg-black/10 px-8 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const isActive = queries.find((q, idx) => idx === currentIndex)?.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => jumpToCategory(cat.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all backdrop-blur-md ${
                  isActive
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                    : 'border-white/10 bg-black/40 text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-400'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">
            {currentIndex + 1} / {queries.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-400 transition-all hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-zinc-400 backdrop-blur-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === queries.length - 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-zinc-400 transition-all hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-zinc-400 backdrop-blur-md"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Query Presentation */}
      <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto w-full max-w-5xl space-y-8"
        >
          {/* Section Badge and Title */}
          <div className="space-y-4">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${sectionColor}`}>
              {currentQuery.section}
            </span>
            <h2 className="text-3xl font-bold text-zinc-100">{currentQuery.query.title}</h2>
            <p className="text-lg text-zinc-400">{currentQuery.query.question}</p>
          </div>

          {/* SQL Query */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">SQL Query</h3>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
              <SQLDisplay sql={currentQuery.query.sql} />
            </div>
          </div>

          {/* Results */}
          {currentQuery.query.error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-400 backdrop-blur-xl">
              ⚠️ {currentQuery.query.error}
            </div>
          ) : currentQuery.query.rows.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Query Results</h3>
                <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500">
                  {currentQuery.query.row_count} row{currentQuery.query.row_count !== 1 ? 's' : ''} returned
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
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
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-black/20 px-6 py-8 text-center text-zinc-600 backdrop-blur-xl">
              No rows returned
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function getSectionColor(section: string): string {
  const colors: Record<string, string> = {
    '1.1': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    '1.2': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    '1.3': 'bg-green-500/20 text-green-300 border border-green-500/30',
    '1.4': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    '1.5': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    '1.6': 'bg-red-500/20 text-red-300 border border-red-500/30',
    '1.7': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    '1.8': 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    '1.9': 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    '1.10': 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  };

  return colors[section] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
}

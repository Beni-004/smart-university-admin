import React, { useState, useRef, useEffect } from 'react';
import { Bot, Database, Send, Sparkles, User, ChevronDown, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, QueryResult } from './types';
import { queryDatabase } from './services/apiService';
import { SQLDisplay } from './components/SQLDisplay';
import { ResultsTable } from './components/ResultsTable';
import { DemoPanel } from './components/DemoPanel';
import { SplineHero } from './components/SplineHero';
import DarkVeil from './components/DarkVeil';
import type { Application } from '@splinetool/runtime';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hey! Admin, What can I help with?',
    }
  ]);
  const [latestResult, setLatestResult] = useState<{ sql?: string; results?: QueryResult } | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Refs for smooth scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleSplineLoad = (app: Application) => {
    setSplineApp(app);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await queryDatabase(input);
      const results: QueryResult = {
        columns: response.results.columns || [],
        rows: response.results.rows || [],
      };

      const statusContent = results.rows.length > 0
        ? `Query executed successfully! Found ${results.rows.length} rows.${response.cached ? ' (cached)' : ''}`
        : 'Query executed but returned no results.';

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: statusContent,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLatestResult({ sql: response.sql, results });
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
      setLatestResult(null);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 overflow-x-hidden">
      {/* Floating Navigation - Purple theme */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-full px-4 py-2">
          <button
            onClick={() => scrollToSection(heroRef)}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full hover:bg-purple-500/10"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection(chatRef)}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full hover:bg-purple-500/10"
          >
            Chat
          </button>
          <button
            onClick={() => scrollToSection(demoRef)}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full hover:bg-purple-500/10"
          >
            Demo
          </button>
        </div>
      </nav>

      {/* Hero Section - Full Immersive 3D (NO Dark Veil) */}
      <section ref={heroRef} className="relative w-full h-screen bg-black">
        <SplineHero onLoad={handleSplineLoad} onStartQuerying={() => scrollToSection(chatRef)} />

        {/* Minimal branding overlay - Purple theme */}
        <div className="absolute top-6 left-6 z-40">
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-8 h-8 bg-purple-500/20 border border-purple-400/30 rounded-lg flex items-center justify-center">
              <LayoutGrid size={16} />
            </div>
            <span className="text-sm font-medium">Smart University Admin</span>
          </div>
        </div>
      </section>

      {/* Chat Section - With Dark Veil Background */}
      <section ref={chatRef} className="h-screen flex flex-col relative overflow-hidden">
        {/* Dark Veil Background for this section */}
        <div className="absolute inset-0 z-0">
          <DarkVeil />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-shrink-0 text-center py-8">
            <h2 className="text-3xl font-light text-white mb-2">Query Chat Mode</h2>
            <p className="text-purple-200/60 text-base max-w-xl mx-auto">
              Ask questions in plain English and get instant SQL results
            </p>
          </div>

          {/* Chat Interface - Full Height */}
          <div className="flex-1 max-w-7xl mx-auto w-full px-6 pb-8 min-h-0">
            <div className="grid grid-cols-2 gap-8 h-full">
              {/* Left Column: Chat History */}
              <div className="flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2" ref={scrollRef}>
                  {messages.length === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-light text-purple-200/70 leading-tight">
                        Hey! Admin,<br />
                        <span className="text-white">What can I help with?</span>
                      </h3>
                      <div className="rounded-xl bg-purple-900/20 border border-purple-500/20 p-5 backdrop-blur-xl">
                        <div className="flex items-center gap-2 text-purple-300 mb-3">
                          <Sparkles size={14} />
                          <span className="text-xs font-semibold uppercase tracking-wider">AI Assistant</span>
                        </div>
                        <ul className="space-y-2 text-sm text-purple-200/70">
                          <li className="hover:text-purple-300 cursor-pointer transition-colors">• Show all students in Computer Science</li>
                          <li className="hover:text-purple-300 cursor-pointer transition-colors">• What is the average GPA by department?</li>
                          <li className="hover:text-purple-300 cursor-pointer transition-colors">• List students with attendance below 75%</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex items-start gap-3 max-w-[85%]">
                          {msg.role === 'assistant' && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              <Bot size={16} />
                            </div>
                          )}
                          <div className={`rounded-xl px-4 py-3 shadow-lg backdrop-blur-xl ${
                            msg.role === 'user'
                              ? 'bg-violet-600/30 border border-violet-400/30 text-violet-50'
                              : 'bg-purple-900/30 border border-purple-500/20 text-purple-100'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-center gap-2 text-purple-400/50 ml-10">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400/50" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400/50 [animation-delay:0.2s]" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400/50 [animation-delay:0.4s]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Input - Purple theme */}
                <div className="flex-shrink-0 mt-4">
                  <div className="relative rounded-xl border border-purple-500/20 bg-purple-900/20 p-2 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Sparkles size={18} className="text-purple-400/50" />
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything about the university database..."
                        className="flex-1 bg-transparent text-purple-100 placeholder:text-purple-300/40 focus:outline-none text-sm"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-4 text-xs font-semibold text-white transition-all hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      >
                        Send
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Results - Purple glass theme */}
              <div className="flex flex-col min-h-0">
                {latestResult ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-full space-y-4"
                  >
                    {latestResult.sql && (
                      <div className="flex-shrink-0 space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">Generated SQL Query</h4>
                        <div className="rounded-xl overflow-hidden border border-purple-500/20 bg-purple-900/20 backdrop-blur-xl">
                          <SQLDisplay sql={latestResult.sql} />
                        </div>
                      </div>
                    )}

                    {latestResult.results && latestResult.results.rows.length > 0 && (
                      <div className="flex-1 flex flex-col space-y-2 min-h-0">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">Query Results</h4>
                        <div className="flex-1 rounded-xl overflow-hidden border border-purple-500/20 bg-purple-900/20 backdrop-blur-xl">
                          <ResultsTable columns={latestResult.results.columns} rows={latestResult.results.rows} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex h-full items-center justify-center text-purple-300/40 italic text-sm border border-dashed border-purple-500/20 rounded-xl bg-purple-900/10 backdrop-blur-sm">
                    Query results will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section - With Dark Veil Background */}
      <section ref={demoRef} className="h-screen flex flex-col relative overflow-hidden">
        {/* Dark Veil Background for this section */}
        <div className="absolute inset-0 z-0">
          <DarkVeil />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-shrink-0 text-center py-8">
            <h2 className="text-3xl font-light text-white mb-2">DBMS Demo Mode</h2>
            <p className="text-purple-200/60 text-base max-w-xl mx-auto">
              Explore pre-built queries organized by category
            </p>
          </div>

          <div className="flex-1 max-w-7xl mx-auto w-full px-6 pb-8 min-h-0">
            <DemoPanel />
          </div>
        </div>
      </section>
    </div>
  );
}
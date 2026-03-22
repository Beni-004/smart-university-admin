import React, { useState, useRef, useEffect } from 'react';
import { Bot, Database, Send, Sparkles, User, ChevronDown, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, QueryResult } from './types';
import { queryDatabase } from './services/apiService';
import { SQLDisplay } from './components/SQLDisplay';
import { ResultsTable } from './components/ResultsTable';
import { DemoPanel } from './components/DemoPanel';
import { SplineHero } from './components/SplineHero';
import { DarkVeilParticles } from './components/DarkVeilParticles';
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

    // Example: You can set variables in your Spline scene here
    // app.setVariable('welcomeText', 'Ask Your Database Anything');
    // app.setVariable('subtitleText', 'Smart University Admin translates your questions...');
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
      // Call backend API
      const response = await queryDatabase(input);

      // Convert backend response to frontend format
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
      {/* Animated Dark Veil Background */}
      <DarkVeilParticles />
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
          <button
            onClick={() => scrollToSection(heroRef)}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection(chatRef)}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            Chat
          </button>
          <button
            onClick={() => scrollToSection(demoRef)}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            Demo
          </button>
        </div>
      </nav>

      {/* Hero Section - Full Immersive 3D */}
      <section ref={heroRef} className="relative w-full h-screen">
        <SplineHero onLoad={handleSplineLoad} />

        {/* Minimal branding overlay - only visible when needed */}
        <div className="absolute top-6 left-6 z-40">
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center">
              <LayoutGrid size={16} />
            </div>
            <span className="text-sm font-medium">Smart University Admin</span>
          </div>
        </div>

        {/* Call-to-action overlay - only if needed */}
        <div className="absolute bottom-20 left-6 z-40">
          <button
            onClick={() => scrollToSection(chatRef)}
            className="bg-cyan-600/20 backdrop-blur-sm border border-cyan-400/30 text-white px-6 py-3 rounded-full font-medium hover:bg-cyan-600/30 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Start Querying
          </button>
        </div>
      </section>

      {/* Chat Section */}
      <section ref={chatRef} className="min-h-screen bg-black/40 backdrop-blur-sm border-t border-white/5">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">Query Chat Mode</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Ask questions in plain English and get instant SQL results
            </p>
          </div>

          {/* Chat Interface */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-12 min-h-[70vh]">
              {/* Left Column: Chat History */}
              <div className="space-y-8" ref={scrollRef}>
                {messages.length === 1 && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-light text-zinc-400 leading-tight">
                      Hey! Admin,<br />
                      <span className="text-zinc-100">What can I help with?</span>
                    </h3>
                    <div className="rounded-2xl bg-black/40 border border-white/10 p-6 max-w-md backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-cyan-400/80 mb-4">
                        <Sparkles size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">AI Assistant</span>
                      </div>
                      <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="hover:text-cyan-300 cursor-pointer transition-colors">• Show all students in Computer Science</li>
                        <li className="hover:text-cyan-300 cursor-pointer transition-colors">• What is the average GPA by department?</li>
                        <li className="hover:text-cyan-300 cursor-pointer transition-colors">• List students with attendance below 75%</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-start gap-3 max-w-[90%]">
                        {msg.role === 'assistant' && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-cyan-400 border border-white/5">
                            <Bot size={18} />
                          </div>
                        )}
                        <div className={`rounded-2xl px-5 py-3 shadow-lg backdrop-blur-xl ${
                          msg.role === 'user'
                            ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-50'
                            : 'bg-black/60 border border-white/10 text-zinc-200'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-cyan-500/50 ml-11">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500/50" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500/50 [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500/50 [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Results */}
              <div className="space-y-8">
                {latestResult ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8 sticky top-20"
                  >
                    {latestResult.sql && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Generated SQL Query</h4>
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
                          <SQLDisplay sql={latestResult.sql} />
                        </div>
                      </div>
                    )}

                    {latestResult.results && latestResult.results.rows.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Query Results</h4>
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
                          <ResultsTable columns={latestResult.results.columns} rows={latestResult.results.rows} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600 italic text-sm border border-dashed border-white/5 rounded-3xl bg-black/10 backdrop-blur-sm min-h-[300px]">
                    Query results will appear here
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className="mt-16">
              <div className="max-w-4xl mx-auto">
                <div className="relative rounded-2xl border border-white/10 bg-black/60 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
                  <div className="flex items-center gap-2 px-4 py-3">
                    <Sparkles size={20} className="text-cyan-500/50" />
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything about the university database..."
                      className="flex-1 bg-transparent text-zinc-200 placeholder:text-zinc-600 focus:outline-none text-lg"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="flex h-11 items-center gap-2 rounded-xl bg-cyan-600 px-6 text-sm font-semibold text-white transition-all hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 shadow-[0_0_20px_rgba(8,145,178,0.3)]"
                    >
                      Send
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section ref={demoRef} className="min-h-screen bg-black/60 backdrop-blur-sm border-t border-white/5">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">DBMS Demo Mode</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Explore pre-built queries organized by category
            </p>
          </div>
          <DemoPanel />
        </div>
      </section>
    </div>
  );
}
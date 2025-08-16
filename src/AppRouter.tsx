import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GeneratorPage from './pages/GeneratorPage';
import ProjectsPage from './pages/ProjectsPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100vh]" style={{ background: '#F5EFE3' }}>
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/50 backdrop-blur-md border border-white/30 shadow-md" style={{boxShadow: '0 8px 30px rgba(0,0,0,0.12)'}} />
            <div className="leading-tight">
              <h1 className="text-2xl font-semibold text-[#1F2A2E]">Palette Muse</h1>
              <p className="text-sm text-[#47555A] opacity-80">Liquid Glass • Playful • Pro</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={({isActive})=>`px-3 py-2 rounded-xl border border-white/40 backdrop-blur-md shadow ${isActive?'bg-white/70':'bg-white/40 hover:bg-white/60'}`}>Générateur</NavLink>
            <NavLink to="/projects" className={({isActive})=>`px-3 py-2 rounded-xl border border-white/40 backdrop-blur-md shadow ${isActive?'bg-white/70':'bg-white/40 hover:bg-white/60'}`}>Projets</NavLink>
          </nav>
        </div>
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <AnimatePresence mode="wait">
                <motion.div key="generator" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <GeneratorPage />
                </motion.div>
              </AnimatePresence>
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <AnimatePresence mode="wait">
                <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <ProjectsPage />
                </motion.div>
              </AnimatePresence>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
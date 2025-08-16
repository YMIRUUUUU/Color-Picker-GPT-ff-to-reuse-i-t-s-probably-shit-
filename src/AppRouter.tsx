import React, { useMemo, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GeneratorPage from './pages/GeneratorPage';
import ProjectsPage from './pages/ProjectsPage';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();
	return (
		<AnimatePresence mode="wait">
			<motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
				{children}
			</motion.div>
		</AnimatePresence>
	);
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<div className="relative min-h-[100vh]" style={{ background: '#F5EFE3' }}>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_20%_-10%,rgba(255,255,255,0.6),transparent),radial-gradient(800px_400px_at_100%_20%,rgba(255,255,255,0.25),transparent)]" />
			<div className="relative z-10 mx-auto max-w-7xl px-6 py-6">
				<header className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-2xl bg-white/50 backdrop-blur-md border border-white/30 shadow-md" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }} />
						<div className="leading-tight">
							<h1 className="text-2xl font-semibold text-[#1F2A2E]">Palette Muse</h1>
							<p className="text-sm text-[#47555A] opacity-80">Glass · Palettes intelligentes</p>
						</div>
					</div>
					<nav className="flex items-center gap-2">
						<Link to="/" className="px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 backdrop-blur-md shadow">Générateur</Link>
						<Link to="/projects" className="px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 backdrop-blur-md shadow">Projets</Link>
					</nav>
				</header>
			</div>
			<div className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
				{children}
			</div>
		</div>
	);
};

const AppRouter: React.FC = () => {
	const [palette, setPalette] = useState<string[]>(['#8BAAAD', '#BFD8D2', '#F2EAD3', '#E1CE7A', '#8E9AAF', '#CBC0D3', '#EFD3D7', '#FEE1E8']);

	return (
		<HashRouter>
			<Layout>
				<PageTransition>
					<Routes>
						<Route path="/" element={<GeneratorPage palette={palette} setPalette={setPalette} />} />
						<Route path="/projects" element={<ProjectsPage palette={palette} />} />
					</Routes>
				</PageTransition>
			</Layout>
		</HashRouter>
	);
};

export default AppRouter;
import React from 'react';

type ErrorBoundaryState = { hasError: boolean };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: unknown) {
		console.error('UI error:', error);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5EFE3' }}>
					<div className="rounded-3xl p-6 border border-white/40 bg-white/60 backdrop-blur-xl">
						<div className="text-[#1F2A2E] font-semibold mb-1">Oups, une erreur est survenue</div>
						<div className="text-sm text-[#47555A] opacity-80">Veuillez recharger la page.</div>
					</div>
				</div>
			);
		}
		return this.props.children as React.ReactElement;
	}
}
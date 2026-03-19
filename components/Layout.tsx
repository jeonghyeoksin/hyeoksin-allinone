
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, subtitle, onBack }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
        
        {/* Dynamic Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]"></div>
        
        {/* Agent Background Image */}
        <img 
          src="/agent.png" 
          alt="AI Agent" 
          className="absolute bottom-0 right-0 h-[85%] max-h-[800px] w-auto object-contain opacity-20 mix-blend-overlay filter grayscale hover:grayscale-0 hover:opacity-40 transition-all duration-1000 ease-in-out z-0"
          onError={(e) => {
             e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <header className="relative z-10 px-8 py-6 border-b border-white/5 bg-slate-950/30 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all group border border-transparent hover:border-white/10"
              title="대시보드로 돌아가기"
            >
              <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          )}
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-1 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              {subtitle}
            </p>
          </div>
        </div>

        {!onBack && (
           <div className="flex items-center gap-3">
              <div className="text-right">
                <h2 className="text-xl font-black leading-tight tracking-tight text-white">혁신AI</h2>
                <p className="text-[10px] text-blue-400 font-bold tracking-widest opacity-80">MARKETING AGENT</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
           </div>
        )}
      </header>
      
      <main className="flex-1 overflow-y-auto p-8 relative z-10 scroll-smooth custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

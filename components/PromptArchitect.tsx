
import React, { useState } from 'react';
import { GeneratedContent } from '../types';
import { generateCustomPrompt } from '../services/geminiService';

export const PromptArchitect: React.FC<{ setProgress: (p: number) => void }> = ({ setProgress }) => {
  const [request, setRequest] = useState<string>('');
  const [result, setResult] = useState<GeneratedContent>({ loading: false });

  const handleGenerate = async () => {
    if (!request.trim()) return;
    
    setResult({ loading: true, text: undefined });
    setProgress(20);
    
    try {
      const { text, usage } = await generateCustomPrompt(request);
      setProgress(100);
      setResult({ loading: false, text, usage });
      setTimeout(() => setProgress(0), 1000);
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-6 bg-blue-400 rounded mr-2"></span>
          프롬프트 아키텍트 (AI 설계자)
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              무엇을 위한 프롬프트를 설계할까요?
            </label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="예: 구글 상위 노출을 위한 테크 블로그 글쓰기 프롬프트, 몽환적인 사이버펑크 캐릭터 생성 프롬프트 등"
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none custom-scrollbar"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              * 모호한 한 줄만 입력해도 충분합니다. 아키텍트가 전문가적 맥락을 자동 설계합니다.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={result.loading || !request.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
              result.loading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-900/50'
            }`}
          >
            {result.loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>구조적 설계 및 최적화 중...</span>
              </div>
            ) : (
              '실행용 프롬프트 자동 생성'
            )}
          </button>
        </div>
      </div>

      {(result.text || result.loading || result.error) && (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[500px] flex flex-col relative animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    설계된 프롬프트 보고서
                </h3>
             </div>

             {result.error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">{result.error}</div>}
             
             {result.text ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-800/30 p-6 rounded-xl border border-white/5 no-copy">
                    <div className="prose prose-invert prose-blue max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
                            {result.text}
                        </pre>
                    </div>
                </div>
             ) : result.loading && (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>아키텍트가 사고 프로세스를 가동 중입니다...</p>
                 </div>
             )}
          </div>
      )}
    </div>
  );
};

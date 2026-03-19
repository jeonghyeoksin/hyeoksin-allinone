
import React, { useState } from 'react';
import { ProfitItemState, GeneratedContent } from '../types';
import { generateProfitItems } from '../services/geminiService';

export const ProfitItemFinder: React.FC = () => {
  const [inputs, setInputs] = useState<ProfitItemState>({
    category: ''
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleGenerate = async () => {
    if (!inputs.category.trim()) return;
    
    setResult({ loading: true, text: undefined });
    setStatusMessage("Google Search를 통해 실시간 트렌드와 수익성 높은 아이템을 발굴 중입니다...");
    
    try {
      const { text, usage } = await generateProfitItems(inputs.category);
      setResult({ loading: false, text, usage });
      setStatusMessage("");
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
      setStatusMessage("");
    }
  };

  const copyToClipboard = async () => {
      if (!result.text) return;
      try {
        // Strip HTML tags for plain text copy
        const plainText = result.text.replace(/<[^>]*>?/gm, '');
        await navigator.clipboard.writeText(plainText);
        alert("분석 내용이 복사되었습니다.");
      } catch (err) {
        console.error("Copy failed", err);
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="w-2 h-6 bg-amber-500 rounded mr-3"></span>
          수익화 아이템 발굴 (Profit Hunter)
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              관심 카테고리 또는 분야
            </label>
            <input
              type="text"
              value={inputs.category}
              onChange={(e) => setInputs({ category: e.target.value })}
              placeholder="예: 1인 가구, 캠핑 용품, 데스크테리어, AI 부업"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-lg"
            />
            <p className="text-xs text-slate-500 mt-2">
              * 입력하신 분야의 최신 트렌드를 분석하여, 지금 당장 시작하기 좋은 <b>블루오션 아이템 5가지</b>를 찾아드립니다.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={result.loading || !inputs.category.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
              result.loading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 shadow-amber-900/50'
            }`}
          >
            {result.loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>트렌드 데이터 수집 및 분석 중...</span>
              </div>
            ) : (
              '돈 되는 아이템 찾기'
            )}
          </button>
          
          {result.loading && (
              <p className="text-center text-amber-300 text-sm animate-pulse">{statusMessage}</p>
          )}
        </div>
      </div>

      {/* Output Section */}
      {(result.text || result.error) && (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[500px] flex flex-col relative animate-fade-in">
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    발굴된 수익화 아이템 리스트
                </h3>
                {result.text && (
                    <button 
                        onClick={copyToClipboard}
                        className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        전체 복사
                    </button>
                )}
            </div>

            {result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                    <strong>오류 발생:</strong> {result.error}
                </div>
            )}

            {!result.text && !result.loading && !result.error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    <p>관심 분야를 입력하면 돈이 되는 아이템을 찾아드립니다.</p>
                </div>
            )}
            
            {result.text && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    <div className="col-span-full mb-4 bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <p className="text-sm text-slate-300">
                            💡 <b>Gemini 3.0 Analysis:</b> 구글 검색 트렌드와 시장 수요를 기반으로 선정된 TOP 5 아이템입니다.
                        </p>
                    </div>
                    <div className="col-span-full grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" dangerouslySetInnerHTML={{ __html: result.text }} />
                </div>
            )}
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { CarouselSummaryState, GeneratedContent } from '../types';
import { generateCarouselSummary } from '../services/geminiService';

export const CarouselSummary: React.FC = () => {
  const [inputs, setInputs] = useState<CarouselSummaryState>({
    content: '',
    slideCount: 7
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleGenerate = async () => {
    if (!inputs.content.trim()) return;
    
    setResult({ loading: true, text: undefined });
    setStatusMessage("Gemini가 텍스트를 분석하여 핵심만 추출하고 있습니다...");
    
    try {
      const { text, usage } = await generateCarouselSummary(inputs.content, inputs.slideCount);
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
        // Strip HTML for plain text copy
        const textToCopy = result.text.replace(/<[^>]*>?/gm, '');
        await navigator.clipboard.writeText(textToCopy);
        alert("텍스트가 복사되었습니다.");
      } catch (err) {
        console.error("Copy failed", err);
      }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-pink-500 rounded mr-3"></span>
              캐러셀용 컨텐츠 요약
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  원본 텍스트 (리서치 결과 등) <span className="text-pink-400">*</span>
                </label>
                <textarea
                  value={inputs.content}
                  onChange={(e) => setInputs({ ...inputs, content: e.target.value })}
                  placeholder="컨텐츠 디테일 리서치 결과나 긴 아티클을 여기에 붙여넣으세요."
                  className="w-full h-64 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none custom-scrollbar text-sm leading-relaxed"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-300">슬라이드 장수</label>
                    <span className="text-pink-400 font-bold bg-pink-400/10 px-2 py-0.5 rounded text-sm">{inputs.slideCount}장</span>
                </div>
                <input 
                    type="range" 
                    min="4" 
                    max="10" 
                    step="1"
                    value={inputs.slideCount}
                    onChange={e => setInputs({ ...inputs, slideCount: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                    <span>4장 (핵심)</span>
                    <span>10장 (상세)</span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.content.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-900/50'
                }`}
              >
                {result.loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>요약 및 슬라이드 구성 중...</span>
                  </div>
                ) : (
                  '캐러셀 기획안 생성'
                )}
              </button>
              
              {result.loading && (
                  <p className="text-center text-pink-300 text-xs animate-pulse">{statusMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col relative animate-fade-in">
                
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        캐러셀 슬라이드 기획안
                    </h3>
                    {result.text && (
                        <button 
                            onClick={copyToClipboard}
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white flex items-center gap-1 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            텍스트 복사
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
                        <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p>긴 글을 입력하면 인스타 감성에 맞는 카드뉴스 기획안으로 요약해드립니다.</p>
                    </div>
                )}
                
                {result.text && (
                    <div className="flex-1 p-2">
                        <div dangerouslySetInnerHTML={{ __html: result.text }} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

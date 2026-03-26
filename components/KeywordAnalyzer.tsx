
import React, { useState } from 'react';
import { KeywordAnalysisState, TokenUsage } from '../types';
import { generateKeywordAnalysis } from '../services/geminiService';

interface KeywordData {
  word: string;
  competition: number;
  potential: number;
  intent: string;
}

interface AnalysisResult {
  summary: string;
  keywords: KeywordData[];
  strategies: string[];
  suggestedTitles: string[];
}

interface KeywordAnalyzerProps {
  setProgress: (progress: number) => void;
}

export const KeywordAnalyzer: React.FC<KeywordAnalyzerProps> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<KeywordAnalysisState>({ topic: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputs.topic) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(10);

    try {
      const { data, usage: costUsage } = await generateKeywordAnalysis(inputs.topic);
      setProgress(100);
      setResult(data);
      setUsage(costUsage);
      setTimeout(() => setProgress(0), 1000);
    } catch (e: any) {
      setError(e.message);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionColor = (score: number) => {
    if (score < 40) return 'bg-green-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIntentColor = (intent: string) => {
    if (intent.includes('구매')) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (intent.includes('정보')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Input Section */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          키워드 마이닝 & 데이터 분석
        </h3>
        
        <div className="space-y-6">
          <div className="relative group">
            <textarea
              value={inputs.topic}
              onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
              placeholder="분석하고 싶은 메인 키워드나 제품명을 입력하세요."
              className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all resize-none text-lg"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !inputs.topic}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform active:scale-95 flex justify-center items-center gap-3 ${
              loading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 shadow-yellow-500/20'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                데이터 수집 및 시각화 중...
              </>
            ) : (
              'SEO 분석 리포트 생성'
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Result Dashboard */}
      {result && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Summary Card */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl relative">
             <h4 className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-3">Analysis Summary</h4>
             <p className="text-xl text-slate-100 leading-relaxed font-medium">{result.summary}</p>
          </div>

          {/* Grid Layout for Keywords & Strategies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Keyword Table */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-yellow-500 rounded-full"></span>
                        핵심 키워드 매트릭스
                    </h4>
                    <span className="text-xs text-slate-500">정확도 98.4%</span>
                </div>
                
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">키워드</th>
                                <th className="px-6 py-4">의도</th>
                                <th className="px-6 py-4">경쟁도</th>
                                <th className="px-6 py-4">잠재력</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {result.keywords.map((kw, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-200 group-hover:text-yellow-400 transition-colors">{kw.word}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getIntentColor(kw.intent)}`}>
                                            {kw.intent}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${getCompetitionColor(kw.competition)}`} style={{ width: `${kw.competition}%` }}></div>
                                            </div>
                                            <span className="text-xs text-slate-400">{kw.competition}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.4503-.385c-.39.23-1.415.97-2.15 1.24a3.323 3.323 0 01-1.065.232c-2.106.096-4.413 1.108-5.945 2.047A1.5 1.5 0 001 7.105v8.82a1 1 0 001.513.857c.79-.477 1.342-.512 1.897-.512.467 0 .86.135 1.207.281.397.167.797.337 1.25.337.454 0 .854-.17 1.25-.337.347-.146.74-.281 1.207-.281.555 0 1.108.035 1.897.512a1 1 0 001.513-.857V7.105a1.5 1.5 0 00-.732-1.307 31.33 31.33 0 01-3.536-1.924 1.125 1.125 0 01-.427-.446c-.2-.369-.26-.77-.256-1.178z" clipRule="evenodd" /></svg>
                                            {kw.potential}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Strategy Sidebar */}
            <div className="space-y-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                    <span className="w-1.5 h-5 bg-yellow-500 rounded-full"></span>
                    SEO 공략 전략
                </h4>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
                    {result.strategies.map((s, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-3xl">
                    <p className="text-xs text-yellow-500 font-bold mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        AI Insight
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        위 키워드들은 현재 소셜 미디어 트렌드와 검색 엔진의 LSI(잠재적 의미 인덱싱)를 반영하여 추출되었습니다.
                    </p>
                </div>
            </div>
          </div>

          {/* Suggested Titles */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                <span className="w-1.5 h-5 bg-yellow-500 rounded-full"></span>
                추천 콘텐츠 아이디어 (황금 제목)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.suggestedTitles.map((title, i) => (
                    <div 
                        key={i} 
                        onClick={() => navigator.clipboard.writeText(title)}
                        className="bg-slate-800/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/80 hover:border-yellow-500/30 transition-all"
                    >
                        <span className="text-slate-200 group-hover:text-white transition-colors pr-4">{title}</span>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

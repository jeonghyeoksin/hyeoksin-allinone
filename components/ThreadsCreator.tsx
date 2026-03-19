
import React, { useState } from 'react';
import { ThreadsState, GeneratedContent } from '../types';
import { generateThreadsPost } from '../services/geminiService';

export const ThreadsCreator: React.FC = () => {
  const [inputs, setInputs] = useState<ThreadsState>({
    topic: '',
    target: '',
    tone: '친구 같은',
    goal: '공감 댓글'
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });

  const handleGenerate = async () => {
    if (!inputs.topic) return;
    
    setResult({ loading: true, text: undefined });
    
    try {
      const text = await generateThreadsPost(inputs.topic, inputs.target, inputs.tone, inputs.goal);
      setResult({ loading: false, text });
    } catch (e: any) {
      setResult(prev => ({ ...prev, loading: false, error: e.message }));
    }
  };

  const copyToClipboard = async () => {
      if (!result.text) return;
      try {
        const type = "text/html";
        const blob = new Blob([result.text], { type });
        const textType = "text/plain";
        const textBlob = new Blob([result.text.replace(/<[^>]*>?/gm, '')], { type: textType });
        
        const data = [new ClipboardItem({ 
            [type]: blob,
            [textType]: textBlob 
        })];
        
        await navigator.clipboard.write(data);
        alert("스레드 초안이 복사되었습니다!");
      } catch (err) {
        console.warn("Rich text copy failed", err);
        await navigator.clipboard.writeText(result.text.replace(/<[^>]*>?/gm, ''));
        alert("텍스트가 복사되었습니다.");
      }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-white text-black rounded-full mr-2 text-sm font-bold">@</span>
              스레드 포스팅 설정
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  주제 및 소재 <span className="text-white">*</span>
                </label>
                <textarea
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                  placeholder="예: 개발자 취업 꿀팁, 오늘 겪은 웃긴 일, 독서 후기"
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white transition-all resize-none custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  타겟 독자
                </label>
                <input
                  type="text"
                  value={inputs.target}
                  onChange={(e) => setInputs({ ...inputs, target: e.target.value })}
                  placeholder="예: 주니어 직장인, 육아맘, 대학생"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  톤앤매너
                </label>
                <select
                  value={inputs.tone}
                  onChange={(e) => setInputs({ ...inputs, tone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all appearance-none"
                >
                  <option value="친구 같은">친구 같은 (반말/음슴체)</option>
                  <option value="시니컬한">시니컬한 (현실적인)</option>
                  <option value="유머러스한">유머러스한 (재미있는)</option>
                  <option value="진지한">진지한 (인사이트)</option>
                  <option value="감성적인">감성적인 (새벽 감성)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  핵심 목표
                </label>
                <select
                  value={inputs.goal}
                  onChange={(e) => setInputs({ ...inputs, goal: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all appearance-none"
                >
                  <option value="공감 댓글">공감 댓글 유도</option>
                  <option value="팔로우">팔로우 증가</option>
                  <option value="리포스트">리포스트(재게시) 확산</option>
                  <option value="링크 클릭">링크 클릭/유입</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.topic}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-white text-black hover:bg-gray-200 shadow-white/20'
                }`}
              >
                {result.loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>생성 중...</span>
                    </div>
                  </div>
                ) : (
                  '스레드 포스팅 생성'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[600px] flex flex-col">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                    스레드(Threads) 추천 초안
                </h3>
                {result.text && (
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white transition-colors flex items-center gap-1"
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
                    <span className="text-6xl mb-4 opacity-30">@</span>
                    <p>주제를 입력하면 알고리즘에 최적화된 3가지 버전의 글이 생성됩니다.</p>
                </div>
             )}
             
             {result.text && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div 
                        className="prose prose-invert prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: result.text }} 
                    />
                </div>
             )}

          </div>
        </div>
      </div>
    </div>
  );
};

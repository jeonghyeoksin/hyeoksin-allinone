
import React, { useState } from 'react';
import { NewsletterState, GeneratedContent } from '../types';
import { generateNewsletter, generateNewsletterImage } from '../services/geminiService';

interface NewsletterCreatorProps {
  setProgress: (progress: number) => void;
}

export const NewsletterCreator: React.FC<NewsletterCreatorProps> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<NewsletterState>({
    topic: ''
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isWaitingForKey, setIsWaitingForKey] = useState<boolean>(false);

  const checkApiKey = async () => {
      if ((window as any).aistudio) {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          if (!hasKey) {
              setIsWaitingForKey(true);
              return false;
          }
      }
      return true;
  };

  const handleSelectKey = async () => {
      if ((window as any).aistudio) {
          try {
              await (window as any).aistudio.openSelectKey();
              setIsWaitingForKey(false);
          } catch (e) {
              console.error(e);
          }
      }
  };

  const handleGenerate = async () => {
    if (!inputs.topic) return;
    
    // Check key before starting
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    setResult({ loading: true, text: undefined, imageUrl: undefined });
    setStatusMessage("뉴스레터 에디터가 원고를 작성하고 있습니다...");
    setProgress(10);
    
    try {
      // 1. Generate Text Content
      const { text, usage: textUsage } = await generateNewsletter(inputs.topic);
      setProgress(50);
      setResult(prev => ({ ...prev, text, loading: true }));
      
      // 2. Generate Image
      setStatusMessage("비주얼 디렉터가 썸네일 이미지를 디자인하고 있습니다...");
      const { imageUrl, usage: imageUsage } = await generateNewsletterImage(inputs.topic);
      
      setProgress(90);
      const totalUsage = {
          inputTokens: (textUsage?.inputTokens || 0) + (imageUsage?.inputTokens || 0),
          outputTokens: (textUsage?.outputTokens || 0) + (imageUsage?.outputTokens || 0),
          imageCount: (textUsage?.imageCount || 0) + (imageUsage?.imageCount || 0),
          videoCount: 0,
          totalCostKRW: (textUsage?.totalCostKRW || 0) + (imageUsage?.totalCostKRW || 0)
      };

      setProgress(100);
      setResult({ loading: false, text, imageUrl, usage: totalUsage });
      setStatusMessage("");
      setTimeout(() => setProgress(0), 1000);
      
    } catch (e: any) {
      setResult(prev => ({ ...prev, loading: false, error: e.message }));
      setStatusMessage("");
      setProgress(0);
    }
  };

  const copyToClipboard = async () => {
      if (!result.text) return;
      
      try {
        const type = "text/html";
        const blob = new Blob([result.text], { type });
        const textType = "text/plain";
        // Simple regex to strip tags for plain text fallback
        const textBlob = new Blob([result.text.replace(/<[^>]*>?/gm, '')], { type: textType });
        
        const data = [new ClipboardItem({ 
            [type]: blob,
            [textType]: textBlob 
        })];
        
        await navigator.clipboard.write(data);
        alert("서식이 포함된 원고가 복사되었습니다!");
      } catch (err) {
        // Fallback for browsers that don't support ClipboardItem or if write fails
        console.warn("Rich text copy failed, falling back to plain text", err);
        await navigator.clipboard.writeText(result.text.replace(/<[^>]*>?/gm, ''));
        alert("텍스트가 복사되었습니다. (서식 복사 실패 - 브라우저 호환성 문제)");
      }
  };

  return (
    <div className="space-y-6">
      {isWaitingForKey && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-lime-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                  <div className="w-16 h-16 bg-lime-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-lime-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gemini 3.0 Pro API Key Required</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      고품질 이미지 및 텍스트 생성을 위해 <br/>
                      <b>유료 프로젝트의 API 키</b> 선택이 필요합니다.
                  </p>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-lime-500/20"
                  >
                      API 키 선택하기
                  </button>
                  <p className="text-[10px] text-slate-500 mt-4 underline cursor-pointer" onClick={() => setIsWaitingForKey(false)}>나중에 하기</p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-6 bg-lime-500 rounded mr-2"></span>
              뉴스레터 제작 설정
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  뉴스레터 주제/키워드 <span className="text-lime-400">*</span>
                </label>
                <textarea
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                  placeholder="예: AI 시대의 생존 전략, 직장인 재테크 꿀팁"
                  className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all resize-none custom-scrollbar"
                />
                <p className="text-xs text-slate-500 mt-2">
                  * 주제를 입력하면 전문 에디터가 후킹하는 제목, 본문, CTA를 작성하고 비주얼 디렉터가 썸네일을 제작합니다.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.topic}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-500 hover:to-green-500 text-white shadow-lime-900/50'
                }`}
              >
                {result.loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>제작 중...</span>
                    </div>
                  </div>
                ) : (
                  '뉴스레터 원고 & 썸네일 생성'
                )}
              </button>
              {result.loading && <p className="text-xs text-center text-lime-300 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[600px] flex flex-col relative">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                    뉴스레터 초안 & 디자인
                </h3>
             </div>

             {result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                    <strong>오류 발생:</strong> {result.error}
                </div>
             )}

             {!result.text && !result.loading && !result.error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <p>주제를 입력하면 뉴스레터 콘텐츠가 생성됩니다.</p>
                </div>
             )}
             
             <div className="space-y-8">
                 {/* Thumbnail Image */}
                 {result.imageUrl && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                        <img src={result.imageUrl} alt="Newsletter Thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <a 
                                href={result.imageUrl} 
                                download="newsletter_thumbnail.png"
                                className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-lime-50 transform translate-y-2 group-hover:translate-y-0 transition-all"
                            >
                                썸네일 다운로드
                            </a>
                        </div>
                        <div className="absolute top-4 left-4 bg-lime-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                            16:9 Thumbnail
                        </div>
                    </div>
                 )}

                 {/* Text Content */}
                 {result.text && (
                    <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5">
                        <div 
                            className="prose prose-invert prose-lg max-w-none newsletter-content"
                            dangerouslySetInnerHTML={{ __html: result.text }}
                        />
                        <button 
                            onClick={copyToClipboard}
                            className="mt-6 text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            서식 포함 전체 복사
                        </button>
                    </div>
                 )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { ProfessionalBlogState, GeneratedContent } from '../types';
import { generateProfessionalBlogPost, generateBlogImagesBatch } from '../services/geminiService';

export const ProfessionalBlogWriter: React.FC<{ setProgress: (p: number) => void }> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<ProfessionalBlogState>({
    job: '',
    target: '',
    topic: '',
    usp: '',
    tone: '신뢰감 있고 전문적인'
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleGenerate = async () => {
    if (!inputs.job || !inputs.topic) return;
    
    setResult({ loading: true, text: undefined, images: undefined });
    setStatusMessage("P.A.S.C 프레임워크를 적용하여 고전환 원고를 설계하고 있습니다...");
    setProgress(10);
    
    try {
      // 1. Generate Text (Gemini 3 Pro)
      const { text, usage: textUsage } = await generateProfessionalBlogPost(
        inputs.job,
        inputs.target,
        inputs.topic,
        inputs.usp,
        inputs.tone
      );
      
      setProgress(50);
      setResult(prev => ({ ...prev, text, usage: textUsage, loading: true }));
      setStatusMessage("전문적인 느낌의 블로그 이미지를 생성하고 있습니다...");

      // 2. Generate Images
      const { images, usage: imageUsage } = await generateBlogImagesBatch(inputs.topic, inputs.job);
      
      setProgress(100);
      const totalUsage = {
          inputTokens: (textUsage?.inputTokens || 0) + (imageUsage?.inputTokens || 0),
          outputTokens: (textUsage?.outputTokens || 0) + (imageUsage?.outputTokens || 0),
          imageCount: (textUsage?.imageCount || 0) + (imageUsage?.imageCount || 0),
          videoCount: 0,
          totalCostKRW: (textUsage?.totalCostKRW || 0) + (imageUsage?.totalCostKRW || 0)
      };

      setResult({ loading: false, text, images, usage: totalUsage });
      setStatusMessage("");
      setTimeout(() => setProgress(0), 1000);
      
    } catch (e: any) {
      setResult(prev => ({ ...prev, loading: false, error: e.message }));
      setStatusMessage("");
      setProgress(0);
    }
  };

  const downloadAllImages = () => {
    if (!result.images) return;
    result.images.forEach((img, index) => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `professional_image_${index + 1}.png`;
        document.body.appendChild(link);
        setTimeout(() => { link.click(); document.body.removeChild(link); }, index * 500); 
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-6 bg-indigo-500 rounded mr-2"></span>
              전문직 블로그 인터뷰
            </h3>
            <p className="text-xs text-slate-400 mb-6 bg-slate-800 p-3 rounded leading-relaxed">
               "위 질문에 답변해 주시면, 고객이 당장 전화를 걸고 싶어지는 매력적인 글을 작성해 드리겠습니다."
            </p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  1. 전문 분야 및 직업 <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={inputs.job}
                  onChange={(e) => setInputs({ ...inputs, job: e.target.value })}
                  placeholder="예: 형사 전문 변호사, 상속 세무사"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  2. 타겟 독자 및 고민 <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  value={inputs.target}
                  onChange={(e) => setInputs({ ...inputs, target: e.target.value })}
                  placeholder="예: 이혼 소송을 고민 중인 30대 여성, 세무조사가 두려운 개인사업자"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-20 resize-none custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  3. 핵심 주제 (키워드) <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                  placeholder="예: 상간녀 위자료 청구 소송, 종부세 절세 전략"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  4. 차별점 (USP) / 성과
                </label>
                <textarea
                  value={inputs.usp}
                  onChange={(e) => setInputs({ ...inputs, usp: e.target.value })}
                  placeholder="예: 승소율 98%, 1:1 비밀 상담 보장, 15년 경력 등"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-20 resize-none custom-scrollbar"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.job || !inputs.topic}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/50'
                }`}
              >
                {result.loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>작성 중...</span>
                    </div>
                  </div>
                ) : (
                  '고전환 블로그 포스팅 생성'
                )}
              </button>
              {result.loading && <p className="text-xs text-center text-indigo-300 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                    P.A.S.C 기반 전문직 칼럼
                </h3>
             </div>

             {result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                    <strong>오류 발생:</strong> {result.error}
                </div>
             )}

             {!result.text && !result.loading && !result.error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                    <p>전문 분야와 타겟을 입력하면 문의가 쇄도하는 글을 작성해드립니다.</p>
                </div>
             )}
             
             {result.text && (
                <div className="mb-6 no-copy">
                    <div className="bg-white text-slate-900 p-8 rounded-xl leading-relaxed shadow-inner">
                        <div dangerouslySetInnerHTML={{ __html: result.text }} />
                    </div>
                </div>
             )}

             {/* Images */}
             {result.images && (
                 <div className="border-t border-white/10 pt-6">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold text-slate-300">추천 블로그 이미지</h4>
                        <button onClick={downloadAllImages} className="text-xs text-indigo-400 hover:text-indigo-300">모두 저장</button>
                     </div>
                     <div className="grid grid-cols-5 gap-3">
                        {result.images.map((img, idx) => (
                            <div key={idx} className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative group">
                                <img src={img.url} className="w-full h-full object-cover" alt="Blog" />
                                <a href={img.url} download={`pro_img_${idx}.png`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">다운</a>
                            </div>
                        ))}
                     </div>
                 </div>
             )}

            </div>
         </div>
      </div>
    </div>
  );
};

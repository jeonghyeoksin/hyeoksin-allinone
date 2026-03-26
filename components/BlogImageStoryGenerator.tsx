
import React, { useState } from 'react';
import { GeneratedContent } from '../types';
import { generateStorytellingImages } from '../services/geminiService';

interface BlogImageStoryGeneratorProps {
  setProgress: (progress: number) => void;
}

export const BlogImageStoryGenerator: React.FC<BlogImageStoryGeneratorProps> = ({ setProgress }) => {
  const [content, setContent] = useState<string>('');
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleGenerate = async () => {
    if (!content) return;
    
    setResult({ loading: true, images: undefined });
    setStatusMessage("내용을 분석하여 4단계 스토리텔링 이미지를 기획하고 있습니다...");
    setProgress(20);
    
    try {
      // Generate 4 sequential images
      const images = await generateStorytellingImages(content);
      setProgress(100);
      setResult({ loading: false, images });
      setStatusMessage("");
      setTimeout(() => setProgress(0), 1000);
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
      setStatusMessage("");
      setProgress(0);
    }
  };

  const downloadAllImages = () => {
    if (!result.images) return;
    
    result.images.forEach((img, index) => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `story_image_${index + 1}_${img.type.replace(/[^a-z0-9]/gi, '_')}.png`;
        document.body.appendChild(link);
        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
        }, index * 500); 
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-6 bg-pink-500 rounded mr-2"></span>
              본문 내용 입력
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  블로그 글 내용 (또는 핵심 요약) <span className="text-pink-400">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="이미지로 만들고 싶은 블로그 글의 내용을 입력하세요. (최대 1000자 권장)&#13;&#10;예: 이번 글은 효과적인 시간 관리법에 대한 내용입니다. 1. 우선순위 정하기, 2. 타이머 활용하기, 3. 휴식 시간 갖기..."
                  className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none custom-scrollbar"
                />
                <p className="text-xs text-slate-500 mt-2">
                  * 입력된 내용을 바탕으로 기승전결(Hook-Concept-Solution-CTA) 구조의 4컷 이미지가 생성됩니다.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !content}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-900/50'
                }`}
              >
                {result.loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>생성 중...</span>
                    </div>
                  </div>
                ) : (
                  '4단계 인포그래픽 생성'
                )}
              </button>
              {result.loading && <p className="text-xs text-center text-pink-300 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl min-h-[500px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <span className="w-2 h-6 bg-pink-500 rounded mr-2"></span>
                    생성된 스토리텔링 이미지 (4장)
                </h3>
                {result.images && (
                    <button 
                        onClick={downloadAllImages}
                        className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        모두 다운로드
                    </button>
                )}
             </div>

             {result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                    {result.error}
                </div>
             )}

             {!result.images && !result.loading && !result.error && (
                <div className="flex flex-col items-center justify-center h-96 text-slate-500 opacity-60">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>내용을 입력하면 4단계(Hook-Concept-Solution-CTA) 이미지가 생성됩니다.</p>
                </div>
             )}
             
             {result.images && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/5 bg-black/40 shadow-lg">
                            <div className="absolute top-2 left-2 bg-pink-600/80 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white z-10 shadow">
                                {img.type}
                            </div>
                            <img src={img.url} alt={img.type} className="w-full h-auto aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <a 
                                    href={img.url} 
                                    download={`story_image_${idx + 1}.png`}
                                    className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-xl hover:bg-slate-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                                >
                                    다운로드
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

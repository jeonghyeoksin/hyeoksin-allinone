
import React, { useState, useRef, useEffect } from 'react';
import { CardNewsState, GeneratedContent, CarouselSlide } from '../types';
import { planInstaCardNews, generateCarouselImage } from '../services/geminiService';

interface InstaCardNewsGeneratorProps {
  setProgress: (progress: number) => void;
}

export const InstaCardNewsGenerator: React.FC<InstaCardNewsGeneratorProps> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<CardNewsState>({
    topic: '',
    style: '미니멀 & 모던 (Minimal & Modern)'
  });
  const [slideCount, setSlideCount] = useState<number>(10);
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [caption, setCaption] = useState<string>("");
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
    
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    setResult({ loading: true });
    setSlides([]);
    setCaption("");
    setStatusMessage(`1단계: 딥리서치를 통해 ${slideCount}장 기획안 및 캡션 작성 중...`);
    setProgress(10);
    
    try {
      // 1. Planning with Deep Research
      const { slides: plannedSlides, caption: generatedCaption, usage } = await planInstaCardNews(inputs.topic, inputs.style, slideCount);
      
      setProgress(30);
      setSlides(plannedSlides);
      setCaption(generatedCaption);
      setStatusMessage("2단계: 기획 완료. 각 슬라이드별 이미지를 자동 생성합니다...");
      
      // 2. Start Automatic Image Generation Loop
      await generateAllImages(plannedSlides);
      
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
      setStatusMessage("오류가 발생했습니다. 다시 시도해주세요.");
      setProgress(0);
    }
  };

  const generateAllImages = async (targetSlides: CarouselSlide[]) => {
      for (let i = 0; i < targetSlides.length; i++) {
          const slide = targetSlides[i];
          
          // Update status
          setStatusMessage(`이미지 생성 중... (${i + 1}/${targetSlides.length}) - ${slide.title}`);
          const currentProgress = 30 + Math.floor(((i + 1) / targetSlides.length) * 70);
          setProgress(currentProgress);
          
          // Update specific slide loading state
          setSlides(prev => prev.map(s => s.slideNumber === slide.slideNumber ? { ...s, isLoading: true } : s));

          try {
              const imageUrl = await generateCarouselImage(slide, inputs.style);
              
              // Update slide with image url
              setSlides(prev => prev.map(s => 
                  s.slideNumber === slide.slideNumber 
                  ? { ...s, imageUrl, isLoading: false } 
                  : s
              ));
          } catch (e) {
              console.error(`Slide ${slide.slideNumber} failed`, e);
              setSlides(prev => prev.map(s => 
                  s.slideNumber === slide.slideNumber 
                  ? { ...s, isLoading: false } 
                  : s
              ));
          }
      }
      setResult({ loading: false });
      setStatusMessage("모든 작업이 완료되었습니다!");
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
  };

  const copyCaption = () => {
      if (!caption) return;
      navigator.clipboard.writeText(caption);
      alert("캡션이 복사되었습니다.");
  }

  const styleOptions = [
    '미니멀 & 모던 (Minimal & Modern)',
    '3D 아이소메트릭 (3D Isometric)',
    '비비드 & 팝 (Vivid & Pop)',
    '감성 일러스트 (Emotional Illustration)',
    '전문적인 타이포그래피 (Professional Typography)',
    '다크 모드 네온 (Dark Mode Neon)'
  ];

  return (
    <div className="space-y-6 pb-20">
      {isWaitingForKey && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-pink-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                  <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gemini 3.0 Pro API Key Required</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      딥리서치 및 고품질 이미지 생성을 위해 <br/>
                      <b>유료 프로젝트의 API 키</b> 선택이 필요합니다.
                  </p>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-500/20"
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
              <span className="w-2 h-6 bg-pink-500 rounded mr-2"></span>
              인스타 캐러셀 (Deep Research)
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  주제 및 내용 <span className="text-pink-400">*</span>
                </label>
                <textarea
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                  placeholder="예: '직장인을 위한 10분 운동법'. 주제를 입력하면 최신 정보를 검색하여 기획부터 이미지, 캡션까지 자동으로 완성합니다."
                  className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none custom-scrollbar"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-300">슬라이드 장수</label>
                    <span className="text-pink-400 font-bold bg-pink-400/10 px-3 py-1 rounded-full text-xs">{slideCount}장</span>
                </div>
                <input 
                    type="range" 
                    min="4" 
                    max="10" 
                    step="1"
                    value={slideCount}
                    onChange={(e) => setSlideCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>4장 (핵심)</span>
                    <span>10장 (상세)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">디자인 스타일</label>
                <select
                  value={inputs.style}
                  onChange={(e) => setInputs({ ...inputs, style: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all appearance-none"
                >
                  {styleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.topic}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white shadow-pink-900/50'
                }`}
              >
                {result.loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>진행 중...</span>
                    </div>
                  </div>
                ) : (
                  '기획안 + 전 이미지 자동 생성'
                )}
              </button>
              
              {result.loading && (
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-pink-500/20">
                      <p className="text-xs text-center text-pink-300 animate-pulse font-medium">{statusMessage}</p>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl min-h-[600px] flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-orange-500 rounded"></span>
                    캐러셀 결과물 ({slides.length > 0 ? slides.length : '0'}장)
                </h3>
                {result.loading && (
                    <span className="text-xs text-slate-400 animate-pulse bg-slate-800 px-3 py-1 rounded-full">
                        {statusMessage}
                    </span>
                )}
             </div>

             {result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4 w-full">
                    {result.error}
                </div>
             )}

             {slides.length === 0 && !result.loading && !result.error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>주제를 입력하면 Deep Research를 통해 기획 후 이미지를 자동 생성합니다.</p>
                </div>
             )}
             
             {/* Slide Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2 pb-4 mb-6">
                 {slides.map((slide) => (
                     <div key={slide.slideNumber} className="bg-slate-800/40 rounded-xl overflow-hidden border border-white/5 shadow-lg group hover:border-pink-500/30 transition-all">
                         {/* Image Area */}
                         <div className="aspect-[4/5] bg-black/40 relative">
                             {slide.imageUrl ? (
                                 <img src={slide.imageUrl} alt={`Slide ${slide.slideNumber}`} className="w-full h-full object-cover" />
                             ) : slide.isLoading ? (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                                     <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                     <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Rendering...</span>
                                 </div>
                             ) : (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                                     <span className="text-xs">대기 중...</span>
                                 </div>
                             )}
                             
                             <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-bold border border-white/10">
                                 {slide.slideNumber === 1 ? 'COVER' : `#${slide.slideNumber}`}
                             </div>

                             {slide.imageUrl && (
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <a 
                                         href={slide.imageUrl} 
                                         download={`insta_slide_${slide.slideNumber}.png`}
                                         className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs shadow-lg hover:bg-pink-50"
                                     >
                                         다운로드
                                     </a>
                                 </div>
                             )}
                         </div>
                     </div>
                 ))}
             </div>

             {/* Caption Section */}
             {caption && (
                 <div className="mt-auto bg-slate-800/50 rounded-xl border border-white/10 p-4">
                     <div className="flex justify-between items-center mb-2">
                         <h4 className="text-sm font-bold text-pink-400 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                             알고리즘 최적화 캡션
                         </h4>
                         <button 
                             onClick={copyCaption}
                             className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition-colors"
                         >
                             캡션 복사
                         </button>
                     </div>
                     <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar p-2 bg-slate-900/30 rounded-lg border border-white/5">
                         {caption}
                     </div>
                 </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

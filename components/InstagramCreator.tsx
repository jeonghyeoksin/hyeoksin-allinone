
import React, { useState, useRef } from 'react';
import { InstaState, GeneratedContent, CardNewsState } from '../types';
import { generateInstagramContent, generateInstaCardNews } from '../services/geminiService';

export const InstagramCreator: React.FC<{ setProgress: (p: number) => void }> = ({ setProgress }) => {
  const [pageCount, setPageCount] = useState<number>(1);
  
  // Single Post State
  const [singleInputs, setSingleInputs] = useState<InstaState>({
    concept: '',
    mood: '트렌디한(Trendy)',
    referenceImage: undefined
  });
  
  // Carousel State
  const [carouselInputs, setCarouselInputs] = useState<CardNewsState>({
    topic: '',
    style: '미니멀 & 모던 (Minimal & Modern)'
  });

  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [isWaitingForKey, setIsWaitingForKey] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    if (pageCount === 1) {
        // Single Post Logic
        if (!singleInputs.concept) return;
        setResult({ loading: true, imageUrl: undefined, text: undefined });
        setStatusMessage("Gemini 3.0 Pro가 감성적인 피드를 생성 중입니다...");
        setProgress(20);

        try {
            const { imageUrl, caption } = await generateInstagramContent(singleInputs.concept, singleInputs.mood, singleInputs.referenceImage);
            setProgress(100);
            setResult({ loading: false, imageUrl, text: caption });
            setStatusMessage("");
            setTimeout(() => setProgress(0), 1000);
        } catch (e: any) {
            setResult({ loading: false, error: e.message });
            setStatusMessage("");
            setProgress(0);
        }
    } else {
        // Carousel Logic
        if (!carouselInputs.topic) return;
        setResult({ loading: true, imageUrl: undefined, text: undefined });
        setStatusMessage(`1단계: ${pageCount}컷 스토리보드 기획 중...`);
        setProgress(20);
        
        try {
            setStatusMessage("2단계: Gemini 3.0 Pro가 표지 이미지를 렌더링 중입니다...");
            setProgress(60);
            const { imageUrl, text } = await generateInstaCardNews(carouselInputs.topic, carouselInputs.style, pageCount);
            setProgress(100);
            setResult({ loading: false, imageUrl, text });
            setStatusMessage("");
            setTimeout(() => setProgress(0), 1000);
        } catch (e: any) {
            setResult({ loading: false, error: e.message });
            setStatusMessage("");
            setProgress(0);
        }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSingleInputs(prev => ({ ...prev, referenceImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setSingleInputs(prev => ({ ...prev, referenceImage: undefined }));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const moodOptions = [
    { name: '트렌디한(Trendy)', value: '트렌디한(Trendy)' }, 
    { name: '미니멀(Minimal)', value: '미니멀(Minimal)' }, 
    { name: '비비드(Vivid)', value: '비비드(Vivid)' }, 
    { name: '빈티지(Vintage)', value: '빈티지(Vintage)' }, 
    { name: '자연주의(Natural)', value: '자연주의(Natural)' },
    { name: '카드뉴스(Infographic)', value: '카드뉴스(Infographic)' },
    { name: '다크 모드(Dark Mode)', value: '다크 모드(Dark Mode)' },
    { name: '3D 입체(3D)', value: '3D 입체(3D)' },
    { name: '전문적인(Professional)', value: '전문적인(Professional)' },
    { name: '전문가 다크(Black & Lime)', value: '배경: 블랙, 포인트: 형광 라임' }
  ];

  const styleOptions = [
    '미니멀 & 모던 (Minimal & Modern)',
    '3D 아이소메트릭 (3D Isometric)',
    '비비드 & 팝 (Vivid & Pop)',
    '감성 일러스트 (Emotional Illustration)',
    '전문적인 타이포그래피 (Professional Typography)',
    '다크 모드 네온 (Dark Mode Neon)'
  ];

  return (
    <div className="space-y-6">
      {isWaitingForKey && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-pink-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                  <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gemini 3.0 Pro API Key Required</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      고품질 이미지 및 캡션 생성을 위해 <br/>
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

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    페이지 수 (생성 옵션)
                </h3>
                <span className="text-pink-400 font-bold bg-pink-400/10 px-3 py-1 rounded-full text-sm border border-pink-400/20">{pageCount}장</span>
            </div>
            <div className="relative pt-2">
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={pageCount}
                    onChange={(e) => {
                        setPageCount(parseInt(e.target.value));
                        setResult({ loading: false });
                    }}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 px-1 font-medium">
                    <span>1장 (단일 피드)</span>
                    <span className="text-slate-400">5장</span>
                    <span>10장 (카드뉴스)</span>
                </div>
            </div>
        </div>

        {pageCount === 1 ? (
            // --- SINGLE POST INPUTS ---
            <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-300 mb-1 text-pink-400 font-bold uppercase tracking-tight">Post Concept</label>
                        <textarea
                        value={singleInputs.concept}
                        onChange={(e) => setSingleInputs({ ...singleInputs, concept: e.target.value })}
                        placeholder="피드의 주제나 들어갈 내용을 적어주세요."
                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-600 transition-all"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-slate-300 mb-1 text-pink-400 font-bold uppercase tracking-tight">Mood & Style</label>
                        <select
                        value={singleInputs.mood}
                        onChange={(e) => setSingleInputs({ ...singleInputs, mood: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white transition-all focus:ring-2 focus:ring-pink-500 appearance-none"
                        >
                        {moodOptions.map(m => <option key={m.name} value={m.value}>{m.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 text-pink-400 font-bold uppercase tracking-tight">Visual Reference (Optional)</label>
                    {!singleInputs.referenceImage ? (
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 hover:border-pink-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-800/30 transition-all hover:bg-slate-800/50 group">
                            <svg className="w-8 h-8 text-slate-600 group-hover:text-pink-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs text-slate-500 font-bold">이미지 업로드</span>
                        </div>
                    ) : (
                        <div className="relative inline-block group">
                            <img src={singleInputs.referenceImage} alt="Ref" className="h-32 rounded-xl border border-slate-600 shadow-2xl" />
                            <button onClick={clearReferenceImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors font-bold">×</button>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={result.loading || !singleInputs.concept}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex justify-center items-center gap-3 transition-all transform active:scale-[0.98] ${result.loading ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-pink-900/40'}`}
                    >
                        {result.loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>{statusMessage}</span>
                            </>
                        ) : '고품질 인스타 피드 생성'}
                    </button>
                </div>
            </div>
        ) : (
            // --- CAROUSEL INPUTS (Multi-page) ---
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  주제 및 내용 <span className="text-orange-400">*</span>
                </label>
                <textarea
                  value={carouselInputs.topic}
                  onChange={(e) => setCarouselInputs({ ...carouselInputs, topic: e.target.value })}
                  placeholder={`예: '직장인을 위한 10분 운동법'을 주제로 ${pageCount}장의 카드뉴스를 만들어줘. 거북목 교정, 스트레칭 팁 포함.`}
                  className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">디자인 스타일</label>
                <select
                  value={carouselInputs.style}
                  onChange={(e) => setCarouselInputs({ ...carouselInputs, style: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                >
                  {styleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !carouselInputs.topic}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-orange-900/50'
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
                  `${pageCount}장 기획안 및 표지 일괄 생성`
                )}
              </button>
              {result.loading && (
                  <p className="text-xs text-center text-orange-300 animate-pulse">{statusMessage}</p>
              )}
            </div>
        )}
      </div>

      {/* --- OUTPUT SECTION --- */}
      {pageCount === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative pb-20">
            {/* Phone Preview */}
            <div className="flex justify-center animate-fade-in-up">
                <div className="w-[350px] bg-slate-900 text-white rounded-[3rem] border-[12px] border-slate-800 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative ring-1 ring-white/10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                    <div className="aspect-[4/5] bg-slate-950 flex items-center justify-center overflow-hidden relative mt-12">
                        {result.loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md z-10">
                                <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest animate-pulse">Rendering Design...</span>
                            </div>
                        ) : result.imageUrl ? (
                            <img src={result.imageUrl} alt="Instagram Feed" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                        ) : (
                            <div className="text-slate-700 text-center flex flex-col items-center">
                                <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-[10px] font-bold uppercase tracking-tighter opacity-30">Gemini 3.0 Ready</p>
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-3 flex gap-4 text-slate-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </div>
                    <div className="px-4 pb-10 text-sm h-[180px] overflow-y-auto custom-scrollbar no-copy">
                        <p className="font-bold mb-1 flex items-center gap-2">
                            <span className="w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full ring-1 ring-white/20"></span>
                            MyBrand_Agent
                        </p>
                        {result.text ? (
                            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-xs">
                                {result.text}
                            </div>
                        ) : (
                            <div className="space-y-2 mt-2 opacity-10">
                                <div className="h-3 w-3/4 bg-slate-700 rounded"></div>
                                <div className="h-3 w-1/2 bg-slate-700 rounded"></div>
                                <div className="h-3 w-5/6 bg-slate-700 rounded"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right side: Editor */}
            <div className="flex flex-col gap-6 animate-fade-in">
            {result.text && (
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex-1 shadow-xl flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="w-2 h-4 bg-pink-500 rounded"></span>
                            AI 최적화 캡션
                        </h3>
                    </div>
                    <textarea 
                        className="w-full flex-1 bg-slate-800/40 border border-white/5 rounded-2xl p-5 text-slate-200 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-pink-500/30 resize-none custom-scrollbar no-copy" 
                        value={result.text} 
                        onChange={(e) => setResult({...result, text: e.target.value})}
                    />
                </div>
            )}
            {result.imageUrl && (
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-4 bg-rose-500 rounded"></span>
                            고해상도 비주얼 에셋
                        </h3>
                    <a 
                        href={result.imageUrl} 
                        download="instagram_feed_pro.png" 
                        className="block w-full text-center bg-gradient-to-r from-slate-800 to-slate-700 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-black/20"
                    >
                            원본 이미지 다운로드 (1K)
                    </a>
                </div>
            )}
            </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
             {/* Carousel Plan Output */}
             {result.text && (
             <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl h-[600px] overflow-hidden flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                     <h3 className="text-md font-semibold text-white">카드뉴스 기획안 ({pageCount}장)</h3>
                 </div>
                 <div 
                    className="bg-slate-800/50 p-4 rounded-lg flex-1 overflow-y-auto custom-scrollbar text-sm text-slate-300 no-copy" 
                    dangerouslySetInnerHTML={{ __html: result.text }} 
                 />
             </div>
           )}

           {/* Single Cover Image */}
           <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl min-h-[600px] flex flex-col items-center justify-center">
             <div className="flex justify-between items-center w-full mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <span className="w-2 h-6 bg-orange-500 rounded mr-2"></span>
                    대표 표지 이미지
                </h3>
             </div>

             {result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4 w-full">
                    {result.error}
                </div>
             )}

             {!result.imageUrl && !result.loading && !result.error && (
                <div className="flex flex-col items-center justify-center h-96 text-slate-500 opacity-60">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>주제를 입력하면 기획안과 표지 이미지가 생성됩니다.</p>
                </div>
             )}
             
             {result.imageUrl && (
                <div className="relative group w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    <img src={result.imageUrl} alt="Carousel Cover" className="w-full h-auto object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                            href={result.imageUrl} 
                            download="carousel_cover.png"
                            className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-xl hover:bg-orange-50 transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                            표지 다운로드
                        </a>
                    </div>
                </div>
             )}
           </div>
          </div>
      )}
    </div>
  );
};

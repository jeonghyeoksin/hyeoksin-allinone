
import React, { useState, useRef } from 'react';
import { ProductInfo, DetailImageSegment, ThumbnailOptions } from '../types';
import { planDetailPage, suggestFeatures, generateSectionImage, generateThumbnail, extractProductInfoFromUrl } from '../services/geminiService';

export const DetailPageCreator: React.FC = () => {
  const [info, setInfo] = useState<ProductInfo>({
    name: '',
    category: '',
    price: '',
    features: '',
    keyContent: '',
    mustInclude: '',
    targetAudience: [],
    pageLength: 5,
    referenceImage: null
  });

  const [productUrl, setProductUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [segments, setSegments] = useState<DetailImageSegment[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'PLAN' | 'IMAGES' | 'THUMBNAIL'>('PLAN');
  const [error, setError] = useState<string | null>(null);
  
  const [thumbOptions, setThumbOptions] = useState<ThumbnailOptions>({
      style: '깔끔한 스튜디오',
      includeModel: false,
      textPosition: '중앙'
  });
  const [thumbText, setThumbText] = useState('');
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [isThumbLoading, setIsThumbLoading] = useState(false);
  const [isWaitingForKey, setIsWaitingForKey] = useState<boolean>(false);

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

  const handleUrlAnalysis = async () => {
      if (!productUrl) return;
      setIsAnalyzing(true);
      setError(null);
      try {
          const { data } = await extractProductInfoFromUrl(productUrl);
          setInfo(prev => ({
              ...prev,
              name: data.name || prev.name,
              category: data.category || prev.category,
              mustInclude: data.mustInclude || prev.mustInclude,
              features: data.features || prev.features
          }));
      } catch (e: any) {
          setError(`URL 분석 실패: ${e.message}`);
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleSuggestFeatures = async () => {
    if (!info.name || !info.category) {
        setError("제품명과 카테고리를 먼저 입력해주세요.");
        return;
    }
    setIsSuggesting(true);
    setError(null);
    try {
        const suggestion = await suggestFeatures(info.name, info.category);
        setInfo(prev => ({ ...prev, features: suggestion }));
    } catch (e: any) {
        setError("특징 제안 중 오류가 발생했습니다.");
    } finally {
        setIsSuggesting(false);
    }
  };

  const handlePlan = async () => {
    if (!info.name || !info.category) {
        setError("제품명과 카테고리는 필수 입력 항목입니다.");
        return;
    }
    setIsPlanning(true);
    setError(null);
    setSegments([]);
    try {
        const plan = await planDetailPage(info);
        if (plan && plan.length > 0) {
            setSegments(plan);
            setActiveTab('PLAN');
        } else {
            throw new Error("기획안 생성에 실패했습니다.");
        }
    } catch (e: any) {
        setError(e.message || "기획 중 오류가 발생했습니다.");
    } finally {
        setIsPlanning(false);
    }
  };

  const handleUpdateSegment = (id: string, field: keyof DetailImageSegment, value: any) => {
      setSegments(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleGenerateImage = async (segmentId: string) => {
      const hasKey = await checkApiKey();
      if (!hasKey) return;

      const segment = segments.find(s => s.id === segmentId);
      if (!segment) return;

      setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, isLoading: true } : s));

      try {
          const imageUrl = await generateSectionImage(segment, info.referenceImage);
          setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, generatedImageUrl: imageUrl, isLoading: false } : s));
      } catch (e: any) {
          setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, isLoading: false } : s));
          alert(`이미지 생성 실패: ${e.message}`);
      }
  };

  const handleGenerateAllImages = async () => {
      const hasKey = await checkApiKey();
      if (!hasKey) return;

      for (const segment of segments) {
          if (!segment.generatedImageUrl) {
              await handleGenerateImage(segment.id);
          }
      }
  };

  const handleGenerateThumbnail = async () => {
      const hasKey = await checkApiKey();
      if (!hasKey) return;

      setIsThumbLoading(true);
      setError(null);
      try {
          const url = await generateThumbnail(info, thumbOptions, thumbText);
          setGeneratedThumbnail(url);
      } catch (e: any) {
          setError(e.message);
      } finally {
          setIsThumbLoading(false);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfo(prev => ({ ...prev, referenceImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {isWaitingForKey && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-teal-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                  <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gemini 3.0 Pro API Key Required</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      고품질 이미지 및 한글 텍스트 렌더링을 위해 <br/>
                      <b>유료 프로젝트의 API 키</b> 선택이 필요합니다.
                  </p>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20"
                  >
                      API 키 선택하기
                  </button>
                  <p className="text-[10px] text-slate-500 mt-4 underline cursor-pointer" onClick={() => setIsWaitingForKey(false)}>나중에 하기</p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-6 bg-teal-500 rounded mr-2"></span>
              상세페이지 제작 설정
            </h3>
            
            <div className="space-y-4">
              {/* URL Auto Input Section */}
              <div className="bg-slate-800/50 border border-teal-500/30 rounded-xl p-4 mb-4">
                  <label className="block text-xs font-bold text-teal-400 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      URL로 스마트 자동 입력
                  </label>
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          value={productUrl}
                          onChange={(e) => setProductUrl(e.target.value)}
                          placeholder="제품 페이지 URL을 입력하세요"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                      <button 
                          onClick={handleUrlAnalysis}
                          disabled={isAnalyzing || !productUrl}
                          className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors disabled:opacity-50"
                      >
                          {isAnalyzing ? '분석 중...' : '자동 입력'}
                      </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                      * URL을 입력하면 제품명, 특징, 소구점 등을 AI가 자동으로 추출하여 아래 내용을 채워줍니다.
                  </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">제품명 *</label>
                <input
                  type="text"
                  value={info.name}
                  onChange={e => setInfo({...info, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="예: 프리미엄 무선 청소기"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">카테고리 *</label>
                <input
                  type="text"
                  value={info.category}
                  onChange={e => setInfo({...info, category: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="예: 가전, 생활용품"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-300">섹션 개수 (최대 20개) *</label>
                    <span className="text-teal-400 font-bold bg-teal-400/10 px-2 py-0.5 rounded text-sm">{info.pageLength}개</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    step="1"
                    value={info.pageLength}
                    onChange={e => setInfo({...info, pageLength: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">꼭 들어가야 할 내용 (핵심)</label>
                <textarea
                  value={info.mustInclude}
                  onChange={e => setInfo({...info, mustInclude: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white h-20 resize-none focus:ring-2 focus:ring-teal-500 outline-none custom-scrollbar"
                  placeholder="예: 1+1 구성, 식약처 인증 번호, 오늘만 50% 할인 등"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-300">기본 제품 특징</label>
                    <button 
                        onClick={handleSuggestFeatures}
                        disabled={isSuggesting || !info.name}
                        className="text-xs text-teal-400 hover:text-teal-300 disabled:opacity-30"
                    >
                        {isSuggesting ? '분석 중...' : 'AI 특징 제안'}
                    </button>
                </div>
                <textarea
                  value={info.features}
                  onChange={e => setInfo({...info, features: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white h-24 resize-none focus:ring-2 focus:ring-teal-500 outline-none custom-scrollbar"
                  placeholder="제품의 강점을 적어주세요."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">제품 원본 사진 (학습용)</label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-600 hover:border-teal-500/50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50"
                >
                    {info.referenceImage ? (
                        <img src={info.referenceImage} alt="Ref" className="h-32 object-cover rounded shadow-lg" />
                    ) : (
                        <div className="text-center text-slate-500">
                            <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-[10px] uppercase font-bold tracking-wider">Upload Product Photo</span>
                        </div>
                    )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <button
                onClick={handlePlan}
                disabled={isPlanning || !info.name || !info.category}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
                  isPlanning || !info.name || !info.category
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-900/40'
                }`}
              >
                {isPlanning ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    기획안 구성 중...
                  </div>
                ) : '상세페이지 기획 시작'}
              </button>
              {error && <p className="text-red-400 text-xs text-center font-medium animate-pulse">{error}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Output Tabs */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-[600px] animate-fade-in">
            {/* Tabs */}
            <div className="flex border-b border-white/5 mb-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'PLAN', label: '1. 전략 기획안 (수정 가능)', icon: '📝' },
                    { id: 'IMAGES', label: '2. 프로 비주얼 (이미지 생성)', icon: '🎨' },
                    { id: 'THUMBNAIL', label: '3. 고클릭 썸네일', icon: '✨' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'text-teal-400 border-b-2 border-teal-400 bg-teal-400/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex-1 overflow-hidden p-8 relative flex flex-col">
                
                {/* PLAN TAB - Editable Version */}
                {activeTab === 'PLAN' && (
                    <div className="h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
                        {segments.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 py-20">
                                <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <p className="text-lg text-center">제품 정보를 입력하고 '기획 시작'을 누르면<br/>수정 가능한 기획안이 생성됩니다.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-teal-400 font-bold uppercase tracking-widest text-xs">Landing Page Architecture - <span className="text-slate-400">직접 수정 가능</span></h4>
                                    <span className="text-[10px] text-slate-500 px-2 py-0.5 border border-white/5 rounded-full bg-white/5">Editable Interface</span>
                                </div>
                                {segments.map((seg, idx) => (
                                    <div key={idx} className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 mr-4">
                                                <span className="text-xs font-bold text-teal-500 mb-1 block">SECTION 0{idx + 1}</span>
                                                <input 
                                                    type="text" 
                                                    value={seg.title}
                                                    onChange={e => handleUpdateSegment(seg.id, 'title', e.target.value)}
                                                    className="w-full bg-transparent text-white font-bold text-xl outline-none border-b border-transparent focus:border-teal-500/50 transition-all"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                                                {seg.logicalSections.map((l, i) => (
                                                    <span key={i} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-white/5">{l}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Image Text (Korean Rendering)</span>
                                                <span className="text-[10px] text-slate-600 font-mono">10자 이내 권장</span>
                                            </div>
                                            <textarea 
                                                value={seg.keyMessage}
                                                onChange={e => handleUpdateSegment(seg.id, 'keyMessage', e.target.value)}
                                                rows={1}
                                                className="w-full bg-transparent text-slate-100 text-lg font-medium leading-relaxed italic outline-none border-b border-transparent focus:border-teal-500/50 resize-none"
                                            />
                                        </div>
                                        <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Visual Prompt Context (English)</span>
                                            <input 
                                                type="text"
                                                value={seg.visualPrompt}
                                                onChange={e => handleUpdateSegment(seg.id, 'visualPrompt', e.target.value)}
                                                className="w-full bg-transparent text-slate-400 text-xs font-mono outline-none border-b border-transparent focus:border-teal-500/50"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center pt-8">
                                    <button 
                                        onClick={() => setActiveTab('IMAGES')}
                                        className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-teal-900/20 transition-all transform hover:-translate-y-1"
                                    >
                                        수정 완료! 이미지 생성으로 ➔
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* IMAGES TAB */}
                {activeTab === 'IMAGES' && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h4 className="text-white font-bold text-xl flex items-center gap-2">
                                    <span className="bg-teal-500 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">PRO</span>
                                    섹션별 고해상도 비주얼
                                </h4>
                                <p className="text-slate-500 text-xs mt-1">사용자가 수정한 텍스트가 반영되어 생성됩니다.</p>
                            </div>
                            <button 
                                onClick={handleGenerateAllImages}
                                disabled={segments.length === 0}
                                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50"
                            >
                                미생성 이미지 일괄 생성
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-8 pb-4 pr-2">
                            {segments.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center text-slate-600 py-20">
                                    <p>먼저 기획안을 생성하고 내용을 확인해주세요.</p>
                                </div>
                            ) : (
                                segments.map((seg, idx) => (
                                    <div key={seg.id} className="bg-slate-800/40 rounded-3xl overflow-hidden border border-white/5 flex flex-col shadow-xl group">
                                        <div className="aspect-[9/16] bg-black/40 relative">
                                            {seg.generatedImageUrl ? (
                                                <img src={seg.generatedImageUrl} alt={seg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            ) : seg.isLoading ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                                                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                    <span className="text-teal-400 text-xs font-bold animate-pulse uppercase tracking-widest text-center px-4">
                                                        Rendering Edited<br/>Hangul Typography...
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                                                    <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-30">Ready with your copy</span>
                                                </div>
                                            )}
                                            
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => handleGenerateImage(seg.id)}
                                                    className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-teal-50 shadow-xl transition-all"
                                                >
                                                    {seg.generatedImageUrl ? '다시 생성' : '이미지 생성'}
                                                </button>
                                                {seg.generatedImageUrl && (
                                                    <a 
                                                        href={seg.generatedImageUrl} 
                                                        download={`${seg.title.replace(/\s+/g, '_')}.png`}
                                                        className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-teal-500 shadow-xl transition-all"
                                                    >
                                                        고해상도 다운로드
                                                    </a>
                                                )}
                                            </div>

                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 z-10">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Section {idx+1}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-5 border-t border-white/5 bg-slate-900/40">
                                            <h6 className="text-teal-400 text-xs font-bold mb-1 uppercase tracking-tight">{seg.title}</h6>
                                            <p className="text-white text-sm font-medium line-clamp-2 leading-snug">"{seg.keyMessage}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* THUMBNAIL TAB */}
                {activeTab === 'THUMBNAIL' && (
                    <div className="h-full flex flex-col lg:flex-row gap-12">
                        {/* Settings */}
                        <div className="w-full lg:w-1/3 space-y-8 pr-4">
                            <div className="space-y-4">
                                <h4 className="text-white font-bold text-xl mb-4">Gemini 3.0 썸네일</h4>
                                <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl mb-4">
                                    <p className="text-[10px] text-teal-400 font-medium">
                                        💡 <b>제품 일관성 유지</b>: 상단에 업로드한 원본 사진과 동일한 제품을 사용하여 썸네일을 생성합니다.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Design Style</label>
                                    <select 
                                        value={thumbOptions.style}
                                        onChange={e => setThumbOptions({...thumbOptions, style: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all"
                                    >
                                        <option value="깔끔한 스튜디오">깔끔한 스튜디오 (누끼 느낌)</option>
                                        <option value="감성적인 라이프스타일">감성적인 라이프스타일</option>
                                        <option value="강렬한 대비 (주목도)">강렬한 대비 (주목도 UP)</option>
                                        <option value="3D 렌더링 스타일">3D 렌더링 스타일</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Human Presence</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center text-slate-300 cursor-pointer group">
                                            <input type="radio" checked={!thumbOptions.includeModel} onChange={() => setThumbOptions({...thumbOptions, includeModel: false})} className="mr-2 w-4 h-4 accent-teal-500" />
                                            <span className="text-sm font-medium group-hover:text-white">제품만 강조</span>
                                        </label>
                                        <label className="flex items-center text-slate-300 cursor-pointer group">
                                            <input type="radio" checked={thumbOptions.includeModel} onChange={() => setThumbOptions({...thumbOptions, includeModel: true})} className="mr-2 w-4 h-4 accent-teal-500" />
                                            <span className="text-sm font-medium group-hover:text-white">모델/손 활용</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Headline Text (Korean)</label>
                                    <input 
                                        type="text" 
                                        value={thumbText} 
                                        onChange={e => setThumbText(e.target.value)}
                                        placeholder="예: 1+1 이벤트, 역대급 할인가"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleGenerateThumbnail}
                                disabled={isThumbLoading || !info.name}
                                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform active:scale-95 ${isThumbLoading ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-teal-900/30'}`}
                            >
                                {isThumbLoading ? (
                                     <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Gemini 3.0 렌더링 중...
                                    </div>
                                ) : '고클릭 썸네일 생성하기'}
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="flex-1 bg-black/20 rounded-[2rem] flex flex-col items-center justify-center p-10 border border-white/5 relative overflow-hidden">
                            {generatedThumbnail ? (
                                <div className="relative group max-w-md w-full animate-fade-in-up">
                                    <div className="absolute -inset-4 bg-teal-500/20 blur-3xl rounded-full opacity-50"></div>
                                    <img src={generatedThumbnail} alt="Thumbnail" className="w-full aspect-square object-cover rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border border-white/10 relative z-10" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-[2rem] z-20 backdrop-blur-sm">
                                        <a href={generatedThumbnail} download="product_thumbnail.png" className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all hover:scale-105">원본 다운로드</a>
                                    </div>
                                </div>
                            ) : isThumbLoading ? (
                                <div className="flex flex-col items-center z-10">
                                    <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <p className="text-teal-400 font-bold animate-pulse text-lg tracking-tight">AI PRO DESIGN ENGINE RUNNING...</p>
                                </div>
                            ) : (
                                <div className="text-slate-600 text-center max-w-xs z-10">
                                    <svg className="w-24 h-24 mx-auto mb-6 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-sm font-medium uppercase tracking-widest opacity-40 mb-2">Design Preview Area</p>
                                    <p className="text-xs">상세페이지 이미지와 썸네일 모두 Gemini 3.0 Pro가 고품질 한국어 텍스트를 직접 렌더링합니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

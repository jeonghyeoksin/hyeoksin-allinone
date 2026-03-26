
import React, { useState, useRef } from 'react';
import { FoodBlogState, GeneratedContent } from '../types';
import { generateFoodBlogPost, searchRestaurantInfo } from '../services/geminiService';

export const FoodBlogWriter: React.FC<{ setProgress: (p: number) => void }> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<FoodBlogState>({
    restaurantName: '',
    location: '',
    menuAndTaste: '',
    atmosphere: '',
    serviceAndInfo: '',
    keywords: '',
    overallReview: ''
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isAutoFilling, setIsAutoFilling] = useState<boolean>(false);

  const handleAutoFill = async () => {
      if (!inputs.restaurantName.trim()) {
          alert("식당 이름을 먼저 입력해주세요.");
          return;
      }

      setIsAutoFilling(true);
      setStatusMessage("Google Search를 통해 식당 정보를 수집하고 있습니다...");
      setProgress(20);

      try {
          const { data } = await searchRestaurantInfo(inputs.restaurantName);
          setProgress(100);
          
          setInputs(prev => ({
              ...prev,
              location: data.location || prev.location,
              menuAndTaste: data.menuAndTaste || prev.menuAndTaste,
              atmosphere: data.atmosphere || prev.atmosphere,
              serviceAndInfo: data.serviceAndInfo || prev.serviceAndInfo,
              keywords: data.keywords || prev.keywords,
              overallReview: data.overallReview || prev.overallReview
          }));
          setStatusMessage("");
          setTimeout(() => setProgress(0), 1000);
      } catch (e: any) {
          console.error(e);
          alert("정보를 찾을 수 없습니다. 직접 입력해주세요.");
          setStatusMessage("");
          setProgress(0);
      } finally {
          setIsAutoFilling(false);
      }
  };

  const handleGenerate = async () => {
    if (!inputs.restaurantName || !inputs.menuAndTaste) return;
    
    setResult({ loading: true, text: undefined, images: undefined });
    setStatusMessage("정보 수집 완료. 사진 촬영 가이드가 포함된 SEO 최적화 맛집 리뷰를 작성하고 있습니다...");
    setProgress(10);
    
    try {
      // 1. Generate Text (Text only with photo guides)
      const text = await generateFoodBlogPost(
        inputs.restaurantName,
        inputs.location,
        inputs.menuAndTaste,
        inputs.atmosphere,
        inputs.serviceAndInfo,
        inputs.keywords,
        inputs.overallReview
      );
      
      setProgress(100);
      setResult({ loading: false, text });
      setStatusMessage("");
      setTimeout(() => setProgress(0), 1000);
      
    } catch (e: any) {
      setResult(prev => ({ ...prev, loading: false, error: e.message }));
      setStatusMessage("");
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <span className="w-2 h-6 bg-red-500 rounded mr-2"></span>
              맛집 포스팅 필수 정보
            </h3>
            <p className="text-xs text-slate-400 mb-6 bg-slate-800 p-2 rounded">
               맛집 인플루언서처럼 생생한 리뷰를 위해 아래 정보를 구체적으로 입력해주세요.
            </p>
            
            <div className="space-y-4">
              {/* Restaurant Name with Auto Fill */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  식당 이름 <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                    <input
                    type="text"
                    value={inputs.restaurantName}
                    onChange={(e) => setInputs({ ...inputs, restaurantName: e.target.value })}
                    placeholder="예: 강남역 OOO 파스타"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                    <button
                        onClick={handleAutoFill}
                        disabled={isAutoFilling || !inputs.restaurantName}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {isAutoFilling ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        )}
                        자동 정보 입력
                    </button>
                </div>
                {isAutoFilling && <p className="text-[10px] text-red-300 mt-1 animate-pulse">Deep Research 작동 중...</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  위치 및 가는 길
                </label>
                <input
                  type="text"
                  value={inputs.location}
                  onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
                  placeholder="예: 강남역 11번 출구 도보 5분, 언덕 위"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Menu & Taste */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  대표 메뉴 및 맛 평가 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={inputs.menuAndTaste}
                  onChange={(e) => setInputs({ ...inputs, menuAndTaste: e.target.value })}
                  placeholder="구체적인 맛, 식감, 추천 메뉴를 적어주세요.&#13;&#10;예: 스테이크가 육즙이 가득하고 질기지 않아요."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none custom-scrollbar"
                />
              </div>

              {/* Atmosphere */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  매장 분위기 및 인테리어
                </label>
                <input
                  type="text"
                  value={inputs.atmosphere}
                  onChange={(e) => setInputs({ ...inputs, atmosphere: e.target.value })}
                  placeholder="예: 데이트하기 좋은, 조용한, 모던한, 시끌벅적한"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

               {/* Service & Info */}
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  서비스 및 특이사항
                </label>
                <input
                  type="text"
                  value={inputs.serviceAndInfo}
                  onChange={(e) => setInputs({ ...inputs, serviceAndInfo: e.target.value })}
                  placeholder="예: 직원 친절, 웨이팅 있음, 주차 불가"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  타겟 키워드 (1~2개)
                </label>
                <input
                  type="text"
                  value={inputs.keywords}
                  onChange={(e) => setInputs({ ...inputs, keywords: e.target.value })}
                  placeholder="예: 강남역 맛집, 강남 데이트"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Review */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  총평 (한 줄 요약)
                </label>
                <input
                  type="text"
                  value={inputs.overallReview}
                  onChange={(e) => setInputs({ ...inputs, overallReview: e.target.value })}
                  placeholder="예: 재방문 의사 100%, 소개팅 장소 강추"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.restaurantName || !inputs.menuAndTaste}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-2 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/50'
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
                  '맛집 리뷰 생성하기'
                )}
              </button>
              {result.loading && <p className="text-xs text-center text-red-300 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Text Result */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">맛집 블로그 원고</h3>
            </div>

            {result.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                {result.error}
              </div>
            )}
            
            {!result.text && !result.loading && !result.error && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>식당 정보와 맛 평가를 입력하면 SEO 최적화 원고와 사진 촬영 가이드가 생성됩니다.</p>
              </div>
            )}

            {result.text && (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 bg-white rounded-lg text-slate-900 p-6 no-copy">
                 {/* Render HTML content safely */}
                 <div 
                    className="blog-content-preview"
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

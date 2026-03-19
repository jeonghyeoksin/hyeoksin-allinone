
import React, { useState, useRef } from 'react';
import { PerformanceMarketingState, GeneratedContent } from '../types';
import { analyzePerformanceMarketing } from '../services/geminiService';

export const PerformanceMarketingAnalyzer: React.FC = () => {
  const [inputs, setInputs] = useState<PerformanceMarketingState>({
    productInfo: '',
    variantA: { description: '', copy: '', image: undefined },
    variantB: { description: '', copy: '', image: undefined }
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!inputs.productInfo || !inputs.variantA.description || !inputs.variantB.description) {
        alert("제품 설명과 각 광고안의 설명을 모두 입력해주세요.");
        return;
    }
    
    setResult({ loading: true, text: undefined });
    
    try {
      const reportHtml = await analyzePerformanceMarketing(
          inputs.productInfo,
          inputs.variantA,
          inputs.variantB
      );
      setResult({ loading: false, text: reportHtml });
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
    }
  };

  const handleImageChangeA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ 
            ...prev, 
            variantA: { ...prev.variantA, image: reader.result as string } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChangeB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ 
            ...prev, 
            variantB: { ...prev.variantB, image: reader.result as string } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageA = () => {
      setInputs(prev => ({ ...prev, variantA: { ...prev.variantA, image: undefined } }));
      if (fileInputARef.current) fileInputARef.current.value = '';
  };

  const clearImageB = () => {
      setInputs(prev => ({ ...prev, variantB: { ...prev.variantB, image: undefined } }));
      if (fileInputBRef.current) fileInputBRef.current.value = '';
  };

  const copyToClipboard = async () => {
      if (!result.text) return;
      try {
        const type = "text/html";
        const blob = new Blob([result.text], { type });
        const textType = "text/plain";
        const textBlob = new Blob([result.text.replace(/<[^>]*>?/gm, '')], { type: textType });
        const data = [new ClipboardItem({ [type]: blob, [textType]: textBlob })];
        await navigator.clipboard.write(data);
        alert("분석 리포트가 복사되었습니다!");
      } catch (err) {
        await navigator.clipboard.writeText(result.text.replace(/<[^>]*>?/gm, ''));
        alert("텍스트가 복사되었습니다.");
      }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-6 bg-red-600 rounded mr-2"></span>
          퍼포먼스 마케팅 A/B 테스트 분석기
        </h3>
        <p className="text-sm text-slate-400 mb-6">
            제품 정보와 두 가지 광고 소재(A/B안)를 입력하면, 마케팅 전문가가 승자를 예측하고 최적화 전략을 제안합니다.
        </p>
        
        <div className="space-y-6">
          {/* Product Info */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              1. 제품/서비스 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={inputs.productInfo}
              onChange={(e) => setInputs({ ...inputs, productInfo: e.target.value })}
              placeholder="예: 30대 여성을 위한 기미 잡티 제거 크림. 천연 성분 사용, 2주 사용 후 효과 입증 임상 데이터 보유."
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none custom-scrollbar"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Variant A */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-lg font-bold text-red-400 mb-4">광고 A안 (Variant A)</h4>
                  
                  {/* Image Upload A */}
                  <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-400 mb-2">이미지 삽입 (선택)</label>
                      {!inputs.variantA.image ? (
                          <div 
                              onClick={() => fileInputARef.current?.click()}
                              className="border border-dashed border-slate-600 hover:border-red-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900 hover:bg-slate-800/80 group h-32"
                          >
                              <svg className="w-6 h-6 text-slate-500 group-hover:text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <p className="text-xs text-slate-400 text-center">이미지 업로드</p>
                          </div>
                      ) : (
                          <div className="relative inline-block group w-full h-32">
                              <img 
                                  src={inputs.variantA.image} 
                                  alt="Variant A" 
                                  className="h-full w-full rounded-lg border border-slate-600 object-cover"
                              />
                              <button 
                                  onClick={clearImageA}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                              >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                          </div>
                      )}
                      <input 
                          ref={fileInputARef}
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChangeA}
                          className="hidden"
                      />
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">이미지/영상 묘사</label>
                          <textarea
                              value={inputs.variantA.description}
                              onChange={(e) => setInputs({ ...inputs, variantA: { ...inputs.variantA, description: e.target.value } })}
                              placeholder="예: 사용 전후 비교 사진을 분할 화면으로 보여줌. 왼쪽은 기미가 있는 피부, 오른쪽은 깨끗해진 피부."
                              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">광고 문구 (카피)</label>
                          <textarea
                              value={inputs.variantA.copy}
                              onChange={(e) => setInputs({ ...inputs, variantA: { ...inputs.variantA, copy: e.target.value } })}
                              placeholder="예: 아직도 컨실러로 가리세요? 2주 만에 기미 순삭! 불만족 시 100% 환불 보장."
                              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                          />
                      </div>
                  </div>
              </div>

              {/* Variant B */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-lg font-bold text-blue-400 mb-4">광고 B안 (Variant B)</h4>
                  
                  {/* Image Upload B */}
                  <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-400 mb-2">이미지 삽입 (선택)</label>
                      {!inputs.variantB.image ? (
                          <div 
                              onClick={() => fileInputBRef.current?.click()}
                              className="border border-dashed border-slate-600 hover:border-blue-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900 hover:bg-slate-800/80 group h-32"
                          >
                              <svg className="w-6 h-6 text-slate-500 group-hover:text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <p className="text-xs text-slate-400 text-center">이미지 업로드</p>
                          </div>
                      ) : (
                          <div className="relative inline-block group w-full h-32">
                              <img 
                                  src={inputs.variantB.image} 
                                  alt="Variant B" 
                                  className="h-full w-full rounded-lg border border-slate-600 object-cover"
                              />
                              <button 
                                  onClick={clearImageB}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                              >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                          </div>
                      )}
                      <input 
                          ref={fileInputBRef}
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChangeB}
                          className="hidden"
                      />
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">이미지/영상 묘사</label>
                          <textarea
                              value={inputs.variantB.description}
                              onChange={(e) => setInputs({ ...inputs, variantB: { ...inputs.variantB, description: e.target.value } })}
                              placeholder="예: 피부과 의사가 제품 성분을 설명하는 영상. 신뢰감을 주는 흰 가운 착용. 자막으로 핵심 성분 강조."
                              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">광고 문구 (카피)</label>
                          <textarea
                              value={inputs.variantB.copy}
                              onChange={(e) => setInputs({ ...inputs, variantB: { ...inputs.variantB, copy: e.target.value } })}
                              placeholder="예: 피부과 시술 비용이 부담된다면? 집에서 하는 전문가급 케어. 식약처 인증 미백 기능성."
                              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          />
                      </div>
                  </div>
              </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={result.loading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
              result.loading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-red-900/50'
            }`}
          >
            {result.loading ? (
              <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>데이터 분석 및 승자 예측 중...</span>
              </div>
            ) : (
              '⚔️ 승자 예측 및 분석 시작'
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[600px] flex flex-col">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">
                {result.text ? '📊 A/B 테스트 분석 리포트' : '분석 결과 대기 중'}
            </h3>
            {result.text && (
              <button 
                onClick={copyToClipboard}
                className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white transition-colors flex items-center gap-1 shadow"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                리포트 복사
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
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p>광고 정보를 입력하면 전문가의 분석 결과가 이곳에 표시됩니다.</p>
            </div>
         )}
         
         {result.text && (
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-800/30 p-6 rounded-xl border border-white/5">
                <div 
                    className="prose prose-invert prose-red max-w-none"
                    dangerouslySetInnerHTML={{ __html: result.text }} 
                />
            </div>
         )}
      </div>
    </div>
  );
};

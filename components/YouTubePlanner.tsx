
import React, { useState, useRef } from 'react';
import { YouTubePlannerState, GeneratedContent } from '../types';
import { generateYouTubePlan } from '../services/geminiService';

export const YouTubePlanner: React.FC = () => {
  const [inputs, setInputs] = useState<YouTubePlannerState>({
    topic: '',
    target: '',
    type: 'HYBRID', // Default to both
    referenceImage: undefined,
    referenceFile: undefined
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputs.topic) return;
    
    setResult({ loading: true, text: undefined });
    
    try {
      const { text, usage } = await generateYouTubePlan(
        inputs.topic,
        inputs.target,
        inputs.type,
        inputs.referenceImage,
        inputs.referenceFile
      );
      setResult({ loading: false, text, usage });
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, referenceImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, referenceFile: {
            name: file.name,
            data: reader.result as string,
            mimeType: file.type
        }}));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setInputs(prev => ({ ...prev, referenceImage: undefined }));
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const clearReferenceFile = () => {
    setInputs(prev => ({ ...prev, referenceFile: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = async () => {
      if (!result.text) return;
      try {
        const type = "text/html";
        const blob = new Blob([result.text], { type });
        const textType = "text/plain";
        // Strip HTML tags for plain text copy
        const plainText = result.text.replace(/<[^>]*>?/gm, '');
        const textBlob = new Blob([plainText], { type: textType });
        
        const data = [new ClipboardItem({ [type]: blob, [textType]: textBlob })];
        await navigator.clipboard.write(data);
        alert("기획안이 복사되었습니다!");
      } catch (err) {
        // Fallback
        const plainText = result.text.replace(/<[^>]*>?/gm, '');
        await navigator.clipboard.writeText(plainText);
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
              <span className="w-2 h-6 bg-red-600 rounded mr-2"></span>
              유튜브 기획 설정
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  콘텐츠 주제 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                  placeholder="예: 아이폰 15 프로 1주일 사용 후기, 집에서 만드는 스타벅스 레시피"
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  타겟 시청자
                </label>
                <input
                  type="text"
                  value={inputs.target}
                  onChange={(e) => setInputs({ ...inputs, target: e.target.value })}
                  placeholder="예: 2030 IT 기기 관심 남성, 자취생"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  기획 유형
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => setInputs({...inputs, type: 'LONG'})}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${inputs.type === 'LONG' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        롱폼 (가로)
                    </button>
                    <button 
                        onClick={() => setInputs({...inputs, type: 'SHORTS'})}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${inputs.type === 'SHORTS' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        숏폼 (세로)
                    </button>
                    <button 
                        onClick={() => setInputs({...inputs, type: 'HYBRID'})}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${inputs.type === 'HYBRID' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        하이브리드
                    </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                    * 하이브리드 선택 시 롱폼과 숏폼 전략을 모두 생성합니다.
                </p>
              </div>

              {/* Attachments */}
              <div className="space-y-3 pt-2 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 gap-3">
                        {/* Reference Image */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-2">썸네일/제품 사진 <span className="text-slate-500 text-[10px]">(선택)</span></label>
                            {!inputs.referenceImage ? (
                                <div 
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border border-dashed border-slate-600 hover:border-red-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-20"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-[10px] text-slate-400 text-center">이미지 추가</p>
                                </div>
                            ) : (
                                <div className="relative inline-block group w-full h-20">
                                    <img 
                                        src={inputs.referenceImage} 
                                        alt="Ref" 
                                        className="h-full w-full rounded-lg border border-slate-600 object-cover"
                                    />
                                    <button 
                                        onClick={clearReferenceImage}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}
                            <input 
                                ref={imageInputRef}
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        {/* Reference File */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-2">대본/자료 파일 <span className="text-slate-500 text-[10px]">(선택)</span></label>
                            {!inputs.referenceFile ? (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border border-dashed border-slate-600 hover:border-red-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-20"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-[10px] text-slate-400 text-center">PDF/TXT 추가</p>
                                </div>
                            ) : (
                                <div className="relative group w-full h-20 bg-slate-800 border border-slate-600 rounded-lg flex flex-col items-center justify-center p-2">
                                    <svg className="w-6 h-6 text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-[10px] text-slate-300 truncate w-full text-center px-1">{inputs.referenceFile.name}</p>
                                    <button 
                                        onClick={clearReferenceFile}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".pdf,.txt,.csv" 
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                  </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.topic}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/50'
                }`}
              >
                {result.loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>알고리즘 분석 중...</span>
                    </div>
                  </div>
                ) : (
                  '알고리즘 최적화 기획 생성'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col relative">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    유튜브 기획안
                </h3>
                {result.text && (
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-white transition-colors flex items-center gap-1 shadow"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    텍스트만 복사
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
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <p>주제를 입력하면 클릭률과 시청 지속 시간을 고려한 기획안이 생성됩니다.</p>
                </div>
             )}
             
             {/* Report Content */}
             {result.text && (
                <div className="flex-1 bg-slate-900/30 p-2 rounded-xl">
                    <div 
                        className="prose prose-invert max-w-none text-sm leading-relaxed"
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

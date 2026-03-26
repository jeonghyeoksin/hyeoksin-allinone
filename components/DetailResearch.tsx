
import React, { useState, useRef } from 'react';
import { DetailResearchState, GeneratedContent } from '../types';
import { generateDetailResearch, generateCarouselSummary } from '../services/geminiService';

export const DetailResearch: React.FC<{ setProgress: (p: number) => void }> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<DetailResearchState>({
    topic: '',
    category: '시장 동향 (Market Trends)',
    files: []
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carousel Summary Logic Integration
  const [carouselResult, setCarouselResult] = useState<GeneratedContent>({ loading: false });
  const [slideCount, setSlideCount] = useState<number>(7);
  const [showCarouselSection, setShowCarouselSection] = useState<boolean>(false);

  const categories = [
    '시장 동향 (Market Trends)',
    '경쟁사 분석 (Competitor Analysis)',
    '콘텐츠 아이디어 (Content Ideas)',
    '타겟 페르소나 (Target Persona)',
    '상품 기획 (Product Planning)',
    '키워드 전략 (Keyword Strategy)',
    '학술/논문 (Academic)',
    '기타 (General)'
  ];

  const handleGenerate = async () => {
    if (!inputs.topic.trim()) return;
    
    setResult({ loading: true, text: undefined, sources: undefined });
    setCarouselResult({ loading: false, text: undefined }); // Reset carousel result
    setShowCarouselSection(false); // Hide carousel section initially
    setStatusMessage(`[${inputs.category}] 분야에 대해 Deep Research를 수행 중입니다... (파일 ${inputs.files.length}개 분석 포함)`);
    setProgress(10);
    
    try {
      const { text, sources, usage } = await generateDetailResearch(inputs.topic, inputs.category, inputs.files);
      setProgress(100);
      setResult({ loading: false, text, sources, usage });
      setStatusMessage("");
      setTimeout(() => setProgress(0), 1000);
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
      setStatusMessage("");
      setProgress(0);
    }
  };

  const handleGenerateCarousel = async () => {
      if (!result.text) return;
      
      setCarouselResult({ loading: true, text: undefined });
      setProgress(20);
      
      try {
          const { text, usage } = await generateCarouselSummary(result.text, slideCount);
          setProgress(100);
          setCarouselResult({ loading: false, text, usage });
          setTimeout(() => setProgress(0), 1000);
      } catch (e: any) {
          setCarouselResult({ loading: false, error: e.message });
          setProgress(0);
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    const remainingSlots = 10 - inputs.files.length;

    if (selectedFiles.length > remainingSlots) {
        alert(`첨부파일은 최대 10개까지만 가능합니다. ${remainingSlots}개만 추가됩니다.`);
    }

    const filesToProcess = selectedFiles.slice(0, remainingSlots);
    const newFilesPromises = filesToProcess.map((file: File) => {
        return new Promise<{name: string, data: string, mimeType: string}>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    name: file.name,
                    data: reader.result as string,
                    mimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        });
    });

    const newFiles = await Promise.all(newFilesPromises);
    setInputs(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    
    // Reset input to allow re-uploading same file if deleted
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
      setInputs(prev => ({
          ...prev,
          files: prev.files.filter((_, i) => i !== index)
      }));
  };

  const copyToClipboard = async (text: string) => {
      if (!text) return;
      try {
        const type = "text/html";
        const blob = new Blob([text], { type });
        const textType = "text/plain";
        const textBlob = new Blob([text.replace(/<[^>]*>?/gm, '')], { type: textType });
        const data = [new ClipboardItem({ [type]: blob, [textType]: textBlob })];
        await navigator.clipboard.write(data);
        alert("내용이 복사되었습니다.");
      } catch (err) {
        console.error("Copy failed", err);
        // Fallback
        await navigator.clipboard.writeText(text.replace(/<[^>]*>?/gm, ''));
        alert("텍스트가 복사되었습니다.");
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <span className="w-2 h-6 bg-indigo-500 rounded mr-3"></span>
          컨텐츠 디테일 리서치 (Deep Research)
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  리서치 카테고리
                </label>
                <select
                    value={inputs.category}
                    onChange={(e) => setInputs({ ...inputs, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  참고 파일 첨부 (최대 10개)
                </label>
                <div 
                    onClick={() => {
                        if (inputs.files.length < 10) fileInputRef.current?.click();
                        else alert("최대 10개까지만 업로드 가능합니다.");
                    }}
                    className={`border-2 border-dashed rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all h-[52px] ${inputs.files.length >= 10 ? 'border-slate-700 bg-slate-800/50 cursor-not-allowed opacity-50' : 'border-slate-600 hover:border-indigo-500/50 bg-slate-800/30 hover:bg-slate-800/50'}`}
                >
                    <div className="flex items-center gap-2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        <span className="text-xs font-medium">
                            {inputs.files.length >= 10 ? '업로드 제한 도달' : 'PDF, 이미지, 텍스트, MD 파일'}
                        </span>
                    </div>
                </div>
                <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple
                    accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.md"
                    onChange={handleFileChange}
                    className="hidden"
                />
              </div>
          </div>

          {/* File List */}
          {inputs.files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                  {inputs.files.map((file, idx) => (
                      <div key={idx} className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
                          <span className="text-xs text-indigo-200 truncate max-w-[150px]">{file.name}</span>
                          <button onClick={() => removeFile(idx)} className="text-indigo-400 hover:text-white transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </div>
                  ))}
                  <span className="text-xs text-slate-500 flex items-center ml-1">
                      ({inputs.files.length}/10)
                  </span>
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              리서치 주제 또는 키워드
            </label>
            <textarea
              value={inputs.topic}
              onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
              placeholder="예: 2025년 생성형 AI 시장 트렌드와 주요 기업 동향 분석해줘.&#13;&#10;예: 저탄수화물 식단이 건강에 미치는 장단점과 최신 연구 결과 요약."
              className="w-full h-40 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none custom-scrollbar text-lg"
            />
            <p className="text-xs text-slate-500 mt-2">
              * Google Search Grounding을 통해 최신 정보를 검색하고, 첨부된 파일(PDF, MD 등)과 함께 심층 리포트를 작성합니다.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={result.loading || !inputs.topic.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
              result.loading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/50'
            }`}
          >
            {result.loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Deep Research 진행 중...</span>
              </div>
            ) : (
              '심층 리서치 시작'
            )}
          </button>
          
          {result.loading && (
              <p className="text-center text-indigo-300 text-sm animate-pulse">{statusMessage}</p>
          )}
        </div>
      </div>

      {/* Output Section */}
      {(result.text || result.sources || result.error) && (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col relative">
                
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        리서치 결과 리포트
                    </h3>
                </div>

                {result.error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                        <strong>오류 발생:</strong> {result.error}
                    </div>
                )}
                
                <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                    {/* Main Content */}
                    {result.text && (
                        <div className="flex-1 bg-slate-800/30 p-6 rounded-xl border border-white/5 no-copy">
                            <div className="prose prose-invert prose-indigo max-w-none leading-relaxed">
                                <div 
                                    className="whitespace-pre-wrap font-sans text-slate-200"
                                    dangerouslySetInnerHTML={{ __html: result.text }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Sources Sidebar */}
                    {result.sources && result.sources.length > 0 && (
                        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4 bg-slate-950/30 p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                참고 문헌 / 출처
                            </h4>
                            <div className="space-y-3">
                                {result.sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-indigo-500/30 rounded-lg transition-all group"
                                    >
                                        <p className="text-xs text-slate-300 font-medium line-clamp-2 group-hover:text-white mb-1">
                                            {source.title}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate group-hover:text-indigo-400">
                                            {source.url}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Carousel Action Trigger */}
                {result.text && !showCarouselSection && (
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                        <button 
                            onClick={() => setShowCarouselSection(true)}
                            className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-500/20 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            이 내용으로 인스타그램 캐러셀 기획하기
                        </button>
                    </div>
                )}
            </div>

            {/* Carousel Section */}
            {showCarouselSection && (
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-6 bg-pink-500 rounded mr-2"></span>
                                캐러셀 컨텐츠 요약
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">위 리서치 결과를 바탕으로 인스타그램 캐러셀 슬라이드를 기획합니다.</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-300 ml-2">슬라이드: <span className="text-pink-400">{slideCount}장</span></span>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                step="1"
                                value={slideCount}
                                onChange={e => setSlideCount(parseInt(e.target.value))}
                                className="w-32 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                            <button 
                                onClick={handleGenerateCarousel}
                                disabled={carouselResult.loading}
                                className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                            >
                                {carouselResult.loading ? '생성 중...' : '기획안 생성'}
                            </button>
                        </div>
                    </div>

                    {carouselResult.error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                            <strong>오류 발생:</strong> {carouselResult.error}
                        </div>
                    )}

                    {!carouselResult.text && !carouselResult.loading && !carouselResult.error && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-60 border-2 border-dashed border-white/5 rounded-xl">
                            <p>상단 '기획안 생성' 버튼을 눌러주세요.</p>
                        </div>
                    )}

                    {carouselResult.text && (
                        <div className="relative">
                            <div className="p-2 no-copy">
                                <div dangerouslySetInnerHTML={{ __html: carouselResult.text }} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

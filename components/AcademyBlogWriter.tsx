
import React, { useState, useRef } from 'react';
import { AcademyBlogState, GeneratedContent } from '../types';
import { generateAcademyBlogPost, generateAcademyImagesBatch } from '../services/geminiService';

export const AcademyBlogWriter: React.FC = () => {
  const [inputs, setInputs] = useState<AcademyBlogState>({
    academyName: '',
    subject: '',
    keywords: '',
    target: '',
    strengths: '',
    tone: '신뢰감 있는',
    referenceImage: undefined,
    referenceTeacherImage: undefined,
    referenceFile: undefined
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const teacherImageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputs.academyName || !inputs.subject) return;
    
    setResult({ loading: true, text: undefined, images: undefined });
    setStatusMessage("학원 광고 표시법을 준수하고 시각적으로 구조화된 원고를 작성하고 있습니다...");
    
    try {
      // 1. Generate Safe Text
      // Fix: Destructure text and usage from response
      const { text, usage: textUsage } = await generateAcademyBlogPost(
        inputs.academyName,
        inputs.subject,
        inputs.keywords,
        inputs.target,
        inputs.strengths,
        inputs.tone,
        inputs.referenceImage,
        inputs.referenceTeacherImage,
        inputs.referenceFile
      );
      
      // Update state with text while images load
      setResult(prev => ({ ...prev, text, usage: textUsage, loading: true }));
      setStatusMessage("Gemini 3.0 Pro를 사용하여 학습 고민 및 솔루션 이미지를 생성 중입니다... (약 30초 소요)");

      // 2. Generate Images (5 content + 1 thumbnail) with Teacher Image logic
      const { images, usage: imageUsage } = await generateAcademyImagesBatch(
          inputs.academyName, 
          inputs.subject,
          inputs.keywords,
          inputs.referenceTeacherImage
      );
      
      const totalUsage = textUsage && imageUsage ? {
          inputTokens: textUsage.inputTokens + imageUsage.inputTokens,
          outputTokens: textUsage.outputTokens + imageUsage.outputTokens,
          imageCount: textUsage.imageCount + imageUsage.imageCount,
          videoCount: 0,
          totalCostKRW: textUsage.totalCostKRW + imageUsage.totalCostKRW
      } : textUsage || imageUsage;

      setResult({ loading: false, text, images, usage: totalUsage });
      setStatusMessage("");
      
    } catch (e: any) {
      setResult(prev => ({ ...prev, loading: false, error: e.message }));
      setStatusMessage("");
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

  const handleTeacherImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, referenceTeacherImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const clearReferenceTeacherImage = () => {
    setInputs(prev => ({ ...prev, referenceTeacherImage: undefined }));
    if (teacherImageInputRef.current) teacherImageInputRef.current.value = '';
  };

  const clearReferenceFile = () => {
    setInputs(prev => ({ ...prev, referenceFile: undefined }));
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const downloadAllImages = () => {
    if (!result.images) return;
    
    result.images.forEach((img, index) => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `academy_image_${index + 1}.png`;
        document.body.appendChild(link);
        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
        }, index * 500); 
    });
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
        alert("서식이 포함된 원고가 복사되었습니다! 블로그 에디터에 붙여넣기 하세요.");
      } catch (err) {
        // Fallback for browsers that don't support ClipboardItem or if write fails
        console.warn("Rich text copy failed, falling back to plain text", err);
        await navigator.clipboard.writeText(result.text.replace(/<[^>]*>?/gm, ''));
        alert("텍스트가 복사되었습니다. (서식 복사 실패 - 브라우저 호환성 문제)");
      }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <span className="w-2 h-6 bg-orange-500 rounded mr-2"></span>
              학원 마케팅 설정
            </h3>
            <p className="text-xs text-slate-400 mb-6 bg-slate-800 p-2 rounded">
                ⚠️ 생성된 콘텐츠는 학원법 및 표시광고법을 준수하도록 유도되나, 최종 발행 전 반드시 검토가 필요합니다.
            </p>
            
            <div className="space-y-4">
              {/* Academy Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  학원명 <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={inputs.academyName}
                  onChange={(e) => setInputs({ ...inputs, academyName: e.target.value })}
                  placeholder="예: 대치 스카이 수학학원"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  과목 / 과정 <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={inputs.subject}
                  onChange={(e) => setInputs({ ...inputs, subject: e.target.value })}
                  placeholder="예: 고등 수학, 중등 영어 내신"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  핵심 키워드 (지역+과목 추천)
                </label>
                <input
                  type="text"
                  value={inputs.keywords}
                  onChange={(e) => setInputs({ ...inputs, keywords: e.target.value })}
                  placeholder="예: 대치동 수학학원, 수능 1등급"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  타겟 대상
                </label>
                <input
                  type="text"
                  value={inputs.target}
                  onChange={(e) => setInputs({ ...inputs, target: e.target.value })}
                  placeholder="예: 상위권 도약을 원하는 고2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {/* Strengths / USP */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  학원 강점 (차별점)
                </label>
                <textarea
                  value={inputs.strengths}
                  onChange={(e) => setInputs({ ...inputs, strengths: e.target.value })}
                  placeholder="예: 소수정예 1:1 밀착관리, 오답노트 시스템"
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 pt-2 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 gap-3">
                        {/* Reference Image Upload */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-2">참고 이미지 (로고 및 브랜드) <span className="text-slate-500 text-[10px]">(선택)</span></label>
                            {!inputs.referenceImage ? (
                                <div 
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border border-dashed border-slate-600 hover:border-orange-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-20"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-[10px] text-slate-400 text-center">로고/브랜드 사진 업로드</p>
                                </div>
                            ) : (
                                <div className="relative inline-block group w-full h-20">
                                    <img 
                                        src={inputs.referenceImage} 
                                        alt="Reference" 
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

                        {/* Reference File Upload */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-2">참고 자료 (파일) <span className="text-slate-500 text-[10px]">(선택)</span></label>
                            {!inputs.referenceFile ? (
                                <div 
                                    onClick={() => docInputRef.current?.click()}
                                    className="border border-dashed border-slate-600 hover:border-blue-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-20"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-[10px] text-slate-400 text-center">PDF/TXT 업로드</p>
                                </div>
                            ) : (
                                <div className="relative group w-full h-20 bg-slate-800 border border-slate-600 rounded-lg flex flex-col items-center justify-center p-2">
                                    <svg className="w-6 h-6 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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
                                ref={docInputRef}
                                type="file" 
                                accept=".pdf,.txt,.csv" 
                                onChange={handleDocChange}
                                className="hidden"
                            />
                        </div>
                  </div>

                  {/* Teacher Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">참고 자료 (강사 사진) <span className="text-slate-500 text-[10px]">(선택 - 이미지 생성 시 반영됨)</span></label>
                    {!inputs.referenceTeacherImage ? (
                        <div 
                            onClick={() => teacherImageInputRef.current?.click()}
                            className="border border-dashed border-slate-600 hover:border-yellow-500/50 rounded-lg p-3 flex flex-row items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-14"
                        >
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <p className="text-[10px] text-slate-400">강사님 사진 업로드</p>
                        </div>
                    ) : (
                        <div className="relative inline-block group w-full h-24">
                            <img 
                                src={inputs.referenceTeacherImage} 
                                alt="Teacher Reference" 
                                className="h-full w-full rounded-lg border border-slate-600 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">강사 사진 등록됨</span>
                            </div>
                            <button 
                                onClick={clearReferenceTeacherImage}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                    <input 
                        ref={teacherImageInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleTeacherImageChange}
                        className="hidden"
                    />
                  </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">톤앤매너</label>
                <select
                  value={inputs.tone}
                  onChange={(e) => setInputs({ ...inputs, tone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                >
                  <option value="신뢰감 있는">신뢰감 있는 (전문적)</option>
                  <option value="체계적인">체계적인 (관리 중심)</option>
                  <option value="열정적인">열정적인 (동기부여)</option>
                  <option value="꼼꼼한">꼼꼼한 (밀착케어)</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.academyName || !inputs.subject}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-2 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-900/50'
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
                  '학원 블로그 포스팅 생성'
                )}
              </button>
              {result.loading && <p className="text-xs text-center text-orange-300 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Text Result */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[400px] max-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">블로그 원고 (SEO 최적화 + 서식 적용)</h3>
                {result.text && (
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded text-white transition-colors flex items-center gap-1 shadow"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    서식 포함 복사 (블로그 붙여넣기용)
                  </button>
                )}
            </div>

            {result.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                {result.error}
              </div>
            )}
            
            {!result.text && !result.loading && !result.error && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p>학원 정보와 과목을 입력하면 교육 SEO 원고와 이미지가 생성됩니다.</p>
              </div>
            )}

            {result.text && (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 bg-white rounded-lg text-slate-900 p-6">
                 {/* Render HTML content safely */}
                 <div 
                    className="blog-content-preview"
                    dangerouslySetInnerHTML={{ __html: result.text }}
                 />
              </div>
            )}
          </div>

          {/* Image Result */}
          {result.images && result.images.length > 0 && (
             <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <span className="w-2 h-6 bg-orange-500 rounded mr-2"></span>
                        생성된 이미지 (6장) - Gemini 3.0 Pro
                    </h3>
                    <button 
                        onClick={downloadAllImages}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        모두 다운로드
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {result.images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/5 bg-black/40 shadow-lg">
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white z-10">
                                {img.type}
                            </div>
                            <img src={img.url} alt={img.type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <a 
                                    href={img.url} 
                                    download={`academy_image_${idx + 1}.png`}
                                    className="bg-white text-slate-900 px-3 py-1 rounded-lg text-xs font-bold shadow-lg hover:bg-blue-50"
                                >
                                    다운로드
                                </a>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

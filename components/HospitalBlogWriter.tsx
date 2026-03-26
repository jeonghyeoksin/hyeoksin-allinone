
import React, { useState, useRef } from 'react';
import { HospitalBlogState, GeneratedContent } from '../types';
import { generateHospitalBlogPost, generateHospitalImagesBatch } from '../services/geminiService';

export const HospitalBlogWriter: React.FC<{ setProgress: (p: number) => void }> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<HospitalBlogState>({
    hospitalName: '',
    subject: '',
    keywords: '',
    target: '',
    strengths: '',
    tone: '신뢰감 있는',
    referenceImage: undefined,
    referenceDoctorImage: undefined,
    referenceFile: undefined
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const doctorImageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputs.hospitalName || !inputs.subject) return;
    
    setResult({ loading: true, text: undefined, images: undefined });
    setStatusMessage("의료광고법을 준수한 원고를 작성하고 있습니다...");
    setProgress(10);
    
    try {
      // 1. Generate Safe Text (with optional images and file)
      // Fix: Destructure text and usage from response
      const { text, usage: textUsage } = await generateHospitalBlogPost(
        inputs.hospitalName,
        inputs.subject,
        inputs.keywords,
        inputs.target,
        inputs.strengths,
        inputs.tone,
        inputs.referenceImage,
        inputs.referenceDoctorImage,
        inputs.referenceFile
      );
      
      setProgress(50);
      // Update state with text while images load
      setResult(prev => ({ ...prev, text, usage: textUsage, loading: true }));
      setStatusMessage("Gemini 3.0 Pro를 사용하여 고품질 썸네일과 이미지를 생성 중입니다... (약 30초 소요)");

      // 2. Generate Images (5 content + 1 thumbnail = 6 Total) with Doctor Image logic
      const { images, usage: imageUsage } = await generateHospitalImagesBatch(
          inputs.hospitalName, 
          inputs.subject,
          inputs.keywords,
          inputs.referenceDoctorImage
      );
      
      const totalUsage = textUsage && imageUsage ? {
          inputTokens: textUsage.inputTokens + imageUsage.inputTokens,
          outputTokens: textUsage.outputTokens + imageUsage.outputTokens,
          imageCount: textUsage.imageCount + imageUsage.imageCount,
          videoCount: 0,
          totalCostKRW: textUsage.totalCostKRW + imageUsage.totalCostKRW
      } : textUsage || imageUsage;

      setProgress(100);
      setResult({ loading: false, text, images, usage: totalUsage });
      setStatusMessage("");
      setTimeout(() => setProgress(0), 1000);
      
    } catch (e: any) {
      setResult(prev => ({ ...prev, loading: false, error: e.message }));
      setStatusMessage("");
      setProgress(0);
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

  const handleDoctorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, referenceDoctorImage: reader.result as string }));
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

  const clearReferenceDoctorImage = () => {
    setInputs(prev => ({ ...prev, referenceDoctorImage: undefined }));
    if (doctorImageInputRef.current) doctorImageInputRef.current.value = '';
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
        link.download = `hospital_image_${index + 1}.png`;
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
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <span className="w-2 h-6 bg-green-500 rounded mr-2"></span>
              병원 마케팅 설정
            </h3>
            <p className="text-xs text-slate-400 mb-6 bg-slate-800 p-2 rounded">
                ⚠️ 생성된 콘텐츠는 의료광고법 가이드라인을 반영하지만, 최종 발행 전 반드시 담당자의 검토가 필요합니다.
            </p>
            
            <div className="space-y-4">
              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  병원명 <span className="text-green-400">*</span>
                </label>
                <input
                  type="text"
                  value={inputs.hospitalName}
                  onChange={(e) => setInputs({ ...inputs, hospitalName: e.target.value })}
                  placeholder="예: 서울정형외과"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  진료 과목 / 시술명 <span className="text-green-400">*</span>
                </label>
                <input
                  type="text"
                  value={inputs.subject}
                  onChange={(e) => setInputs({ ...inputs, subject: e.target.value })}
                  placeholder="예: 허리디스크 도수치료, 임플란트"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  핵심 키워드 (지역명 포함 추천)
                </label>
                <input
                  type="text"
                  value={inputs.keywords}
                  onChange={(e) => setInputs({ ...inputs, keywords: e.target.value })}
                  placeholder="예: 강남역 도수치료, 허리통증"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  타겟 환자
                </label>
                <input
                  type="text"
                  value={inputs.target}
                  onChange={(e) => setInputs({ ...inputs, target: e.target.value })}
                  placeholder="예: 장시간 앉아서 일하는 직장인"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {/* Strengths / USP */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  병원 강점 (차별점)
                </label>
                <textarea
                  value={inputs.strengths}
                  onChange={(e) => setInputs({ ...inputs, strengths: e.target.value })}
                  placeholder="예: 대학병원 출신 전문의, 1:1 프라이빗 룸, 야간진료"
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-3 pt-2 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 gap-3">
                        {/* Reference Image Upload */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-2">참고 자료 (이미지) <span className="text-slate-500 text-[10px]">(선택)</span></label>
                            {!inputs.referenceImage ? (
                                <div 
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border border-dashed border-slate-600 hover:border-green-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-20"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-green-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-[10px] text-slate-400 text-center">사진 업로드</p>
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

                  {/* Doctor Image Upload (New) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">참고 자료 (의사 사진) <span className="text-slate-500 text-[10px]">(선택 - 이미지 생성 시 반영됨)</span></label>
                    {!inputs.referenceDoctorImage ? (
                        <div 
                            onClick={() => doctorImageInputRef.current?.click()}
                            className="border border-dashed border-slate-600 hover:border-purple-500/50 rounded-lg p-3 flex flex-row items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-14"
                        >
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <p className="text-[10px] text-slate-400">의사 선생님 사진 업로드</p>
                        </div>
                    ) : (
                        <div className="relative inline-block group w-full h-24">
                            <img 
                                src={inputs.referenceDoctorImage} 
                                alt="Doctor Reference" 
                                className="h-full w-full rounded-lg border border-slate-600 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">의사 사진 등록됨</span>
                            </div>
                            <button 
                                onClick={clearReferenceDoctorImage}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                    <input 
                        ref={doctorImageInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleDoctorImageChange}
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none"
                >
                  <option value="신뢰감 있는">신뢰감 있는 (전문적)</option>
                  <option value="친절한">친절한 (상담하듯)</option>
                  <option value="팩트 중심">팩트 중심 (간결함)</option>
                  <option value="공감하는">공감하는 (환자 입장)</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.hospitalName || !inputs.subject}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-2 ${
                  result.loading
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/50'
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
                  '병원 블로그 포스팅 생성'
                )}
              </button>
              {result.loading && <p className="text-xs text-center text-green-300 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Text Result */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">블로그 원고 (의료법 준수)</h3>
            </div>

            {result.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                {result.error}
              </div>
            )}
            
            {!result.text && !result.loading && !result.error && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p>병원 정보와 시술명을 입력하면 법률 검토된 원고와 이미지가 생성됩니다.</p>
              </div>
            )}

            {result.text && (
              <div className="prose prose-invert prose-lg max-w-none pr-2 no-copy">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {result.text}
                </div>
              </div>
            )}
          </div>

          {/* Image Result */}
          {result.images && result.images.length > 0 && (
             <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <span className="w-2 h-6 bg-green-500 rounded mr-2"></span>
                        생성된 이미지 (6장) - Gemini 3.0 Pro
                    </h3>
                    <button 
                        onClick={downloadAllImages}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        모두 다운로드
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {result.images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/5 bg-black/40">
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white z-10">
                                {img.type}
                            </div>
                            <img src={img.url} alt={img.type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <a 
                                    href={img.url} 
                                    download={`hospital_image_${idx + 1}.png`}
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

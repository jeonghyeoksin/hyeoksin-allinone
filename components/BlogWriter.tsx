
import React, { useState, useRef } from 'react';
import { BlogWriterState, GeneratedContent, TokenUsage } from '../types';
import { generateBlogPost, generateBlogImagesBatch } from '../services/geminiService';

export const BlogWriter: React.FC = () => {
  const [inputs, setInputs] = useState<BlogWriterState>({
    topic: '',
    mainKeyword: '',
    targetAudience: '',
    usp: '',
    tone: '친근한',
    brandName: '',
    referenceImage: undefined,
    referenceFile: undefined
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [statusMessage, setStatusMessage] = useState<string>("");
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputs.topic || !inputs.mainKeyword) return;
    
    setResult({ loading: true, text: undefined, images: undefined });
    setStatusMessage("최적화된 키워드로 깔끔한 블로그 원고를 작성하고 있습니다...");
    
    try {
      // 1. Generate Text (Pass all inputs including image/file)
      const { text, usage: textUsage } = await generateBlogPost(
        inputs.topic, 
        inputs.mainKeyword, 
        inputs.targetAudience, 
        inputs.usp, 
        inputs.tone, 
        inputs.brandName,
        inputs.referenceImage,
        inputs.referenceFile
      );
      
      setResult(prev => ({ ...prev, text, usage: textUsage, loading: true }));
      setStatusMessage(`'${inputs.tone}' 분위기에 맞는 4단계 스토리텔링 이미지를 생성 중입니다...`);

      // 2. Generate Images (Batch) - Pass tone to match style
      const { images, usage: imageUsage } = await generateBlogImagesBatch(inputs.topic, inputs.mainKeyword, inputs.tone);
      
      const totalUsage = {
          inputTokens: (textUsage?.inputTokens || 0) + (imageUsage?.inputTokens || 0),
          outputTokens: (textUsage?.outputTokens || 0) + (imageUsage?.outputTokens || 0),
          imageCount: (textUsage?.imageCount || 0) + (imageUsage?.imageCount || 0),
          videoCount: 0,
          totalCostKRW: (textUsage?.totalCostKRW || 0) + (imageUsage?.totalCostKRW || 0)
      };

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

  const downloadAllImages = () => {
    if (!result.images) return;
    result.images.forEach((img, index) => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `blog_image_${index + 1}.png`;
        document.body.appendChild(link);
        setTimeout(() => { link.click(); document.body.removeChild(link); }, index * 500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded mr-2"></span>
              블로그 올인원 설정
            </h3>
            
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">블로그 주제 *</label>
                <input type="text" value={inputs.topic} onChange={(e) => setInputs({ ...inputs, topic: e.target.value })} placeholder="예: 무선 청소기 추천" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>
               
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">메인 키워드 *</label>
                <input type="text" value={inputs.mainKeyword} onChange={(e) => setInputs({ ...inputs, mainKeyword: e.target.value })} placeholder="예: 무선청소기 가성비, 흡입력 좋은" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">타겟 독자</label>
                <input type="text" value={inputs.targetAudience} onChange={(e) => setInputs({ ...inputs, targetAudience: e.target.value })} placeholder="예: 자취를 처음 시작하는 사회초년생" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">브랜드/제품명</label>
                <input type="text" value={inputs.brandName} onChange={(e) => setInputs({ ...inputs, brandName: e.target.value })} placeholder="예: 다이슨 V15" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">핵심 특징(USP)</label>
                <textarea value={inputs.usp} onChange={(e) => setInputs({ ...inputs, usp: e.target.value })} placeholder="제품의 장점을 적어주세요." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white h-20 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">톤앤매너 (이미지 스타일에도 반영됨)</label>
                <select value={inputs.tone} onChange={(e) => setInputs({ ...inputs, tone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none">
                  <option value="친근한">친근한 (따뜻한/일러스트 느낌)</option>
                  <option value="전문적인">전문적인 (깔끔한/신뢰감 블루톤)</option>
                  <option value="설득적인">설득적인 (강렬한/대비감)</option>
                  <option value="유머러스한">유머러스한 (팝아트/비비드)</option>
                  <option value="감성적인">감성적인 (차분한/필름 느낌)</option>
                </select>
               </div>

               {/* Attachments Section */}
               <div className="space-y-3 pt-2 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 gap-3">
                        {/* Reference Image Upload */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-2">이미지 첨부 (선택)</label>
                            {!inputs.referenceImage ? (
                                <div 
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border border-dashed border-slate-600 hover:border-blue-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-20"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-[10px] text-slate-400 text-center">사진 추가</p>
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
                            <label className="block text-xs font-medium text-slate-300 mb-2">파일 첨부 (선택)</label>
                            {!inputs.referenceFile ? (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border border-dashed border-slate-600 hover:border-blue-500/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group h-20"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p className="text-[10px] text-slate-400 text-center">PDF/TXT 추가</p>
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
                                ref={fileInputRef}
                                type="file" 
                                accept=".pdf,.txt,.docx" 
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                  </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={result.loading || !inputs.topic || !inputs.mainKeyword}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-2 ${
                  result.loading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/50'
                }`}
              >
                {result.loading ? (
                  <div className="flex flex-col items-center">
                    <span>생성 중...</span>
                  </div>
                ) : ('블로그 올인원 생성')}
              </button>
              {result.loading && <p className="text-xs text-center text-blue-300 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Text Result */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[400px] max-h-[700px] flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">블로그 원고</h3>
                {result.text && (
                  <button onClick={() => navigator.clipboard.writeText(result.text || '')} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white transition-colors">원고 복사</button>
                )}
            </div>

            {/* Content Display */}
            {result.text ? (
              <div className="prose prose-invert prose-lg max-w-none overflow-y-auto custom-scrollbar flex-1 pr-2">
                <div className="whitespace-pre-wrap leading-relaxed text-slate-200" dangerouslySetInnerHTML={{ __html: result.text }} />
              </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <p>정보를 입력하고 생성 버튼을 누르면 정갈한 블로그 원고가 작성됩니다.</p>
                </div>
            )}
          </div>

          {/* Image Result */}
          {result.images && result.images.length > 0 && (
             <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <span className="w-2 h-6 bg-purple-500 rounded mr-2"></span>
                        생성된 비주얼 에셋 (5장)
                    </h3>
                    <button onClick={downloadAllImages} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors">모두 다운로드</button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {result.images.map((img, idx) => (
                        <div key={idx} className={`relative group rounded-xl overflow-hidden border border-white/5 bg-black/40 ${img.ratio === '1:1' ? 'border-2 border-purple-500/50' : ''}`}>
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-md z-10 font-bold border border-white/10">
                                {img.type} ({img.ratio})
                            </div>
                            <img src={img.url} alt={img.type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <a href={img.url} download={`blog_image_${idx + 1}.png`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">다운로드</a>
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

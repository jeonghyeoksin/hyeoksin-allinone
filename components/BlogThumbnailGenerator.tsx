
import React, { useState, useRef } from 'react';
import { ThumbnailState, GeneratedContent } from '../types';
import { generateBlogThumbnail } from '../services/geminiService';

interface BlogThumbnailGeneratorProps {
  setProgress: (progress: number) => void;
}

export const BlogThumbnailGenerator: React.FC<BlogThumbnailGeneratorProps> = ({ setProgress }) => {
  const [inputs, setInputs] = useState<ThumbnailState>({
    text: '',
    referenceImage: undefined
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputs.text) return;
    
    setResult({ loading: true, imageUrl: undefined });
    setProgress(20);
    try {
      const imageUrl = await generateBlogThumbnail(inputs.text, inputs.referenceImage);
      setProgress(100);
      setResult({ loading: false, imageUrl });
      setTimeout(() => setProgress(0), 1000);
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, referenceImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setInputs(prev => ({ ...prev, referenceImage: undefined }));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-6 bg-purple-500 rounded mr-2"></span>
              썸네일 텍스트 & 스타일
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        썸네일에 들어갈 텍스트 <span className="text-purple-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={inputs.text}
                        onChange={(e) => setInputs({ ...inputs, text: e.target.value })}
                        placeholder="예: 주식 투자 기초, 제주도 맛집 탐방"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg font-bold"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        * 입력한 텍스트의 분위기를 분석하여 AI가 자동으로 디자인(폰트, 컬러, 배경)을 결정합니다.
                    </p>
                </div>

                {/* Reference Image Upload Section */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">참고 스타일 이미지 (선택)</label>
                    {!inputs.referenceImage ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50 group"
                        >
                            <svg className="w-8 h-8 text-slate-500 group-hover:text-purple-400 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-sm text-slate-400 text-center">스타일을 참고할 이미지가 있다면 업로드하세요</p>
                        </div>
                    ) : (
                        <div className="relative inline-block group w-full h-32">
                            <img 
                                src={inputs.referenceImage} 
                                alt="Reference" 
                                className="h-full w-full rounded-lg border border-slate-600 shadow-lg object-cover"
                            />
                            <button 
                                onClick={clearReferenceImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={result.loading || !inputs.text}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
                    result.loading
                        ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/50'
                    }`}
                >
                    {result.loading ? (
                        <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            디자인 분석 및 생성 중...
                        </>
                    ) : (
                        '1:1 썸네일 생성하기'
                    )}
                </button>
            </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-6">
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex-1 flex flex-col items-center justify-center min-h-[400px]">
                {result.loading && (
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-purple-300 animate-pulse font-medium">Gemini 3.0 Pro가 텍스트를 렌더링하고 있습니다...</p>
                    </div>
                )}
                
                {result.error && (
                    <div className="text-red-400 text-center p-4">
                        <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {result.error}
                    </div>
                )}

                {!result.imageUrl && !result.loading && !result.error && (
                    <div className="text-slate-500 text-center opacity-60">
                        <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p>텍스트를 입력하면 AI가 최적의 썸네일을 디자인합니다.</p>
                    </div>
                )}

                {result.imageUrl && (
                    <div className="relative group w-full max-w-[400px] aspect-square rounded-lg overflow-hidden shadow-2xl border border-slate-700">
                        <img src={result.imageUrl} alt="Generated Thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <a 
                                href={result.imageUrl} 
                                download="blog_thumbnail.png"
                                className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-purple-50 transform translate-y-2 group-hover:translate-y-0 transition-all"
                            >
                                다운로드
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

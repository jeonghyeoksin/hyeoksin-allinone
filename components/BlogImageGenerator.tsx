import React, { useState } from 'react';
import { ImageGenState, GeneratedContent } from '../types';
import { generateBlogImage } from '../services/geminiService';

export const BlogImageGenerator: React.FC = () => {
  const [inputs, setInputs] = useState<ImageGenState>({
    prompt: '',
    style: '실사 같은(Photorealistic)',
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });

  const handleGenerate = async () => {
    if (!inputs.prompt) return;
    
    setResult({ loading: true, imageUrl: undefined });
    try {
      const imageUrl = await generateBlogImage(inputs.prompt, inputs.style);
      setResult({ loading: false, imageUrl });
    } catch (e: any) {
      setResult({ loading: false, error: e.message });
    }
  };

  const styles = [
    '실사 같은(Photorealistic)',
    '수채화(Watercolor)',
    '3D 렌더링(3D Rendering)',
    '미니멀 일러스트(Minimal Illustration)',
    '사이버펑크(Cyberpunk)',
    '빈티지 필름(Vintage Film)'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">이미지 설명</label>
              <input
                type="text"
                value={inputs.prompt}
                onChange={(e) => setInputs({ ...inputs, prompt: e.target.value })}
                placeholder="예: 햇살이 들어오는 모던한 화이트 톤의 거실 인테리어"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="md:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">스타일</label>
              <select
                value={inputs.style}
                onChange={(e) => setInputs({ ...inputs, style: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                {styles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
           <button
            onClick={handleGenerate}
            disabled={result.loading || !inputs.prompt}
            className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center ${
              result.loading
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/50'
            }`}
          >
            {result.loading ? '생성 중...' : '이미지 생성 (16:9)'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[400px] bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden relative group">
        {result.loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-blue-300 animate-pulse">고품질 이미지 렌더링 중...</p>
           </div>
        )}
        
        {result.error && (
          <div className="text-red-400 p-6 text-center max-w-lg">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {result.error}
          </div>
        )}

        {!result.imageUrl && !result.loading && !result.error && (
           <div className="text-slate-600 flex flex-col items-center">
             <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             <p>상단에 내용을 입력하여 이미지를 생성하세요</p>
           </div>
        )}

        {result.imageUrl && (
          <div className="relative w-full h-full flex items-center justify-center">
             <img src={result.imageUrl} alt="Generated Blog Thumbnail" className="max-w-full max-h-[600px] object-contain shadow-2xl" />
             <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={result.imageUrl} 
                  download="blog-thumbnail.png"
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-50 transition-colors"
                >
                  다운로드
                </a>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

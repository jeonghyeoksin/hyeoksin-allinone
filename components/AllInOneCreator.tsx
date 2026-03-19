
import React, { useState } from 'react';
import { AllInOneState, TokenUsage } from '../types';
import { 
  generateBlogPost, 
  generateBlogImagesBatch, 
  generateInstagramContent
} from '../services/geminiService';

export const AllInOneCreator: React.FC = () => {
  const [inputs, setInputs] = useState<AllInOneState>({
    title: '',
    keyword: '',
    targetAudience: '',
    tone: '친근한',
    coreMessage: ''
  });

  const [activeTab, setActiveTab] = useState<'BLOG' | 'INSTA'>('BLOG');
  
  const [blogResult, setBlogResult] = useState<{ text?: string; images?: any[]; usage?: TokenUsage; loading: boolean; error?: string }>({ loading: false });
  const [instaResult, setInstaResult] = useState<{ text?: string; imageUrl?: string; usage?: TokenUsage; loading: boolean; error?: string }>({ loading: false });
  
  const handleGenerateAll = async () => {
    if (!inputs.title || !inputs.keyword) return;

    const target = inputs.targetAudience || '일반 대중';
    const message = inputs.coreMessage || '정보 요약';
    const mood = inputs.tone || '친근하고 유익한';

    // 1. Blog
    setBlogResult({ loading: true });
    generateBlogPost(inputs.title, inputs.keyword, target, message, mood, '')
    .then(({ text, usage: textUsage }) => {
        setBlogResult(prev => ({ ...prev, text, usage: textUsage }));
        return generateBlogImagesBatch(inputs.title, inputs.keyword)
            .then(({ images, usage: imgUsage }) => {
                // Merge usages
                const totalUsage = {
                    inputTokens: (textUsage?.inputTokens || 0) + (imgUsage?.inputTokens || 0),
                    outputTokens: (textUsage?.outputTokens || 0) + (imgUsage?.outputTokens || 0),
                    imageCount: (textUsage?.imageCount || 0) + (imgUsage?.imageCount || 0),
                    videoCount: 0,
                    totalCostKRW: (textUsage?.totalCostKRW || 0) + (imgUsage?.totalCostKRW || 0)
                };
                setBlogResult(prev => ({ ...prev, images, usage: totalUsage, loading: false }));
            });
    }).catch(e => setBlogResult(prev => ({ ...prev, loading: false, error: e.message })));

    // 2. Insta
    setInstaResult({ loading: true });
    generateInstagramContent(inputs.title, mood, undefined)
    .then(({ imageUrl, caption, usage }) => {
        setInstaResult({ loading: false, imageUrl, text: caption, usage });
    }).catch(e => setInstaResult({ loading: false, error: e.message }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl relative">
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
                    올인원 콘텐츠 마스터
                </h3>
                <p className="text-sm text-slate-400">주제와 키워드를 입력하면 블로그 포스팅과 인스타그램 피드를 동시에 생성합니다.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">주제 (Topic) *</label>
                    <input type="text" value={inputs.title} onChange={(e) => setInputs({ ...inputs, title: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="예: 초보자도 쉽게 키우는 공기정화 식물" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">메인 키워드 *</label>
                    <input type="text" value={inputs.keyword} onChange={(e) => setInputs({ ...inputs, keyword: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="예: 반려식물, 플랜테리어" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">타겟</label>
                    <input type="text" value={inputs.targetAudience} onChange={(e) => setInputs({ ...inputs, targetAudience: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="예: 자취생, 신혼부부" />
                </div>
            </div>
            
            <button
                onClick={handleGenerateAll}
                disabled={!inputs.title || !inputs.keyword || blogResult.loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center mt-2 ${blogResult.loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'}`}
            >
                {blogResult.loading ? '생성 중...' : '원클릭 일괄 생성'}
            </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          <div className="flex border-b border-white/10">
              <button onClick={() => setActiveTab('BLOG')} className={`flex-1 py-4 font-bold text-sm ${activeTab === 'BLOG' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>
                  블로그 (SEO + 이미지)
              </button>
              <button onClick={() => setActiveTab('INSTA')} className={`flex-1 py-4 font-bold text-sm ${activeTab === 'INSTA' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-slate-500'}`}>
                  인스타 (피드 + 캡션)
              </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'BLOG' && (
                  blogResult.text ? (
                    <div className="prose prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: blogResult.text }} />
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {blogResult.images?.map((img, i) => <img key={i} src={img.url} className="rounded-lg" alt="Blog" />)}
                        </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                        <p>블로그 콘텐츠가 여기에 표시됩니다.</p>
                    </div>
                  )
              )}
              {activeTab === 'INSTA' && (
                  instaResult.imageUrl ? (
                    <div className="flex gap-8 justify-center">
                        <div className="w-[350px]">
                            <img src={instaResult.imageUrl} className="w-full rounded-xl shadow-lg border border-white/10" alt="Insta" />
                        </div>
                        <div className="flex-1 bg-slate-800 p-6 rounded-xl border border-white/5">
                            <h4 className="text-pink-400 font-bold mb-2">추천 캡션 & 해시태그</h4>
                            <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">{instaResult.text}</div>
                        </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                        <p>인스타그램 콘텐츠가 여기에 표시됩니다.</p>
                    </div>
                  )
              )}
          </div>
      </div>
    </div>
  );
};

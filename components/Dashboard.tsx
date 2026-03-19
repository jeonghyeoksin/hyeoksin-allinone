
import React from 'react';
import { AppMode } from '../types';

interface DashboardProps {
  onNavigate: (mode: AppMode) => void;
}

interface ToolConfig {
  mode: AppMode;
  title: string;
  subtitle: string;
  description: string;
  category: 'Expert' | 'Writing' | 'Design' | 'Niche';
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  glow: string;
  badge?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const tools: ToolConfig[] = [
    // Expert
    {
      mode: AppMode.PROFIT_ITEM_FINDER,
      title: '수익화 아이템 발굴',
      subtitle: 'Profit Hunter',
      description: '트렌드 분석을 통해 지금 당장 돈이 되는 블루오션 아이템 5가지를 추천합니다.',
      category: 'Expert',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]',
      badge: 'HOT'
    },
    {
      mode: AppMode.PROMPT_ARCHITECT,
      title: '맞춤 프롬프트 생성',
      subtitle: 'Prompt Architect',
      description: '단 한 줄의 요청으로 LLM 성능을 100% 활용하는 완벽한 프롬프트를 설계합니다.',
      category: 'Expert',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]'
    },
    {
      mode: AppMode.DETAIL_RESEARCH,
      title: '컨텐츠 디테일 리서치',
      subtitle: 'Deep Research',
      description: 'Google Search 기반으로 신뢰할 수 있는 심층 리서치 결과를 제공합니다.',
      category: 'Expert',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
      color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]'
    },
    {
      mode: AppMode.YOUTUBE_PLANNER,
      title: '유튜브 기획 전문가',
      subtitle: 'YouTube Strategy',
      description: '알고리즘이 선택하는 롱폼/숏폼 기획안을 생성합니다.',
      category: 'Expert',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>,
      color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]'
    },
    {
      mode: AppMode.ALL_IN_ONE_CREATOR,
      title: '올인원 콘텐츠 마스터',
      subtitle: 'One Source Multi Use',
      description: '주제 기반 블로그, 인스타 캐러셀을 한번에 생성합니다.',
      category: 'Expert',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]',
      badge: 'POPULAR'
    },
    {
      mode: AppMode.DETAIL_PAGE_CREATOR,
      title: '상세페이지 제작',
      subtitle: 'Landing Page Builder',
      description: '기획부터 섹션별 이미지 생성까지, 상세페이지를 원클릭으로 완성하세요.',
      category: 'Expert',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]'
    },
    {
      mode: AppMode.PERFORMANCE_MARKETING,
      title: '퍼포먼스 AB테스트',
      subtitle: 'A/B Testing Analysis',
      description: '광고 소재 A/B안을 비교 분석하고 승자를 예측하여 성과를 극대화합니다.',
      category: 'Expert',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(251,146,60,0.3)]'
    },
    
    // Writing
    {
      mode: AppMode.BLOG_WRITER,
      title: '블로그 올인원',
      subtitle: 'Blog Post & Images',
      description: 'SEO 원고와 5종의 인포그래픽 이미지를 한 번에 생성합니다.',
      category: 'Writing',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(96,165,250,0.3)]',
      badge: 'BEST'
    },
    {
      mode: AppMode.KEYWORD_ANALYSIS,
      title: '키워드 분석',
      subtitle: 'SEO Keyword Mining',
      description: 'SEO 전문가가 황금 키워드, 롱테일, LSI 키워드 전략을 제안합니다.',
      category: 'Writing',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(250,204,21,0.3)]'
    },
    {
      mode: AppMode.NEWSLETTER,
      title: '뉴스레터 제작',
      subtitle: 'Newsletter & Thumbnail',
      description: '구독을 부르는 후킹 제목, 유익한 본문, 트렌디한 썸네일을 제작합니다.',
      category: 'Writing',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(163,230,53,0.3)]'
    },
    {
      mode: AppMode.THREADS,
      title: '스레드 포스팅',
      subtitle: 'Threads Viral Post',
      description: '알고리즘이 사랑하는 훅과 가독성을 갖춘 스레드 글을 생성합니다.',
      category: 'Writing',
      icon: <span className="w-6 h-6 flex items-center justify-center font-bold text-xl leading-none">@</span>,
      color: 'text-white', bg: 'bg-slate-700/50', border: 'border-slate-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]'
    },

    // Design & Video
    {
      mode: AppMode.BLOG_IMAGE_STORY,
      title: '블로그 스토리 (4컷)',
      subtitle: 'Storytelling Images',
      description: '글 내용을 4단계 스토리텔링(Hook-Concept-Solution-CTA) 이미지로 변환합니다.',
      category: 'Design',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(244,114,182,0.3)]'
    },
    {
      mode: AppMode.BLOG_THUMBNAIL,
      title: '블로그 썸네일 제작',
      subtitle: '1:1 Thumbnail Design',
      description: '텍스트 하나로 분위기에 맞는 1:1 고품질 썸네일을 자동 디자인합니다.',
      category: 'Design',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(192,132,252,0.3)]'
    },
    {
      mode: AppMode.SHORT_FORM_CREATOR,
      title: '숏폼 영상 기획+생성',
      subtitle: 'Veo Video Creator',
      description: '8초 바이럴 기획안 작성 및 Veo 모델을 활용한 실제 영상 생성.',
      category: 'Design',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]',
      badge: 'NEW'
    },
    {
      mode: AppMode.INSTA_CARD_NEWS,
      title: '인스타 캐러셀 10장',
      subtitle: 'Instagram Carousel',
      description: '주제만 입력하면 기획부터 10장의 이미지와 캡션까지 완벽하게 제작합니다.',
      category: 'Design',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(251,113,133,0.3)]'
    },
    {
      mode: AppMode.INSTAGRAM,
      title: '인스타 캐러셀 1장',
      subtitle: 'Single Feed Post',
      description: '트렌디한 인스타 감성 이미지와 캡션을 한 번에 생성합니다.',
      category: 'Design',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>,
      color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]'
    },

    // Niche
    {
      mode: AppMode.FOOD_BLOG_WRITER,
      title: '맛집 블로그 포스팅',
      subtitle: 'Food & Restaurant',
      description: '네이버 상위노출을 위한 맛집 리뷰 원고와 침샘 자극 이미지를 생성합니다.',
      category: 'Niche',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(248,113,113,0.3)]'
    },
    {
      mode: AppMode.HOSPITAL_BLOG,
      title: '병원 블로그 포스팅',
      subtitle: 'Medical Marketing',
      description: '의료광고법을 준수한 원고와 신뢰감 있는 병원 이미지를 생성합니다.',
      category: 'Niche',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(52,211,153,0.3)]'
    },
    {
      mode: AppMode.ACADEMY_BLOG,
      title: '학원 블로그 포스팅',
      subtitle: 'Education Marketing',
      description: '학부모의 신뢰를 얻는 교육 정보와 학원 홍보 콘텐츠 제작.',
      category: 'Niche',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)]'
    },
    {
      mode: AppMode.PROFESSIONAL_BLOG,
      title: '전문직 블로그 포스팅',
      subtitle: 'Professional Column',
      description: '변호사, 세무사 등 전문직을 위한 고품격 칼럼과 전환형 원고.',
      category: 'Niche',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>,
      color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]'
    }
  ];

  const renderSection = (category: ToolConfig['category'], label: string) => {
    const filteredTools = tools.filter(t => t.category === category);
    return (
      <div key={category} className="space-y-6">
        <div className="flex items-center gap-4 px-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                {label}
            </h2>
            <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <button
              key={tool.mode}
              onClick={() => onNavigate(tool.mode)}
              className={`group relative h-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/20 overflow-hidden z-20`}
            >
              {tool.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg z-10 animate-pulse">
                      {tool.badge}
                  </div>
              )}
              
              {/* Background Glow Effect on Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-1 transition-opacity duration-500 bg-gradient-to-br ${tool.color.replace('text-', 'from-').replace('-400', '-500')} to-transparent pointer-events-none`}></div>

              <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mb-6 relative z-10`}>
                {tool.icon}
              </div>
              
              <div className="space-y-1 relative z-10">
                <p className={`text-xs font-bold uppercase tracking-wider ${tool.color} opacity-80 group-hover:opacity-100 transition-opacity`}>{tool.subtitle}</p>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">{tool.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed pt-3 border-t border-slate-700/30 mt-3 group-hover:border-white/10 transition-colors line-clamp-2">{tool.description}</p>
              </div>
              
              <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10">
                  <svg className={`w-5 h-5 ${tool.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16 animate-fade-in pb-20">
      {/* Modern Hero Section - Updated Visuals */}
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[380px] flex items-center border border-white/10 group bg-slate-900/40 backdrop-blur-sm">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-slate-950/80">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-blue-900/20"></div>
            {/* Soft Radial Glows */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_60%)]"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.15),transparent_60%)]"></div>
        </div>
        
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-50"></div>

        {/* Floating Orbs & Light Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-[80px] animate-pulse duration-[10000ms]"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px]"></div>

        {/* Content */}
        <div className="relative z-10 px-10 md:px-16 w-full flex flex-col justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-blue-200 backdrop-blur-md mb-6 w-fit shadow-[0_0_15px_rgba(59,130,246,0.2)] tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Intelligence Marketing Suite v2.7
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
            혁신 올인원 AI
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
             상위 1% 마케터의 기획력과 디자이너의 감각을 탑재한 <strong className="text-white font-semibold">최신 AI</strong> 기반 올인원 솔루션입니다.
          </p>
        </div>
        
        {/* Decorative Abstract Element */}
        <div className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 hidden lg:block opacity-40 mix-blend-screen pointer-events-none">
            <div className="w-[300px] h-[300px] border border-white/10 rounded-full border-t-cyan-400/50 border-l-blue-500/30 animate-[spin_10s_linear_infinite] shadow-[0_0_50px_rgba(59,130,246,0.1)] backdrop-blur-sm"></div>
            <div className="absolute inset-12 border border-white/5 rounded-full border-b-purple-500/40 border-r-white/20 animate-[spin_15s_linear_infinite_reverse]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-20">
        {renderSection('Expert', 'Expert Workspace')}
        {renderSection('Writing', 'AI Writing Tools')}
        {renderSection('Design', 'Design & Video Factory')}
        {renderSection('Niche', 'Specialized Niche Marketing')}
      </div>

      {/* Footer Info */}
      <div className="pt-10 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500">모든 작업물은 실시간으로 AI에 의해 최적화되어 생성됩니다.</p>
      </div>
    </div>
  );
};

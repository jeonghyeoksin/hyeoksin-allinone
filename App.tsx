
import React, { useState } from 'react';
import { AppMode } from './types';
import { Layout } from './components/Layout';
import { validateApiKey } from './services/geminiService';
import { BlogWriter } from './components/BlogWriter';
import { InstagramCreator } from './components/InstagramCreator';
import { HospitalBlogWriter } from './components/HospitalBlogWriter';
import { AcademyBlogWriter } from './components/AcademyBlogWriter';
import { BlogImageStoryGenerator } from './components/BlogImageStoryGenerator';
import { BlogThumbnailGenerator } from './components/BlogThumbnailGenerator';
import { InstaCardNewsGenerator } from './components/InstaCardNewsGenerator';
import { FoodBlogWriter } from './components/FoodBlogWriter';
import { Dashboard } from './components/Dashboard';
import { ShortFormCreator } from './components/ShortFormCreator';
import { KeywordAnalyzer } from './components/KeywordAnalyzer';
import { AllInOneCreator } from './components/AllInOneCreator';
import { NewsletterCreator } from './components/NewsletterCreator';
import { ThreadsCreator } from './components/ThreadsCreator';
import { ProfessionalBlogWriter } from './components/ProfessionalBlogWriter';
import { DetailPageCreator } from './components/DetailPageCreator';
import { PerformanceMarketingAnalyzer } from './components/PerformanceMarketingAnalyzer';
import { YouTubePlanner } from './components/YouTubePlanner';
import { PromptArchitect } from './components/PromptArchitect';
import { DetailResearch } from './components/DetailResearch';
import { ProfitItemFinder } from './components/ProfitItemFinder';
import { Key, Check, X, AlertCircle, HelpCircle, ExternalLink, MessageSquare } from 'lucide-react';

const USAGE_INSTRUCTIONS: Record<AppMode, string[]> = {
  [AppMode.DASHBOARD]: [
    "원하는 마케팅 도구를 선택하여 콘텐츠 생성을 시작하세요.",
    "우측 상단의 API Key 버튼을 통해 개인 구글 API 키를 설정할 수 있습니다.",
    "모든 결과물은 AI가 생성하며, 상업적 이용 시 검토가 필요합니다."
  ],
  [AppMode.BLOG_WRITER]: [
    "주제와 키워드를 입력하면 SEO에 최적화된 블로그 원고와 이미지가 생성됩니다.",
    "참고 이미지나 파일을 첨부하여 더 정확한 결과물을 얻을 수 있습니다.",
    "결과물 텍스트는 복사가 제한되어 있습니다."
  ],
  [AppMode.INSTAGRAM]: [
    "인스타그램 캐러셀 기획안과 이미지를 생성합니다.",
    "분위기와 컨셉을 입력하여 브랜드에 맞는 콘텐츠를 제작하세요."
  ],
  [AppMode.HOSPITAL_BLOG]: [
    "의료광고법을 준수하는 병원 마케팅 원고를 작성합니다.",
    "신뢰감 있는 이미지와 함께 전문적인 칼럼을 생성합니다."
  ],
  [AppMode.ACADEMY_BLOG]: [
    "학원 홍보를 위한 교육 마케팅 콘텐츠를 제작합니다.",
    "학부모와 학생의 마음을 사로잡는 스토리텔링을 제공합니다."
  ],
  [AppMode.PROFESSIONAL_BLOG]: [
    "변호사, 세무사 등 전문직을 위한 고품격 지식 공유 콘텐츠를 생성합니다.",
    "PASC 프레임워크를 활용하여 설득력 있는 글을 작성합니다."
  ],
  [AppMode.FOOD_BLOG_WRITER]: [
    "맛집 리뷰를 위한 생생한 묘사와 이미지를 생성합니다.",
    "네이버 상위 노출을 고려한 키워드 배치를 지원합니다."
  ],
  [AppMode.BLOG_IMAGE_STORY]: [
    "블로그 본문에 들어갈 4컷 스토리텔링 이미지를 생성합니다.",
    "글의 흐름에 맞는 시각적 요소를 자동으로 설계합니다."
  ],
  [AppMode.BLOG_THUMBNAIL]: [
    "블로그의 첫인상을 결정하는 썸네일을 자동 디자인합니다.",
    "제목 텍스트와 어울리는 배경 이미지를 생성합니다."
  ],
  [AppMode.INSTA_CARD_NEWS]: [
    "주제 하나로 10장의 카드뉴스를 기획하고 제작합니다.",
    "각 슬라이드별 비주얼 프롬프트와 텍스트를 제공합니다."
  ],
  [AppMode.SHORT_FORM_CREATOR]: [
    "숏폼 영상의 기획안, 대본, 나레이션을 생성합니다.",
    "Veo 모델을 활용하여 실제 영상 소스까지 제작 가능합니다."
  ],
  [AppMode.KEYWORD_ANALYSIS]: [
    "SEO 전략 수립을 위한 키워드 경쟁도와 잠재력을 분석합니다.",
    "황금 키워드 발굴을 통해 노출 확률을 높입니다."
  ],
  [AppMode.ALL_IN_ONE_CREATOR]: [
    "하나의 주제로 블로그, 인스타, 숏폼 콘텐츠를 동시에 생성합니다.",
    "채널별 특성에 맞는 최적화된 결과물을 제공합니다."
  ],
  [AppMode.NEWSLETTER]: [
    "구독자에게 발송할 뉴스레터 본문과 썸네일을 제작합니다.",
    "클릭을 유도하는 후킹 제목과 유익한 내용을 구성합니다."
  ],
  [AppMode.THREADS]: [
    "스레드 알고리즘에 최적화된 가독성 좋은 포스팅을 작성합니다.",
    "높은 도달률을 위한 훅과 구조를 제안합니다."
  ],
  [AppMode.DETAIL_PAGE_CREATOR]: [
    "상품 상세페이지의 기획과 섹션별 이미지를 생성합니다.",
    "구매 전환율을 높이는 논리적인 구조로 설계합니다."
  ],
  [AppMode.PERFORMANCE_MARKETING]: [
    "광고 성과를 높이기 위한 A/B 테스트 소재를 분석합니다.",
    "데이터 기반으로 더 효율적인 광고안을 추천합니다."
  ],
  [AppMode.YOUTUBE_PLANNER]: [
    "유튜브 채널 성장을 위한 롱폼/숏폼 기획안을 작성합니다.",
    "시청 지속시간을 높이는 대본 구조를 제안합니다."
  ],
  [AppMode.PROMPT_ARCHITECT]: [
    "AI 모델의 성능을 극대화하는 전문적인 프롬프트를 설계합니다.",
    "복잡한 요청도 AI가 이해하기 쉬운 구조로 변환합니다."
  ],
  [AppMode.DETAIL_RESEARCH]: [
    "특정 주제에 대한 심층적인 리서치 보고서를 생성합니다.",
    "실시간 웹 검색을 통해 최신 정보를 반영합니다."
  ],
  [AppMode.PROFIT_ITEM_FINDER]: [
    "현재 시장에서 수익성이 높은 아이템과 트렌드를 발굴합니다.",
    "데이터 기반의 비즈니스 기회를 제안합니다."
  ]
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      localStorage.removeItem('GEMINI_API_KEY');
      setIsKeyValid(null);
      return;
    }
    setIsValidating(true);
    const valid = await validateApiKey(apiKey);
    setIsKeyValid(valid);
    setIsValidating(false);
    if (valid) {
      localStorage.setItem('GEMINI_API_KEY', apiKey);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.DASHBOARD:
        return <Dashboard onNavigate={setMode} />;
      case AppMode.PROFIT_ITEM_FINDER:
        return <ProfitItemFinder setProgress={setProgress} />;
      case AppMode.PROMPT_ARCHITECT:
        return <PromptArchitect setProgress={setProgress} />;
      case AppMode.DETAIL_RESEARCH:
        return <DetailResearch setProgress={setProgress} />;
      case AppMode.ALL_IN_ONE_CREATOR:
        return <AllInOneCreator setProgress={setProgress} />;
      case AppMode.DETAIL_PAGE_CREATOR:
        return <DetailPageCreator setProgress={setProgress} />;
      case AppMode.PERFORMANCE_MARKETING:
        return <PerformanceMarketingAnalyzer setProgress={setProgress} />;
      case AppMode.YOUTUBE_PLANNER:
        return <YouTubePlanner setProgress={setProgress} />;
      case AppMode.BLOG_WRITER:
        return <BlogWriter setProgress={setProgress} />;
      case AppMode.INSTAGRAM:
        return <InstagramCreator setProgress={setProgress} />;
      case AppMode.HOSPITAL_BLOG:
        return <HospitalBlogWriter setProgress={setProgress} />;
      case AppMode.ACADEMY_BLOG:
        return <AcademyBlogWriter setProgress={setProgress} />;
      case AppMode.PROFESSIONAL_BLOG:
        return <ProfessionalBlogWriter setProgress={setProgress} />;
      case AppMode.BLOG_IMAGE_STORY:
        return <BlogImageStoryGenerator setProgress={setProgress} />;
      case AppMode.BLOG_THUMBNAIL:
        return <BlogThumbnailGenerator setProgress={setProgress} />;
      case AppMode.INSTA_CARD_NEWS:
        return <InstaCardNewsGenerator setProgress={setProgress} />;
      case AppMode.FOOD_BLOG_WRITER:
        return <FoodBlogWriter setProgress={setProgress} />;
      case AppMode.SHORT_FORM_CREATOR:
        return <ShortFormCreator setProgress={setProgress} />;
      case AppMode.KEYWORD_ANALYSIS:
        return <KeywordAnalyzer setProgress={setProgress} />;
      case AppMode.NEWSLETTER:
        return <NewsletterCreator setProgress={setProgress} />;
      case AppMode.THREADS:
        return <ThreadsCreator setProgress={setProgress} />;
      default:
        return <Dashboard onNavigate={setMode} />;
    }
  };

  const getPageInfo = () => {
    switch (mode) {
      case AppMode.DASHBOARD:
        return { 
          title: '대시보드', 
          subtitle: '오류 및 유지보수 문의 : 정혁신' 
        };
      case AppMode.PROFIT_ITEM_FINDER:
        return { title: '수익화 아이템 발굴', subtitle: '트렌드 분석을 통해 블루오션 아이템을 찾아드립니다.' };
      case AppMode.PROMPT_ARCHITECT:
        return { title: '맞춤 프롬프트 생성', subtitle: '단 한 줄의 요청으로 LLM 성능을 100% 활용하는 완벽한 프롬프트를 설계합니다.' };
      case AppMode.DETAIL_RESEARCH:
        return { title: '컨텐츠 디테일 리서치', subtitle: 'Google Search 기반으로 신뢰할 수 있는 심층 리서치 결과를 제공합니다.' };
      case AppMode.ALL_IN_ONE_CREATOR:
        return { title: '올인원 콘텐츠 마스터', subtitle: '킬러 타이틀 하나로 블로그, 인스타, 숏폼 영상을 동시에 생성합니다.' };
      case AppMode.DETAIL_PAGE_CREATOR:
        return { title: '상세페이지 제작', subtitle: '기획부터 섹션별 이미지 생성까지, 상세페이지를 원클릭으로 완성하세요.' };
      case AppMode.PERFORMANCE_MARKETING:
        return { title: '퍼포먼스 AB테스트', subtitle: '광고 소재 A/B안을 비교 분석하고 승자를 예측하여 성과를 극대화합니다.' };
      case AppMode.YOUTUBE_PLANNER:
        return { title: '유튜브 기획 전문가', subtitle: '알고리즘이 선택하는 롱폼/숏폼 기획안을 생성합니다.' };
      case AppMode.BLOG_WRITER:
        return { title: '블로그 올인원', subtitle: 'SEO 원고와 5종의 인포그래픽 이미지를 한 번에 생성합니다.' };
      case AppMode.INSTAGRAM:
        return { title: '인스타 캐러셀', subtitle: '단일 피드부터 10장 카드뉴스까지 인스타 콘텐츠를 완벽하게 제작합니다.' };
      case AppMode.HOSPITAL_BLOG:
        return { title: '병원 블로그 포스팅', subtitle: '의료광고법을 준수한 원고와 신뢰감 있는 병원 이미지를 생성합니다.' };
      case AppMode.ACADEMY_BLOG:
        return { title: '학원 블로그 포스팅', subtitle: '학원법 및 표시광고법을 준수한 교육 마케팅 원고와 이미지를 생성합니다.' };
      case AppMode.PROFESSIONAL_BLOG:
        return { title: '전문직 블로그 포스팅', subtitle: '변호사/세무사 등 전문직을 위한 고품격 칼럼을 생성합니다.' };
      case AppMode.BLOG_IMAGE_STORY:
        return { title: '블로그 본문 이미지(4컷)', subtitle: '글 내용을 4단계 스토리텔링(Hook-Concept-Solution-CTA) 이미지로 변환합니다.' };
      case AppMode.BLOG_THUMBNAIL:
        return { title: '블로그 썸네일 제작', subtitle: '텍스트 하나로 분위기에 맞는 1:1 고품질 썸네일을 자동 디자인합니다.' };
      case AppMode.INSTA_CARD_NEWS:
        return { title: '인스타 캐러셀 10장', subtitle: '주제만 입력하면 기획부터 10장의 이미지와 캡션까지 완벽하게 제작합니다.' };
      case AppMode.FOOD_BLOG_WRITER:
        return { title: '맛집 블로그 포스팅', subtitle: '네이버 상위노출을 위한 맛집 리뷰 원고와 침샘 자극 이미지를 생성합니다.' };
      case AppMode.SHORT_FORM_CREATOR:
        return { title: '숏폼 영상 기획 + 생성', subtitle: '8초 바이럴 기획안 작성 및 Veo 모델을 활용한 실제 영상 생성.' };
      case AppMode.KEYWORD_ANALYSIS:
        return { title: '키워드 분석', subtitle: 'SEO 전문가가 황금 키워드, 롱테일, LSI 키워드 전략을 제안합니다.' };
      case AppMode.NEWSLETTER:
        return { title: '뉴스레터 제작', subtitle: '구독을 부르는 후킹 제목, 유익한 본문, 트렌디한 썸네일을 제작합니다.' };
      case AppMode.THREADS:
        return { title: '스레드(Threads) 포스팅', subtitle: '알고리즘이 사랑하는 훅과 가독성을 갖춘 스레드 글을 생성합니다.' };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const NavButton = ({ targetMode, label, icon }: { targetMode: AppMode; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        mode === targetMode
          ? 'bg-blue-600/20 text-blue-400'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {mode === targetMode && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
      )}
      <div className={`${mode === targetMode ? 'text-blue-400' : 'text-slate-500 group-hover:text-white transition-colors'}`}>
        {icon}
      </div>
      <span className="font-medium text-left z-10">{label}</span>
    </button>
  );

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-white overflow-hidden selection:bg-blue-500/30">
      <aside className="w-72 bg-slate-900/80 backdrop-blur-md border-r border-white/5 flex flex-col shrink-0 z-20 shadow-2xl">
        <div className="p-8 pb-6">
          <div className="flex items-center space-x-3 mb-2 cursor-pointer group" onClick={() => setMode(AppMode.DASHBOARD)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight tracking-tight text-white group-hover:text-blue-400 transition-colors">혁신 올인원 AI</h2>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest opacity-80">MARKETING AGENT</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          
          <NavButton 
            targetMode={AppMode.DASHBOARD} 
            label="대시보드" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
          />

          <div className="px-4 py-2 mt-6 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expert Workspace</span>
          </div>
          
          <NavButton 
            targetMode={AppMode.PROFIT_ITEM_FINDER} 
            label="수익화 아이템 발굴" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.PROMPT_ARCHITECT} 
            label="맞춤 프롬프트 생성" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.DETAIL_RESEARCH} 
            label="컨텐츠 디테일 리서치" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.YOUTUBE_PLANNER} 
            label="유튜브 기획 전문가" 
            icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>}
          />

          <NavButton 
            targetMode={AppMode.ALL_IN_ONE_CREATOR} 
            label="올인원 콘텐츠 마스터" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.DETAIL_PAGE_CREATOR} 
            label="상세페이지 제작" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.PERFORMANCE_MARKETING} 
            label="퍼포먼스 AB테스트" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />

          <div className="px-4 py-2 mt-6 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Writing Tools</span>
          </div>

          <NavButton 
            targetMode={AppMode.BLOG_WRITER} 
            label="블로그 올인원" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          />
          
          <NavButton 
            targetMode={AppMode.KEYWORD_ANALYSIS} 
            label="키워드 분석" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.NEWSLETTER} 
            label="뉴스레터 제작" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.THREADS} 
            label="스레드 포스팅" 
            icon={<span className="w-5 h-5 flex items-center justify-center font-bold text-lg leading-none">@</span>}
          />

          <div className="px-4 py-2 mt-6 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Design & Video</span>
          </div>

          <NavButton 
            targetMode={AppMode.BLOG_IMAGE_STORY} 
            label="블로그 스토리 (4컷)" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.BLOG_THUMBNAIL} 
            label="블로그 썸네일 제작" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.SHORT_FORM_CREATOR} 
            label="숏폼 영상 기획+생성" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.INSTAGRAM} 
            label="인스타 캐러셀" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
          />

          <div className="px-4 py-2 mt-6 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialized Niche</span>
          </div>

          <NavButton 
            targetMode={AppMode.FOOD_BLOG_WRITER} 
            label="맛집 블로그 포스팅" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.HOSPITAL_BLOG} 
            label="병원 블로그 포스팅" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.ACADEMY_BLOG} 
            label="학원 블로그 포스팅" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          />

          <NavButton 
            targetMode={AppMode.PROFESSIONAL_BLOG} 
            label="전문직 블로그 포스팅" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>}
          />
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-900/50">
           <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium">v2.7.0</p>
              <p className="text-[10px] text-slate-600">Prompt Architect Engine v1.0</p>
           </div>
        </div>
      </aside>

      <Layout title={title} subtitle={subtitle}>
        {/* Global Progress Bar */}
        {progress > 0 && progress < 100 && (
          <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-900">
            <div 
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute top-2 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              {progress}% 완료
            </div>
          </div>
        )}

        {renderContent()}
      </Layout>

      {/* Top Right Controls */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
        {/* Usage Instructions Button */}
        <button
          onClick={() => setIsUsageModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
        >
          <HelpCircle className="w-4 h-4" />
          사용방법
        </button>

        {/* API Key Button */}
        <button
          onClick={() => setIsApiKeyModalOpen(!isApiKeyModalOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-xl transition-all backdrop-blur-md border border-white/10 ${
            isKeyValid === true ? 'bg-green-600/20 text-green-400 border-green-500/30' : 
            isKeyValid === false ? 'bg-red-600/20 text-red-400 border-red-500/30' : 
            'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isKeyValid === true ? (
            <Check className="w-4 h-4" />
          ) : isKeyValid === false ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Key className="w-4 h-4" />
          )}
          {isKeyValid === true ? 'API 활성' : isKeyValid === false ? 'API 오류' : 'API 설정'}
        </button>
      </div>

      {/* Bottom Right Controls */}
      <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end gap-3">
        <a
          href="https://hyeoksinai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-1"
        >
          <ExternalLink className="w-4 h-4" />
          혁신AI 플랫폼 바로가기
        </a>
        <button
          onClick={() => alert('오류 및 유지보수 문의: info@nextin.ai.kr')}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/5 shadow-lg transition-all transform hover:-translate-y-1"
        >
          <MessageSquare className="w-4 h-4" />
          오류/유지보수 문의
        </button>
      </div>

      {/* Usage Instructions Modal */}
      {isUsageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-400" />
                사용방법 가이드
              </h3>
              <button onClick={() => setIsUsageModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <p className="text-sm font-bold text-blue-400 mb-1">현재 도구: {getPageInfo().title}</p>
                <p className="text-xs text-slate-400">{getPageInfo().subtitle}</p>
              </div>
              <ul className="space-y-3">
                {(USAGE_INSTRUCTIONS[mode] || []).map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-blue-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setIsUsageModalOpen(false)}
              className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-blue-400" />
                API Key 설정
              </h3>
              <button onClick={() => setIsApiKeyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Gemini API Key를 입력하세요. 입력하신 키는 브라우저에 안전하게 저장되며 콘텐츠 생성에 사용됩니다.
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Google Gemini API Key"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {isKeyValid === false && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  유효하지 않은 API 키입니다. 다시 확인해주세요.
                </div>
              )}
              {isKeyValid === true && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  API 키가 성공적으로 인증되었습니다.
                </div>
              )}
              <button
                onClick={handleSaveApiKey}
                disabled={isValidating}
                className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isValidating ? 'bg-blue-600/50 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isValidating ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'API 키 적용하기'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;

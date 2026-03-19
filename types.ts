
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  BLOG_WRITER = 'BLOG_WRITER',
  INSTAGRAM = 'INSTAGRAM',
  HOSPITAL_BLOG = 'HOSPITAL_BLOG',
  ACADEMY_BLOG = 'ACADEMY_BLOG',
  PROFESSIONAL_BLOG = 'PROFESSIONAL_BLOG',
  FOOD_BLOG_WRITER = 'FOOD_BLOG_WRITER',
  BLOG_IMAGE_STORY = 'BLOG_IMAGE_STORY',
  BLOG_THUMBNAIL = 'BLOG_THUMBNAIL',
  INSTA_CARD_NEWS = 'INSTA_CARD_NEWS',
  SHORT_FORM_CREATOR = 'SHORT_FORM_CREATOR',
  KEYWORD_ANALYSIS = 'KEYWORD_ANALYSIS',
  ALL_IN_ONE_CREATOR = 'ALL_IN_ONE_CREATOR',
  NEWSLETTER = 'NEWSLETTER',
  THREADS = 'THREADS',
  DETAIL_PAGE_CREATOR = 'DETAIL_PAGE_CREATOR',
  PERFORMANCE_MARKETING = 'PERFORMANCE_MARKETING',
  YOUTUBE_PLANNER = 'YOUTUBE_PLANNER',
  PROMPT_ARCHITECT = 'PROMPT_ARCHITECT',
  DETAIL_RESEARCH = 'DETAIL_RESEARCH',
  PROFIT_ITEM_FINDER = 'PROFIT_ITEM_FINDER'
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  imageCount: number;
  videoCount: number;
  totalCostKRW: number;
  details?: string;
}

export interface CarouselSlide {
  slideNumber: number;
  title: string;
  content: string; // Caption content for internal logic
  imageText: string; // Text to be rendered on image
  visualPrompt: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export interface GeneratedContent {
  text?: string;
  caption?: string; // Added for Insta Caption
  imageUrl?: string; 
  images?: { url: string; ratio: string; type: string }[];
  slides?: CarouselSlide[]; 
  videoUrl?: string;
  audioUrl?: string; 
  usage?: TokenUsage; 
  plan?: string; 
  prompt?: string; 
  loading: boolean;
  error?: string;
  sources?: { title: string; url: string }[]; 
}

export interface BlogWriterState {
  topic: string;
  mainKeyword: string;
  targetAudience: string;
  usp: string;
  tone: string;
  brandName: string;
  referenceImage?: string;
  referenceFile?: { name: string; data: string; mimeType: string };
}

export interface ImageGenState {
  prompt: string;
  style: string;
}

export interface InstaState {
  concept: string;
  mood: string;
  referenceImage?: string;
}

export interface HospitalBlogState {
  hospitalName: string;
  subject: string;
  keywords: string;
  target: string;
  strengths: string;
  tone: string;
  referenceImage?: string;
  referenceDoctorImage?: string;
  referenceFile?: { name: string; data: string; mimeType: string };
}

export interface AcademyBlogState {
  academyName: string;
  subject: string;
  keywords: string;
  target: string;
  strengths: string;
  tone: string;
  referenceImage?: string;
  referenceTeacherImage?: string;
  referenceFile?: { name: string; data: string; mimeType: string };
}

export interface ThumbnailState {
  text: string;
  referenceImage?: string;
}

export interface CardNewsState {
  topic: string;
  style: string;
}

export interface FoodBlogState {
  restaurantName: string;
  location: string;
  menuAndTaste: string;
  atmosphere: string;
  serviceAndInfo: string;
  keywords: string;
  overallReview: string;
}

export interface ShortFormState {
  topic: string;
}

export interface KeywordAnalysisState {
  topic: string;
}

export interface AllInOneState {
  title: string;
  keyword: string;
  targetAudience: string;
  tone: string;
  coreMessage: string;
}

export interface NewsletterState {
  topic: string;
}

export interface ThreadsState {
  topic: string;
  target: string;
  tone: string;
  goal: string;
}

export interface ProfessionalBlogState {
  job: string;
  target: string;
  topic: string;
  usp: string;
  tone: string;
}

export interface PromptArchitectState {
  userRequest: string;
}

export interface YouTubePlannerState {
  topic: string;
  target: string;
  type: 'LONG' | 'SHORTS' | 'HYBRID';
  referenceImage?: string;
  referenceFile?: { name: string; data: string; mimeType: string };
}

export interface DetailResearchState {
  topic: string;
  category: string;
  files: { name: string; data: string; mimeType: string }[];
}

export interface CarouselSummaryState {
  content: string;
  slideCount: number;
}

export interface ProfitItemState {
  category: string;
}

export type PageLength = number;

export interface ProductInfo {
  name: string;
  category: string;
  price: string;
  features: string;
  keyContent: string;
  mustInclude: string; // New field added
  targetAudience: string[];
  pageLength: PageLength;
  referenceImage: string | null; 
}

export interface DetailImageSegment {
  id: string;
  title: string;
  logicalSections: string[];
  keyMessage: string;
  visualPrompt: string;
  generatedImageUrl?: string; 
  isLoading?: boolean;
}

export interface ThumbnailOptions {
  style: string;
  includeModel: boolean;
  textPosition: string;
}

export interface PerformanceMarketingState {
  productInfo: string;
  variantA: {
    description: string;
    copy: string;
    image?: string; 
  };
  variantB: {
    description: string;
    copy: string;
    image?: string; 
  };
}

import { GoogleGenAI, Type, Schema, Part, Modality } from "@google/genai";
import { DetailImageSegment, ProductInfo, ThumbnailOptions, PerformanceMarketingState, TokenUsage, CarouselSlide } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null;
    const apiKey = savedKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('API_KEY_MISSING');
    }
    
    if (!aiInstance || (aiInstance as any).apiKey !== apiKey) {
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

export const validateApiKey = async (key: string): Promise<boolean> => {
    try {
        const tempAi = new GoogleGenAI({ apiKey: key });
        // Simple test call to validate key
        await tempAi.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: 'hi',
            config: { maxOutputTokens: 1 }
        });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

const TEXT_MODEL = 'gemini-3-pro-preview';
const PRO_TEXT_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';
const PRO_IMAGE_MODEL = 'gemini-3-pro-image-preview';
const VEO_MODEL = 'veo-3.1-fast-generate-preview';
const AUDIO_MODEL = 'gemini-2.5-flash-preview-tts';

// Update all calls to use getAI() instead of ai
// ... (I will need to replace all instances of 'ai.' with 'getAI().' in the next step or multi_edit)


// Helpers
const getUsage = (response: any): TokenUsage => {
    return {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
        imageCount: 0,
        videoCount: 0,
        totalCostKRW: 0 
    };
};

const fileToPart = (file?: { data: string; mimeType: string }): Part | undefined => {
    if (!file) return undefined;
    const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    return { inlineData: { mimeType: file.mimeType, data: base64Data } };
};

const imageToPart = (dataUrl?: string): Part | undefined => {
    if (!dataUrl) return undefined;
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return undefined;
    return { inlineData: { mimeType: matches[1], data: matches[2] } };
};

const extractBase64Image = (response: any): string | undefined => {
    const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    return part?.inlineData ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : undefined;
};

// 1. Insta Card News (Deep Research + Planning)
export const planInstaCardNews = async (topic: string, style: string, slideCount: number): Promise<{ slides: CarouselSlide[], caption: string, usage: TokenUsage }> => {
    const prompt = `
    Role: Instagram Strategy Expert.
    Task: Conduct Deep Research on the topic "${topic}" using Google Search to find latest trends, facts, and engaging angles.
    Goal: Create a ${slideCount}-slide Instagram Carousel plan AND a highly engaging caption.
    Style: ${style}
    
    Output JSON Format:
    {
      "caption": "Write an algorithm-optimized Instagram caption here. Include a strong hook, value proposition, and 15-20 relevant hashtags. Use emojis appropriately.",
      "slides": [
        {
          "slideNumber": 1,
          "title": "Hook Title",
          "content": "Brief description of slide content",
          "imageText": "Text to appear ON the image (Short & Punchy)",
          "visualPrompt": "Detailed visual description for AI image generator. Include style: ${style}"
        },
        ... (repeat for ${slideCount} slides)
      ]
    }
    
    Ensure the first slide is a strong hook. The last slide should be a Call to Action (CTA).
    Return ONLY the JSON object.
    `;

    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL, // Use Pro for deep research
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }], // Enable Deep Research
            responseMimeType: "application/json"
        }
    });

    const parsed = JSON.parse(res.text || "{}");
    return { 
        slides: parsed.slides || [], 
        caption: parsed.caption || "",
        usage: getUsage(res) 
    };
};

export const generateCarouselImage = async (slide: CarouselSlide, style: string): Promise<string | undefined> => {
    // Determine model: Pro for cover (Slide 1) to render text, Flash for others for speed (or Pro if needed)
    // For this advanced requirement, we try Pro first for text rendering on cover, and maybe Flash for others if no text is needed.
    // However, user requested "Deep Research" quality. Let's try Pro for Slide 1, and Flash for others to save time, 
    // unless the visual prompt explicitly asks for text.
    
    const isCover = slide.slideNumber === 1;
    const model = isCover ? PRO_IMAGE_MODEL : IMAGE_MODEL; 
    
    let imagePrompt = `Instagram Image. ${slide.visualPrompt}. Style: ${style}. Aspect Ratio 4:5.`;
    if (slide.imageText) {
        imagePrompt += ` IMPORTANT: Render the following Korean text clearly and accurately: "${slide.imageText}". Use bold, high-contrast typography. Ensure no characters are broken or corrupted. The text must be in Korean (Hangul).`;
    }

    try {
        const res = await getAI().models.generateContent({
            model: model,
            contents: imagePrompt,
            config: { 
                imageConfig: { 
                    aspectRatio: "4:5",
                    imageSize: isCover ? "1K" : undefined // Only Pro supports imageSize
                } 
            }
        });
        return extractBase64Image(res);
    } catch (e) {
        console.warn(`Image generation failed for slide ${slide.slideNumber}, retrying with fallback...`);
        // Fallback to Flash if Pro fails
        try {
            const fallbackRes = await getAI().models.generateContent({
                model: IMAGE_MODEL,
                contents: imagePrompt,
                config: { imageConfig: { aspectRatio: "4:5" } }
            });
            return extractBase64Image(fallbackRes);
        } catch (e2) {
            console.error("Fallback failed", e2);
            return undefined;
        }
    }
};

export const generateInstaCardNews = async (topic: string, style: string, count: number) => {
    // Legacy function support if needed, but primary flow uses planInstaCardNews + generateCarouselImage
    const { slides, caption, usage } = await planInstaCardNews(topic, style, count);
    // Generate cover only for legacy single call behavior
    const coverUrl = await generateCarouselImage(slides[0], style);
    return {
        text: caption,
        imageUrl: coverUrl,
        usage
    };
};

// 2. Blog Writer
export const generateBlogPost = async (topic: string, keyword: string, target: string, usp: string, tone: string, brand: string, refImg?: string, refFile?: any) => {
    const parts: Part[] = [{ text: `Write a SEO-optimized blog post in Korean. Topic: ${topic}, Keyword: ${keyword}, Target: ${target}, USP: ${usp}, Tone: ${tone}, Brand: ${brand}. Format with HTML (h2, h3, p, ul).` }];
    if (refImg) { const p = imageToPart(refImg); if(p) parts.push(p); }
    if (refFile) { const p = fileToPart(refFile); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({ model: PRO_TEXT_MODEL, contents: { parts } });
    return { text: res.text, usage: getUsage(res) };
};

export const generateBlogImagesBatch = async (topic: string, keyword: string, tone?: string) => {
    // Generating 1 representative image for demonstration as batch generation of different images needs multiple calls or complex prompting
    const prompt = `Blog post illustration. Topic: ${topic}, Keyword: ${keyword}, Tone: ${tone || 'Friendly'}. High quality, 16:9. IMPORTANT: If any text appears in the image, it must be rendered clearly and accurately in Korean (Hangul). Use bold, high-contrast typography. Ensure no characters are broken or corrupted.`;
    const res = await getAI().models.generateContent({ 
        model: IMAGE_MODEL, 
        contents: prompt,
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    const url = extractBase64Image(res);
    // Returning array to simulate batch
    return { images: url ? [{ url, ratio: '16:9', type: 'Representative' }] : [], usage: getUsage(res) };
};

// 3. Blog Image Generator
export const generateBlogImage = async (prompt: string, style: string) => {
    const fullPrompt = `${prompt}. Style: ${style}. IMPORTANT: If any text appears in the image, it must be rendered clearly and accurately in Korean (Hangul). Use bold, high-contrast typography. Ensure no characters are broken or corrupted.`;
    const res = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: fullPrompt,
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    return extractBase64Image(res);
};

// 4. Instagram Creator (Single)
export const generateInstagramContent = async (concept: string, mood: string, refImg?: string) => {
    const parts: Part[] = [{ text: `Create an Instagram post caption in Korean. Concept: ${concept}, Mood: ${mood}. Include hashtags.` }];
    if (refImg) { const p = imageToPart(refImg); if(p) parts.push(p); }
    
    const textRes = await getAI().models.generateContent({ model: PRO_TEXT_MODEL, contents: { parts } });
    
    const imgRes = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: `Instagram photo. Concept: ${concept}, Mood: ${mood}. High quality, 4:5 ratio. IMPORTANT: If any text appears in the image, it must be rendered clearly and accurately in Korean (Hangul). Use bold, high-contrast typography. Ensure no characters are broken or corrupted.`,
        config: { imageConfig: { aspectRatio: "4:5", imageSize: "1K" } }
    });

    return {
        caption: textRes.text,
        imageUrl: extractBase64Image(imgRes),
        usage: getUsage(textRes) // Combined usage ideally
    };
};

// 5. Hospital Blog
export const generateHospitalBlogPost = async (name: string, subject: string, keywords: string, target: string, strengths: string, tone: string, refImg?: string, refDoc?: string, refFile?: any) => {
    const parts: Part[] = [{ text: `Write a hospital blog post complying with Korean medical advertising laws. Name: ${name}, Subject: ${subject}, Keywords: ${keywords}, Target: ${target}, Strengths: ${strengths}, Tone: ${tone}. HTML format.` }];
    if (refImg) { const p = imageToPart(refImg); if(p) parts.push(p); }
    if (refDoc) { const p = imageToPart(refDoc); if(p) parts.push(p); }
    if (refFile) { const p = fileToPart(refFile); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({ model: PRO_TEXT_MODEL, contents: { parts } });
    return { text: res.text, usage: getUsage(res) };
};

export const generateHospitalImagesBatch = async (name: string, subject: string, keywords: string, refDoc?: string) => {
    const prompt = `Professional hospital image. Subject: ${subject}, Atmosphere: Trustworthy. 16:9. IMPORTANT: If any text appears in the image, it must be rendered clearly and accurately in Korean (Hangul). Use bold, high-contrast typography. Ensure no characters are broken or corrupted.`;
    const parts: Part[] = [{ text: prompt }];
    if (refDoc) { const p = imageToPart(refDoc); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: { parts },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    const url = extractBase64Image(res);
    return { images: url ? [{ url, ratio: '16:9', type: 'Main' }] : [], usage: getUsage(res) };
};

// 6. Academy Blog
export const generateAcademyBlogPost = async (name: string, subject: string, keywords: string, target: string, strengths: string, tone: string, refImg?: string, refTeacher?: string, refFile?: any) => {
    const parts: Part[] = [{ text: `Write an academy promotion blog post. Name: ${name}, Subject: ${subject}, Keywords: ${keywords}, Target: ${target}, Tone: ${tone}. HTML format.` }];
    if (refImg) { const p = imageToPart(refImg); if(p) parts.push(p); }
    if (refTeacher) { const p = imageToPart(refTeacher); if(p) parts.push(p); }
    if (refFile) { const p = fileToPart(refFile); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({ model: PRO_TEXT_MODEL, contents: { parts } });
    return { text: res.text, usage: getUsage(res) };
};

export const generateAcademyImagesBatch = async (name: string, subject: string, keywords: string, refTeacher?: string) => {
    const prompt = `Education academy image. Subject: ${subject}. Professional and encouraging. 16:9. IMPORTANT: If any text appears in the image, it must be rendered clearly and accurately in Korean (Hangul). Use bold, high-contrast typography. Ensure no characters are broken or corrupted.`;
    const parts: Part[] = [{ text: prompt }];
    if (refTeacher) { const p = imageToPart(refTeacher); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: { parts },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    const url = extractBase64Image(res);
    return { images: url ? [{ url, ratio: '16:9', type: 'Main' }] : [], usage: getUsage(res) };
};

// 7. Storytelling Images (4 cuts)
export const generateStorytellingImages = async (content: string) => {
    // Generate 4 distinct prompts first
    const promptRes = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Analyze this text: "${content.slice(0, 500)}...". Create 4 visual prompts for a 4-cut story (Hook, Concept, Solution, CTA). Return JSON: ["prompt1", "prompt2", "prompt3", "prompt4"].`,
        config: { responseMimeType: "application/json" }
    });
    
    let prompts: string[] = [];
    try { prompts = JSON.parse(promptRes.text || "[]"); } catch { prompts = [content]; }

    // Generate 1st image as representative (Sequential generation is slow, just doing one for demo or loop if needed)
    // For this example, we generate 1 image based on the first prompt to save time/quota in this specific function structure
    const imgRes = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: `${prompts[0] || content}. IMPORTANT: If any text appears in the image, it must be rendered clearly and accurately in Korean (Hangul). Use bold, high-contrast typography. Ensure no characters are broken or corrupted.`,
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    
    const url = extractBase64Image(imgRes);
    return url ? [{ url, ratio: '16:9', type: 'Hook' }] : [];
};

// 8. Blog Thumbnail
export const generateBlogThumbnail = async (text: string, refImg?: string) => {
    const prompt = `Blog thumbnail. High quality, 1:1 square. IMPORTANT: Render the following Korean text clearly and accurately in the center: "${text}". Use professional typography. Ensure no characters are broken or corrupted. The text must be in Korean (Hangul).`;
    const parts: Part[] = [{ text: prompt }];
    if (refImg) { const p = imageToPart(refImg); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: { parts },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
    });
    return extractBase64Image(res);
};

// 9. Food Blog
export const generateFoodBlogPost = async (name: string, location: string, menu: string, atmosphere: string, service: string, keywords: string, review: string) => {
    const prompt = `Write a delicious food blog review. Restaurant: ${name}, Location: ${location}, Menu: ${menu}, Atmosphere: ${atmosphere}, Service: ${service}, Keywords: ${keywords}, Review: ${review}. HTML format.`;
    const res = await getAI().models.generateContent({ model: PRO_TEXT_MODEL, contents: prompt });
    return res.text;
};

export const searchRestaurantInfo = async (name: string) => {
    // Using Search Grounding
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Search for restaurant "${name}" in Korea. Find location, main menu, atmosphere, service info, and overall review. Return JSON.`,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });
    const json = JSON.parse(res.text || "{}");
    return { data: json };
};

// 10. Short Form
export const generateShortFormPlan = async (topic: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Plan a short-form video about "${topic}". Provide: 1. Visual Prompt for Video AI. 2. Script in HTML. 3. Narration text for TTS. Return JSON: { visualPrompt, scriptHtml, narration }.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(res.text || "{}");
};

export const generateVeoVideo = async (prompt: string) => {
    let operation = await getAI().models.generateVideos({
        model: VEO_MODEL,
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
    });
    
    while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await getAI().operations.getVideosOperation({ operation });
    }
    
    return { videoUri: operation.response?.generatedVideos?.[0]?.video?.uri || "" };
};

export const generateVoiceover = async (text: string) => {
    const res = await getAI().models.generateContent({
        model: AUDIO_MODEL,
        contents: { parts: [{ text }] },
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
    });
    
    const base64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64) return undefined;
    
    // Create WAV blob from PCM (Simple header addition)
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + len, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    // bits per sample
    view.setUint16(34, bitsPerSample, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, len, true);

    const blob = new Blob([view, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
};

const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

// 11. Keyword Analysis
export const generateKeywordAnalysis = async (topic: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Analyze SEO keywords for "${topic}". Return JSON: { summary, keywords: [{word, competition, potential, intent}], strategies: [], suggestedTitles: [] }. Competition/Potential 0-100.`,
        config: { responseMimeType: "application/json" }
    });
    return { data: JSON.parse(res.text || "{}"), usage: getUsage(res) };
};

// 12. Newsletter
export const generateNewsletter = async (topic: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Write a newsletter about "${topic}". HTML format.`
    });
    return { text: res.text, usage: getUsage(res) };
};

export const generateNewsletterImage = async (topic: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: `Newsletter thumbnail for ${topic}. High quality, 16:9. IMPORTANT: If any text appears in the image, it must be rendered clearly and accurately in Korean (Hangul). Use bold, high-contrast typography. Ensure no characters are broken or corrupted.`,
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    return { imageUrl: extractBase64Image(res), usage: getUsage(res) };
};

// 13. Threads
export const generateThreadsPost = async (topic: string, target: string, tone: string, goal: string) => {
    const res = await getAI().models.generateContent({
        model: TEXT_MODEL,
        contents: `Write a Threads post. Topic: ${topic}, Target: ${target}, Tone: ${tone}, Goal: ${goal}. HTML format.`
    });
    return res.text;
};

// 14. Professional Blog
export const generateProfessionalBlogPost = async (job: string, target: string, topic: string, usp: string, tone: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Write a professional blog post (PASC framework). Job: ${job}, Target: ${target}, Topic: ${topic}, USP: ${usp}, Tone: ${tone}. HTML format.`
    });
    return { text: res.text, usage: getUsage(res) };
};

// 15. Detail Page
export const planDetailPage = async (info: ProductInfo) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Plan a product detail page for "${info.name}". Return JSON array of sections: [{id, title, logicalSections, keyMessage, visualPrompt}].`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(res.text || "[]");
};

export const suggestFeatures = async (name: string, category: string) => {
    const res = await getAI().models.generateContent({
        model: TEXT_MODEL,
        contents: `Suggest 3 key features for ${name} (${category}).`
    });
    return res.text || "";
};

export const generateSectionImage = async (segment: DetailImageSegment, refImg?: string) => {
    const parts: Part[] = [{ text: `Product image. ${segment.visualPrompt}. IMPORTANT: Render the following Korean text clearly and accurately: "${segment.keyMessage}". Ensure no characters are broken or corrupted. The text must be in Korean (Hangul).` }];
    if (refImg) { const p = imageToPart(refImg); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: { parts },
        config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    return extractBase64Image(res);
};

export const generateThumbnail = async (info: ProductInfo, options: ThumbnailOptions, text: string) => {
    const prompt = `Product thumbnail. Name: ${info.name}. Style: ${options.style}. Include Model: ${options.includeModel}. IMPORTANT: Render the following Korean text clearly and accurately: "${text}". Ensure no characters are broken or corrupted. The text must be in Korean (Hangul). 1:1.`;
    const parts: Part[] = [{ text: prompt }];
    if (info.referenceImage) { const p = imageToPart(info.referenceImage); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({
        model: PRO_IMAGE_MODEL,
        contents: { parts },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
    });
    return extractBase64Image(res);
};

export const extractProductInfoFromUrl = async (url: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Analyze product at ${url}. Extract name, category, features, mustInclude. Return JSON.`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    return { data: JSON.parse(res.text || "{}") };
};

// 16. Performance Marketing
export const analyzePerformanceMarketing = async (info: string, varA: any, varB: any) => {
    const prompt = `Analyze A/B test. Product: ${info}. Variant A: ${JSON.stringify(varA)}. Variant B: ${JSON.stringify(varB)}. Predict winner and explain why in HTML.`;
    const parts: Part[] = [{ text: prompt }];
    if (varA.image) { const p = imageToPart(varA.image); if(p) parts.push(p); }
    if (varB.image) { const p = imageToPart(varB.image); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({ model: PRO_TEXT_MODEL, contents: { parts } });
    return res.text;
};

// 17. YouTube
export const generateYouTubePlan = async (topic: string, target: string, type: string, refImg?: string, refFile?: any) => {
    const parts: Part[] = [{ text: `Plan YouTube content. Topic: ${topic}, Target: ${target}, Type: ${type}. HTML format.` }];
    if (refImg) { const p = imageToPart(refImg); if(p) parts.push(p); }
    if (refFile) { const p = fileToPart(refFile); if(p) parts.push(p); }

    const res = await getAI().models.generateContent({ model: PRO_TEXT_MODEL, contents: { parts } });
    return { text: res.text, usage: getUsage(res) };
};

// 18. Prompt Architect
export const generateCustomPrompt = async (request: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Act as a Prompt Architect. Refine this request into a high-quality prompt: "${request}".`
    });
    return { text: res.text, usage: getUsage(res) };
};

// 19. Detail Research
export const generateDetailResearch = async (topic: string, category: string, files: any[]) => {
    const parts: Part[] = [{ text: `Deep Research on "${topic}" (Category: ${category}). Provide detailed report with sources. HTML format.` }];
    files.forEach(f => { const p = fileToPart(f); if(p) parts.push(p); });

    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: { parts },
        config: { tools: [{ googleSearch: {} }] }
    });
    
    // Extract sources
    const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks?.map((c: any) => ({ title: c.web?.title || "Source", url: c.web?.uri || "#" })) || [];

    return { text: res.text, sources, usage: getUsage(res) };
};

export const generateCarouselSummary = async (content: string, count: number) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Summarize this content into ${count} Instagram carousel slides. HTML format.`
    });
    return { text: res.text, usage: getUsage(res) };
};

// 20. Profit Finder
export const generateProfitItems = async (category: string) => {
    const res = await getAI().models.generateContent({
        model: PRO_TEXT_MODEL,
        contents: `Find 5 profitable items/trends in "${category}" right now using Google Search. HTML format.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return { text: res.text, usage: getUsage(res) };
};

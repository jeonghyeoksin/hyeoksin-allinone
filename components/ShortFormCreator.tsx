
import React, { useState, useRef, useEffect } from 'react';
import { ShortFormState, GeneratedContent } from '../types';
import { generateShortFormPlan, generateVeoVideo, generateVoiceover } from '../services/geminiService';

export const ShortFormCreator: React.FC = () => {
  const [inputs, setInputs] = useState<ShortFormState>({
    topic: ''
  });
  const [result, setResult] = useState<GeneratedContent>({ loading: false });
  const [veoPrompt, setVeoPrompt] = useState<string>("");
  const [narrationScript, setNarrationScript] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isWaitingForKey, setIsWaitingForKey] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Track if plan is ready
  const [hasPlan, setHasPlan] = useState<boolean>(false);

  const handleCreatePlan = async () => {
    if (!inputs.topic) return;
    
    setResult({ loading: true, text: undefined, videoUrl: undefined, audioUrl: undefined });
    setStatusMessage("1단계: VEO 3.1 프롬프트 및 대본 기획 중...");
    setVeoPrompt("");
    setNarrationScript("");
    setHasPlan(false);
    setIsWaitingForKey(false);

    try {
      // 1. Generate Plan & Prompt & Narration Script
      const { visualPrompt, scriptHtml, narration } = await generateShortFormPlan(inputs.topic);
      
      setResult(prev => ({ ...prev, text: scriptHtml, loading: false }));
      setVeoPrompt(visualPrompt);
      setNarrationScript(narration);
      setHasPlan(true);
      setStatusMessage("");

    } catch (e: any) {
      setResult(prev => ({ ...prev, loading: false, error: e.message }));
      setStatusMessage("");
    }
  };

  const handleCreateMedia = async () => {
      // 2. Check for Paid API Key before starting expensive generation
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            setIsWaitingForKey(true);
            setStatusMessage("영상 생성을 위해 유료 API 키 선택이 필요합니다.");
            return;
        }
      }

      await startGenerationProcess(veoPrompt, narrationScript);
  }

  const startGenerationProcess = async (prompt: string, narration: string) => {
      setResult(prev => ({ ...prev, loading: true, error: undefined }));
      setIsWaitingForKey(false);
      setStatusMessage("2단계: Google VEO 3.1이 영상을 생성하고 있습니다... (약 1~2분 소요)");
      
      try {
        // Run Video Generation
        const { videoUri } = await generateVeoVideo(prompt);
        
        setStatusMessage("영상 처리 중...");
        const apiKey = process.env.API_KEY;
        const fetchUrl = videoUri.includes('?') ? `${videoUri}&key=${apiKey}` : `${videoUri}?key=${apiKey}`;
        
        const videoResponse = await fetch(fetchUrl);
        if (!videoResponse.ok) throw new Error("영상 다운로드 실패");
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        // Generate Audio (TTS) only if narration exists and is valid
        let audioUrl = undefined;
        if (narration && narration.trim().length > 0) {
            setStatusMessage("3단계: 한국어 나레이션(TTS) 생성 중...");
            try {
                audioUrl = await generateVoiceover(narration);
            } catch (audioError) {
                console.warn("Audio generation failed, skipping audio.", audioError);
                audioUrl = undefined;
            }
        }
        
        setResult(prev => ({ ...prev, loading: false, videoUrl: videoUrl, audioUrl: audioUrl }));
        setStatusMessage("영상 및 오디오 생성 완료!");
        
      } catch (e: any) {
         setResult(prev => ({ ...prev, loading: false, error: e.message }));
         setStatusMessage("오류 발생: 다시 시도해주세요.");
      }
  };

  const handleSelectKeyAndGenerate = async () => {
      if ((window as any).aistudio) {
          try {
            await (window as any).aistudio.openSelectKey();
            if (veoPrompt) {
                await startGenerationProcess(veoPrompt, narrationScript);
            }
          } catch (e) {
            console.error("Key selection error", e);
          }
      }
  };

  // Auto-play audio when video plays (Simple Sync)
  const handleVideoPlay = () => {
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed)", e));
      }
  };

  const handleVideoPause = () => {
      if (audioRef.current) {
          audioRef.current.pause();
      }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-6 bg-cyan-500 rounded mr-2"></span>
              숏폼 영상 기획 + 생성
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  영상 주제 및 아이디어 <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                  placeholder="예: 미래 도시의 사이버펑크 야경, 한복을 입고 춤추는 소녀"
                  className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none custom-scrollbar"
                />
                <p className="text-xs text-slate-500 mt-2">
                  * <b>Veo 3.1</b>로 영상을 생성하고 <b>Gemini TTS</b>로 한국어 나레이션을 입혀드립니다.
                </p>
              </div>

              {!hasPlan ? (
                  <button
                    onClick={handleCreatePlan}
                    disabled={result.loading || !inputs.topic}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                      result.loading
                        ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/50'
                    }`}
                  >
                    {result.loading ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>기획안 생성 중...</span>
                        </div>
                      </div>
                    ) : (
                      '1단계: 기획안 생성하기'
                    )}
                  </button>
              ) : (
                  <button
                    onClick={handleCreateMedia}
                    disabled={result.loading || isWaitingForKey}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center mt-4 ${
                      result.loading || isWaitingForKey
                        ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                        : 'bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow-cyan-900/50'
                    }`}
                  >
                    {result.loading ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>영상 및 오디오 생성 중...</span>
                        </div>
                      </div>
                    ) : (
                      '2단계: 영상 및 보이스 생성하기'
                    )}
                  </button>
              )}

              {/* Status Message Area */}
              {(result.loading || isWaitingForKey || statusMessage) && (
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 animate-fade-in">
                      <p className={`text-sm text-center font-medium ${isWaitingForKey ? 'text-yellow-400' : 'text-cyan-300 animate-pulse'}`}>
                          {statusMessage}
                      </p>
                      
                      {isWaitingForKey && (
                          <div className="mt-3">
                              <button 
                                onClick={handleSelectKeyAndGenerate}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 rounded-lg transition-colors text-sm"
                              >
                                  API 키 선택하고 영상 생성 시작
                              </button>
                              <p className="text-[10px] text-slate-400 mt-2 text-center">
                                * Veo 영상 생성은 유료 API 키가 필요합니다. <br/>
                                (Billing이 활성화된 프로젝트의 키를 선택해주세요)
                              </p>
                          </div>
                      )}
                  </div>
              )}
              
              {hasPlan && !result.loading && !result.videoUrl && (
                  <div className="mt-2 text-center">
                      <button onClick={() => { setHasPlan(false); setResult({loading:false}); }} className="text-xs text-slate-500 underline hover:text-slate-300">
                          처음부터 다시하기
                      </button>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl min-h-[600px] flex flex-col">
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                    {result.videoUrl ? '✨ 생성 완료된 숏폼' : '제작 기획안 & 프리뷰'}
                </h3>
             </div>

             {result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg mb-4">
                    <strong>오류 발생:</strong> {result.error}
                </div>
             )}

             {!result.text && !result.loading && !result.error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <p>주제를 입력하면 1단계로 기획안을 먼저 생성합니다.</p>
                </div>
             )}
             
             <div className="flex flex-col lg:flex-row gap-6 h-full">
                 {/* Left: Script/Plan */}
                 {result.text && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-800/50 p-4 rounded-xl max-h-[600px]">
                        <div dangerouslySetInnerHTML={{ __html: result.text }} />
                        {veoPrompt && (
                             <div className="mt-4 p-3 bg-black/30 rounded border border-white/5 text-xs font-mono text-slate-400">
                                 <p className="font-bold text-slate-300 mb-1">VEO Prompt (Engineered):</p>
                                 {veoPrompt}
                             </div>
                        )}
                        {narrationScript && (
                             <div className="mt-4 p-3 bg-cyan-900/20 rounded border border-cyan-500/30 text-xs text-cyan-200">
                                 <p className="font-bold mb-1">📢 한국어 나레이션 대본:</p>
                                 "{narrationScript}"
                             </div>
                        )}
                    </div>
                 )}

                 {/* Right: Video Player */}
                 {(result.loading || result.videoUrl || hasPlan) && (
                     <div className="w-full lg:w-[320px] shrink-0 flex flex-col items-center">
                         <div className="w-full aspect-[9/16] bg-black rounded-xl border border-white/10 overflow-hidden relative shadow-2xl group">
                             {result.loading && !result.videoUrl && (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                     <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                     <p className="text-cyan-400 text-sm font-bold animate-pulse">VEO 3.1 Rendering...</p>
                                     <p className="text-xs text-slate-500 mt-2">고품질 영상 생성에는 시간이 소요됩니다.<br/>(약 1~2분)</p>
                                 </div>
                             )}
                             
                             {result.videoUrl ? (
                                 <>
                                    <video 
                                        src={result.videoUrl} 
                                        controls 
                                        className="w-full h-full object-cover"
                                        onPlay={handleVideoPlay}
                                        onPause={handleVideoPause}
                                    />
                                    {result.audioUrl && (
                                        <audio ref={audioRef} src={result.audioUrl} className="hidden" />
                                    )}
                                 </>
                             ) : !result.loading && hasPlan && (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                                     <p className="text-sm">기획안이 준비되었습니다.<br/>영상 생성 버튼을 눌러주세요.</p>
                                 </div>
                             )}
                         </div>
                         
                         {result.videoUrl && (
                             <div className="w-full mt-4 space-y-2">
                                <a 
                                    href={result.videoUrl} 
                                    download="generated_video.mp4"
                                    className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-2 rounded-lg text-center transition-colors"
                                >
                                    영상 다운로드
                                </a>
                                {result.audioUrl && (
                                    <a 
                                        href={result.audioUrl} 
                                        download="generated_voice.wav"
                                        className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg text-center transition-colors border border-white/5"
                                    >
                                        음성 파일만 다운로드
                                    </a>
                                )}
                             </div>
                         )}
                     </div>
                 )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

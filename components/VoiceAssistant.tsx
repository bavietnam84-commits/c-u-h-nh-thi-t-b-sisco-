
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { DeviceType, TranscriptionItem } from '../types';

interface VoiceAssistantProps {
  deviceType: DeviceType;
}

const LANGUAGES = [
  { code: 'vi-VN', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
];

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ deviceType }) => {
  const [isLive, setIsLive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const toggleLiveSession = async () => {
    if (isLive) {
      if (sessionRef.current) sessionRef.current.close();
      setIsLive(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: createBlob(inputData) });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev, { 
                type: 'ai', 
                text: msg.serverContent!.outputTranscription!.text, 
                timestamp: new Date() 
              }]);
            } else if (msg.serverContent?.inputTranscription) {
              setTranscriptions(prev => [...prev, { 
                type: 'user', 
                text: msg.serverContent!.inputTranscription!.text, 
                timestamp: new Date() 
              }]);
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLive(false),
          onerror: (e) => {
            console.error("Live Audio Error:", e);
            setIsLive(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are a Cisco Network Expert specialized in ${deviceType}. 
          Answer concisely about network configurations, security, and commands. 
          You must respond in ${selectedLang.name}. 
          Maintain a professional and helpful tone.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col h-[380px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <i className="fas fa-microphone-alt text-red-400"></i> Voice Assistant
        </h3>
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative group mr-2">
            <button className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-xs font-medium border border-slate-600 transition-colors">
              <span>{selectedLang.flag}</span>
              <span className="hidden sm:inline">{selectedLang.name}</span>
              <i className="fas fa-chevron-down text-[10px] opacity-50"></i>
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-700 transition-colors ${selectedLang.code === lang.code ? 'text-blue-400 bg-blue-400/5' : 'text-slate-300'}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {isLive && (
            <span className="flex items-center gap-2 text-[10px] font-bold text-red-500 animate-pulse px-2 py-1 bg-red-500/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> LIVE
            </span>
          )}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg transition-colors ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:bg-slate-700'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar"
      >
        {transcriptions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-3">
            <i className="fas fa-comment-dots text-3xl opacity-20"></i>
            <p className="text-sm">Start a conversation in {selectedLang.name}.</p>
          </div>
        ) : (
          transcriptions.map((t, i) => (
            <div key={i} className={`flex ${t.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                t.type === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-700/50 text-slate-200 border border-slate-600 rounded-tl-none'
              }`}>
                {t.text}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={toggleLiveSession}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg ${
          isLive 
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/20' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20'
        }`}
      >
        {isLive ? (
          <><i className="fas fa-stop"></i> End Session</>
        ) : (
          <><i className="fas fa-play"></i> Talk to Engineer</>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;

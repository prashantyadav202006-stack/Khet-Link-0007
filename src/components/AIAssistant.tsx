import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  TrendingUp, 
  ShieldCheck, 
  Sprout, 
  Building2, 
  HelpCircle, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Wheat,
  Utensils,
  CheckCircle2,
  Clock,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Move,
  GripVertical,
  RotateCcw,
  Key
} from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  hasGeminiApiKey, 
  queryGeminiLive, 
  ChatHistoryMessage 
} from '../services/geminiService';

interface AIAssistantProps {
  onNavigate?: (view: AppView) => void;
  onOpenAuth?: (role: 'farmer' | 'buyer') => void;
  isOpenControlled?: boolean;
  onToggleControlled?: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  pills?: string[];
  isLiveGemini?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onNavigate, 
  onOpenAuth,
  isOpenControlled,
  onToggleControlled
}) => {
  const { t, language, currentLangOption } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalIsOpen;

  // Gemini Live configuration state
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean>(hasGeminiApiKey());
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputApiKey, setInputApiKey] = useState<string>(getGeminiApiKey());

  const setIsOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof val === 'function' ? val(isOpen) : val;
    setInternalIsOpen(next);
    if (onToggleControlled && next !== isOpen) {
      onToggleControlled();
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    stopSpeaking();
    setIsOpen(false);
  };

  const [chatResetKey, setChatResetKey] = useState(0);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  // Speech Synthesis (Text-to-Speech) state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);

  // Stop any active speech synthesis
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  // Speak message text with regional Hindi/English voice awareness
  const speakMessage = (text: string, messageId?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking && speakingMessageId === messageId) {
      stopSpeaking();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean formatting and emojis for natural human speech
    const cleanText = text
      .replace(/[*_#`~>[\]()]/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/[•✦–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    const targetLangCode = hasDevanagari || language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN';
    utterance.lang = targetLangCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(targetLangCode.toLowerCase())) ||
                           voices.find(v => v.lang.toLowerCase().startsWith(targetLangCode.split('-')[0])) ||
                           voices.find(v => v.lang.includes('IN'));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(messageId || 'active');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Clean up speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const chatDragControls = useDragControls();
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');
  const typingTimerRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: t('ai.greeting', 'Namaste! I am KhetAI Sahayak, your direct farmgate advisor on Khet Link. How can I help you today?'),
      time: 'Just now',
      pills: [
        t('ai.pillWheat', "🌾 Today's Mandi Rates vs MSP"),
        t('ai.pillMess', '🏢 Hostel/Mess Bulk Grain Procurement'),
        t('ai.pillKyc', '👨‍🌾 Farmer KYC & Bank DBT Setup'),
        t('ai.pillEscrow', '🛡️ How 100% Escrow Protects You')
      ]
    }
  ]);

  // Keep assistant initial message and pills in sync with active language
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{
          id: 'm-1',
          sender: 'ai',
          text: t('ai.greeting', 'Namaste! I am KhetAI Sahayak, your direct farmgate advisor on Khet Link. How can I help you today?'),
          time: 'Just now',
          pills: [
            t('ai.pillWheat', "🌾 Today's Mandi Rates vs MSP"),
            t('ai.pillMess', '🏢 Hostel/Mess Bulk Grain Procurement'),
            t('ai.pillKyc', '👨‍🌾 Farmer KYC & Bank DBT Setup'),
            t('ai.pillEscrow', '🛡️ How 100% Escrow Protects You')
          ]
        }];
      }
      return prev;
    });
  }, [language]);

  // Click outside to close assistant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;
      
      const isInsideChat = chatContainerRef.current && chatContainerRef.current.contains(target);
      const isInsideToggle = toggleButtonRef.current && toggleButtonRef.current.contains(target);

      if (!isInsideChat && !isInsideToggle) {
        setIsOpen(false);
        if (isListening) {
          stopVoiceRecording();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isListening]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // Simulated live typing fallback for environments where microphone is blocked or unsupported
  const simulateLiveVoiceTyping = (targetLanguage: string) => {
    const localizedQueries: Record<string, string[]> = {
      en: [
        'What is the current Sharbati Wheat mandi rate in Sehore?',
        'How can a college hostel mess procure grains directly from farmers?',
        'What are the mandatory KYC steps for farmer DBT on Khet Link?'
      ],
      hi: [
        'सीहोर मंडी में आज शरबती गेहूं का क्या भाव चल रहा है?',
        'कॉलेज हॉस्टल मेस किसानों से सीधे गेहूं-चावल कैसे खरीद सकती है?',
        'खेत लिंक पर किसान बैंक डीबीटी और आधार सत्यापन कैसे करें?'
      ],
      pa: [
        'ਅੱਜ ਮੰਡੀ ਵਿੱਚ ਸ਼ਰਬਤੀ ਕਣਕ ਦਾ ਤਾਜ਼ਾ ਭਾਅ ਕੀ ਚੱਲ ਰਿਹਾ ਹੈ?',
        'ਹੋਸਟਲ ਮੈੱਸ ਕਿਸਾਨਾਂ ਤੋਂ ਸਿੱਧਾ ਬਾਸਮਤੀ ਝੋਨਾ ਅਤੇ ਦਾਲਾਂ ਕਿਵੇਂ ਖਰੀਦੇ?',
        'ਕਿਸਾਨ ਆਧਾਰ ਕੇਵਾਈਸੀ ਅਤੇ ਸਿੱਧਾ ਬੈਂਕ ਖਾਤਾ ਕਿਵੇਂ ਸ਼ੁਰੂ ਕਰੀਏ?'
      ],
      mr: [
        'सीहोर आणि अकोला बाजारात आज गव्हाचा थेट भाव काय आहे?',
        'हॉस्टेल मेससाठी थेट शेतकऱ्यांकडून धान्य आणि डाळींची खरेदी कशी करावी?',
        'शेतकरी आधार केवायसी आणि थेट बँक खात्यात पैसे मिळवण्याची पद्धत काय आहे?'
      ],
      te: [
        'మార్కెట్‌లో శర్బతి గోధుమల నేటి ప్రత్యక్ష ధర ఎంత?',
        'కళాశాల హాస్టల్ మెస్ నేరుగా రైతుల నుండి బియ్యం మరియు పప్పులు ఎలా కొనాలి?',
        'రైతు ఆధార్ కేవైసీ మరియు బ్యాంక్ ఖాతాలో నగదు జమ ఎలా జరుగుతుంది?'
      ]
    };

    const queries = localizedQueries[targetLanguage] || localizedQueries.en;
    const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
    const words = selectedQuery.split(' ');
    
    setIsListening(true);
    setSpeechFeedback(t('ai.voiceListening', `Listening... (${currentLangOption.nativeLabel})`));

    const initialBase = baseTextRef.current ? `${baseTextRef.current} ` : '';
    let currentWordIdx = 0;
    let accumulatedWords = '';

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (currentWordIdx < words.length) {
        accumulatedWords += (currentWordIdx > 0 ? ' ' : '') + words[currentWordIdx];
        setInputMessage(initialBase + accumulatedWords);
        currentWordIdx++;
      } else {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setIsListening(false);
        setSpeechFeedback(null);
      }
    }, 180);
  };

  // Voice to Type Converter implementation
  const startVoiceRecording = () => {
    baseTextRef.current = inputMessage.trim();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      simulateLiveVoiceTyping(language);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = currentLangOption.speechCode || 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let recognizedAnySpeech = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechFeedback(t('ai.voiceListening', `Listening... Speak in ${currentLangOption.nativeLabel}`));
      };

      recognition.onresult = (event: any) => {
        recognizedAnySpeech = true;
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const currentSpokenText = (finalTranscript + interimTranscript).trim();
        const base = baseTextRef.current ? `${baseTextRef.current} ` : '';
        setInputMessage(base + currentSpokenText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || !recognizedAnySpeech) {
          // Gracefully fallback to voice-to-type simulation so the user always sees automatic transcribed words!
          simulateLiveVoiceTyping(language);
        } else {
          setIsListening(false);
          setSpeechFeedback(null);
        }
      };

      recognition.onend = () => {
        if (!recognizedAnySpeech && isListening) {
          simulateLiveVoiceTyping(language);
        } else {
          setIsListening(false);
          setSpeechFeedback(null);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed, using fallback typing:', err);
      simulateLiveVoiceTyping(language);
    }
  };

  const stopVoiceRecording = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setSpeechFeedback(null);
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    let aiResponseText = '';
    let actionObj: Message['action'] | undefined = undefined;
    let isLiveGemini = false;

    // 1. If Gemini API key is configured, query live Google Gemini LLM
    if (hasGeminiApiKey()) {
      try {
        const history: ChatHistoryMessage[] = messages
          .filter((m) => m.text)
          .map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }));

        aiResponseText = await queryGeminiLive(text.trim(), history, language);
        isLiveGemini = true;
      } catch (err: any) {
        console.warn('Live Gemini query failed, falling back to agricultural knowledge base:', err?.message || err);
      }
    }

    // 2. If Gemini didn't return (offline/no key/error), use built-in domain knowledge base
    if (!aiResponseText) {

      const lower = text.toLowerCase().trim();

      // 1. GREETINGS & INTRODUCTIONS
      if (
        lower.startsWith('hi') || lower.startsWith('hello') || lower.startsWith('hey') ||
        lower.includes('namaste') || lower.includes('sat sri akal') || lower.includes('pranam') ||
        lower.includes('namaskaram') || lower.includes('vanakkam') || lower.includes('kem cho') ||
        lower.includes('ram ram') || lower.includes('नमस्ते') || lower.includes('सत श्री अकाल') ||
        lower.includes('नमस्कार') || lower.includes('నమస్కారం') || lower.includes('హలో')
      ) {
        if (language === 'hi') {
          aiResponseText = `🙏 **नमस्ते! खेत लिंक पर आपका स्वागत है।**\nमैं खेत-एआई सहायक हूँ। मैं आपकी निम्नलिखित विषयों में मदद कर सकता हूँ:\n• 🌾 **लाइव मंडी भाव और एमएसपी**: गेहूं, बासमती, सरसों, सोयाबीन, दालें।\n• 🏢 **हॉस्टल मेस थोक खरीद**: 0% बिचौलिया दलाली और जीएसटी इनवॉइस।\n• 👨‍🌾 **किसान पंजीकरण व भुगतान**: आधार डीबीटी द्वारा टी+0 सीधा बैंक भुगतान।\n• 🛡️ **100% एस्क्रो सुरक्षा**: सुरक्षित अग्रिम फंड गारंटी।\n\nकृपया अपना प्रश्न लिखें या नीचे दिए गए सुझावों पर क्लिक करें!`;
        } else if (language === 'pa') {
          aiResponseText = `🙏 **ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਖੇਤ ਲਿੰਕ 'ਤੇ ਜੀ ਆਇਆਂ ਨੂੰ।**\nਮੈਂ ਖੇਤ-ਏਆਈ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਹੇਠ ਲਿਖੇ ਮਾਮਲਿਆਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n• 🌾 **ਮੰਡੀ ਭਾਅ ਤੇ MSP**: ਕਣਕ, ਬਾਸਮਤੀ ਝੋਨਾ, ਸਰ੍ਹੋਂ, ਦਾਲਾਂ।\n• 🏢 **ਹੋਸਟਲ ਮੈੱਸ ਖਰੀਦ**: 0% ਆੜ੍ਹਤ ਨਾਲ ਸਿੱਧੀ ਖੇਤ ਲਾਟ।\n• 👨‍🌾 **ਕਿਸਾਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ**: ਤੋਲ ਹੁੰਦਿਆਂ ਹੀ ਸਿੱਧਾ ਬੈਂਕ ਖਾਤੇ 'ਚ T+0 ਭੁਗਤਾਨ।\n• 🛡️ **100% ਐਸਕਰੋ ਗਾਰੰਟੀ**: ਪੈਸੇ ਦੀ ਪੂਰੀ ਸੁਰੱਖਿਆ।\n\nਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ!`;
        } else if (language === 'mr') {
          aiResponseText = `🙏 **नमस्कार! खेत लिंकवर आपले सहर्ष स्वागत आहे.**\nमी खेत-एआय सहायक आहे. मी खालील विषयांवर आपली मदत करू शकतो:\n• 🌾 **थेट बाजार भाव व हमीभाव**: गहू, तांदूळ, सोयाबीन, हरभरा, मोहरी.\n• 🏢 **मेस व कॅन्टीन घाऊक खरेदी**: शून्य दलाली आणि जीएसटी पावती.\n• 👨‍🌾 **शेतकरी नोंदणी**: आधार बँक खात्यात थेट T+0 पैसे जमा.\n• 🛡️ **100% एस्क्रो सुरक्षा**: आरबीआय सुरक्षित फंड हमी.\n\nआपला प्रश्न विचारा किंवा खालील पर्यायांवर क्लिक करा!`;
        } else if (language === 'te') {
          aiResponseText = `🙏 **నమస్కారం! ఖేత్ లింక్‌కు స్వాగతం.**\nనేను మీ ఖేత్-AI సహాయకుడిని. నేను మీకు ఈ అంశాలలో సహాయపడగలను:\n• 🌾 **మార్కెట్ ధరలు & MSP**: గోధుమలు, బాస్మతి బియ్యం, ఆవాలు, పప్పులు.\n• 🏢 **హాస్టల్ మెస్ టోకు కొనుగోళ్లు**: 0% దళారీతనం, ల్యాబ్ టెస్ట్ సర్టిఫికేట్.\n• 👨‍🌾 **రైతు నమోదు & DBT**: తూకం కాగానే T+0 బ్యాంక్ ఖాతాలో జమ.\n• 🛡️ **100% ఎస్క్రో భద్రత**: ఆర్డర్ మొత్తంపై పూర్తి రక్షణ.\n\nదయచేసి మీ ప్రశ్నను అడగండి!`;
        } else {
          aiResponseText = `🙏 **Namaste! Welcome to Khet Link.**\nI am KhetAI Sahayak, your direct farmgate advisory copilot. I can assist you with:\n• 🌾 **Live Mandi Rates & MSPs**: Wheat, Basmati Rice, Mustard, Soybean, Pulses.\n• 🏢 **Hostel Mess Bulk Procurement**: 0% middleman margin, GST invoices, NABL assays.\n• 👨‍🌾 **Farmer Onboarding & DBT**: Instant T+0 bank payouts upon farmgate weighing.\n• 🛡️ **100% Escrow Guarantee**: RBI-regulated buyer deposits and delivery telemetry.\n\nPlease type your query or click on any suggested topic!`;
        }
        actionObj = {
          label: t('nav.marketplace', 'Explore Live Harvest Marketplace'),
          onClick: () => {
            if (onNavigate) onNavigate('marketplace');
            setIsOpen(false);
          }
        };
      }
      // 2. WHEAT / GEHU / KANAK / GAHU
      else if (
        lower.includes('wheat') || lower.includes('gehu') || lower.includes('gehun') ||
        lower.includes('kanak') || lower.includes('gahu') || lower.includes('godhumalu') ||
        lower.includes('sharbati') || lower.includes('durum') || lower.includes('गेहूं') ||
        lower.includes('गेहू') || lower.includes('ਕਣਕ') || lower.includes('गहू') ||
        lower.includes('గోధుమలు')
      ) {
        if (language === 'hi') {
          aiResponseText = `🌾 **शरबती व सामान्य गेहूं लाइव मंडी भाव एवं विश्लेषण**:\n• **सीहोर शरबती (C-306 ग्रेड ए)**: ₹2,850/क्विंटल (सरकारी MSP ₹2,275 से +₹210 अधिक प्रीमियम)।\n• **करनाल व खन्ना गेहूं (HD-2967)**: ₹2,420/क्विंटल।\n• **नमी का मानक**: ग्रेड ए निर्यात के लिए नमी 11.0% से कम होनी अनिवार्य है।\n• **एआई भाव पूर्वानुमान**: आगामी त्योहारी सीजन में आटा मिलों की मांग से अगले 30 दिनों में +4.8% बढ़ोतरी संभावित है।\n• **भंडारण सुझाव**: 40% स्टॉक को वेयरहाउस में रोककर रखने से अक्टूबर में बेहतर भाव मिलेंगे।`;
        } else if (language === 'pa') {
          aiResponseText = `🌾 **ਸ਼ਰਬਤੀ ਅਤੇ ਮਿਲਿੰਗ ਕਣਕ ਲਾਈਵ ਮੰਡੀ ਭਾਅ**:\n• **ਸੀਹੋਰ ਸ਼ਰਬਤੀ (ਗ੍ਰੇਡ ਏ)**: ₹2,850/ਕੁਇੰਟਲ (ਸਰਕਾਰੀ MSP ₹2,275 ਨਾਲੋਂ +₹210 ਵੱਧ)।\n• **ਖੰਨਾ ਮੰਡੀ ਕਣਕ (HD-2967)**: ₹2,420/ਕੁਇੰਟਲ।\n• **ਨਮੀ ਮਾਪਦੰਡ**: ਉੱਚ ਦਰ ਲਈ ਨਮੀ 11% ਤੋਂ ਘੱਟ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।\n• **ਏਆਈ ਅਨੁਮਾਨ**: ਆਉਣ ਵਾਲੇ ਤਿਉਹਾਰੀ ਸੀਜ਼ਨ ਵਿੱਚ ਭਾਅ +4.8% ਵਧਣ ਦਾ ਅਨੁਮਾਨ ਹੈ।`;
        } else if (language === 'mr') {
          aiResponseText = `🌾 **शरबती व मिलिंग गहू थेट बाजार भाव**:\n• **सीहोर शरबती गहू**: ₹2,850/क्विंटल (शासकीय हमीभावापेक्षा +₹210 जास्त).\n• **अकोला व जळगाव गहू**: ₹2,420 - ₹2,460/क्विंटल.\n• **आर्द्रता प्रमाण**: ग्रेड ए साठी ओलावा 11.0% पेक्षा कमी असावा.\n• **एआय अंदाज**: पुढील 30 दिवसांत गव्हाचे दर +4.8% वाढण्याची शक्यता आहे.`;
        } else if (language === 'te') {
          aiResponseText = `🌾 **శర్బతి మరియు గోధుమల ప్రత్యక్ష మార్కెట్ విశ్లేషణ**:\n• **శర్బతి గోధుమలు (సీహోర్)**: ₹2,850/క్వింటా (ప్రభుత్వ MSP కంటే +₹210 ఎక్కువ).\n• **కర్నాల్ గోధుమలు**: ₹2,420/క్వింటా.\n• **తేమ ప్రమాణం**: నాణ్యమైన పంటకు తేమ 11.0% కంటే తక్కువ ఉండాలి.\n• **AI అంచనా**: వచ్చే 30 రోజుల్లో డిమాండ్ +4.8% పెరుగుతుంది.`;
        } else {
          aiResponseText = `🌾 **Sharbati & Milling Wheat Live Mandi Analysis**:\n• **Sehore Sharbati (C-306 Grade A)**: ₹2,850/Qtl (+₹210 premium over GoI MSP of ₹2,275).\n• **Karnal & Khanna Milling Wheat**: ₹2,420/Qtl.\n• **Moisture Benchmark**: Optimal quality requires moisture under 11.0%.\n• **AI Price Projection**: Projected to appreciate +4.8% over the next 30 days driven by festive flour mill off-take.\n• **Storage Recommendation**: Warehouse 40% of lot for higher margins in October.`;
        }
        actionObj = {
          label: t('nav.marketplace', 'View Available Wheat Lots'),
          onClick: () => {
            if (onNavigate) onNavigate('marketplace');
            setIsOpen(false);
          }
        };
      }
      // 3. RICE / BASMATI / CHAWAL / PADDY / BIYYAM
      else if (
        lower.includes('rice') || lower.includes('basmati') || lower.includes('chawal') ||
        lower.includes('paddy') || lower.includes('chaul') || lower.includes('biyyam') ||
        lower.includes('चावल') || lower.includes('धान') || lower.includes('ਬਾਸਮਤੀ') ||
        lower.includes('ਚੌਲ') || lower.includes('तांदूळ') || lower.includes('బియ్యం')
      ) {
        if (language === 'hi') {
          aiResponseText = `🍚 **बासमती व गैर-बासमती चावल मंडी रिपोर्ट**:\n• **बासमती 1121 स्टीम (लंबा दाना)**: ₹3,920/क्विंटल (करनाल व तरावड़ी मंडी)।\n• **पूसा 1509 सेला**: ₹3,350/क्विंटल।\n• **हॉस्टल मेस परमल चावल**: ₹2,450/क्विंटल (टूटा दाना <2% गारंटी)।\n• **गुणवत्ता जांच**: नमी 12% से कम, 8.2 मिमी औसत दाना लंबाई और डिजिटल बारकोड ट्रेसिबिलिटी।`;
        } else if (language === 'pa') {
          aiResponseText = `🍚 **ਬਾਸਮਤੀ ਅਤੇ ਝੋਨਾ ਲਾਈਵ ਮੰਡੀ ਰਿਪੋਰਟ**:\n• **ਬਾਸਮਤੀ 1121 ਸਟੀਮ**: ₹3,920/ਕੁਇੰਟਲ (ਕਰਨਾਲ ਤੇ ਅੰਮ੍ਰਿਤਸਰ ਮੰਡੀ)।\n• **ਪੂਸਾ 1509**: ₹3,350/ਕੁਇੰਟਲ।\n• **ਹੋਸਟਲ ਮੈੱਸ ਚੌਲ**: ₹2,450/ਕੁਇੰਟਲ (ਟੋਟਾ ਚੌਲ <2% ਗਾਰੰਟੀ)।\n• **ਨਮੀ ਮਾਪਦੰਡ**: ਨਮੀ 12% ਤੋਂ ਘੱਟ।`;
        } else if (language === 'mr') {
          aiResponseText = `🍚 **बासमती व तांदूळ थेट बाजार अहवाल**:\n• **बासमती 1121**: ₹3,920/क्विंटल (कर्नाल मंडी).\n• **कोलम व वाडा तांदूळ**: ₹3,400/क्विंटल.\n• **मेससाठी परमल तांदूळ**: ₹2,450/क्विंटल.\n• **गुणवत्ता**: एनएबीएल डिजिटल लॅब तपासणी.`;
        } else if (language === 'te') {
          aiResponseText = `🍚 **బాస్మతి మరియు బియ్యం మార్కెట్ నివేదిక**:\n• **బాస్మతి 1121**: ₹3,920/క్వింటా (కర్నాల్ మార్కెట్).\n• **సోనా మసూరి / పర్మాళ్**: ₹2,550/క్వింటా.\n• **నాణ్యత**: తేమ 12% లోపు, విరిగిన బియ్యం <2% గ్యారెంటీ.`;
        } else {
          aiResponseText = `🍚 **Basmati & Non-Basmati Rice Mandi Intelligence**:\n• **Basmati 1121 Steam (Extra Long Grain)**: ₹3,920/Qtl (Karnal & Taraori APMC).\n• **Pusa 1509 Sella**: ₹3,350/Qtl.\n• **Hostel Mess Bulk Rice**: ₹2,450/Qtl (Broken grain under 2% guarantee).\n• **Quality Standard**: Moisture below 12.0%, kernel elongation ratio 2.1x, zero foreign matter.`;
        }
        actionObj = {
          label: t('nav.marketplace', 'Explore Direct Rice Lots'),
          onClick: () => {
            if (onNavigate) onNavigate('marketplace');
            setIsOpen(false);
          }
        };
      }
      // 4. MUSTARD / SARSON / OILSEEDS
      else if (
        lower.includes('mustard') || lower.includes('sarson') || lower.includes('rai') ||
        lower.includes('mohari') || lower.includes('avalu') || lower.includes('oilseed') ||
        lower.includes('सरसों') || lower.includes('ਸਰ੍ਹੋਂ') || lower.includes('मोहरी') ||
        lower.includes('ఆవాలు')
      ) {
        if (language === 'hi') {
          aiResponseText = `🟡 **पीली व काली सरसों (तिलहन) मंडी विश्लेषण**:\n• **अलवर व भरतपुर मंडी भाव**: ₹5,750/क्विंटल (तेल मात्रा 42% बेंचमार्क)।\n• **सरकारी एमएसपी**: ₹5,650/क्विंटल से अधिक पर सीधा व्यापार।\n• **नमी सीमा**: तेल निष्कर्षण के लिए 8.0% से कम नमी आवश्यक।`;
        } else if (language === 'pa') {
          aiResponseText = `🟡 **ਪੀਲੀ ਤੇ ਕਾਲੀ ਸਰ੍ਹੋਂ ਲਾਈਵ ਭਾਅ**:\n• **ਅਲਵਰ ਤੇ ਬਠਿੰਡਾ ਭਾਅ**: ₹5,750/ਕੁਇੰਟਲ (ਤੇਲ ਮਾਤਰਾ 42%)।\n• **ਸਰਕਾਰੀ MSP**: ₹5,650/ਕੁਇੰਟਲ ਨਾਲੋਂ ਉੱਚਾ ਭਾਅ।`;
        } else if (language === 'mr') {
          aiResponseText = `🟡 **पिवळी व काळी मोहरी बाजार भाव**:\n• **अलवर व लातूर भाव**: ₹5,750/क्विंटल (42% तेल प्रमाण).\n• **हमीभाव**: ₹5,650 पेक्षा थेट नफा.`;
        } else if (language === 'te') {
          aiResponseText = `🟡 **ఆవాలు మార్కెట్ విశ్లేషణ**:\n• **ఆవాల ధర**: ₹5,750/క్వింటా (42% నూనె శాతం గల నాణ్యమైన పంట).`;
        } else {
          aiResponseText = `🟡 **Yellow & Black Mustard (Oilseeds) Spot Analysis**:\n• **Alwar & Bharatpur APMC**: ₹5,750/Qtl (42% Oil content benchmark).\n• **MSP Comparison**: Trading firmly above GoI MSP of ₹5,650/Qtl.\n• **Testing**: Moisture must remain under 8.0% for high-yield edible oil pressing.`;
        }
        actionObj = {
          label: t('nav.marketplace', 'View Mustard Harvests'),
          onClick: () => {
            if (onNavigate) onNavigate('marketplace');
            setIsOpen(false);
          }
        };
      }
      // 5. PULSES / DAL / CHANA / TOOR / CHICKPEA
      else if (
        lower.includes('pulse') || lower.includes('pulses') || lower.includes('dal') ||
        lower.includes('daal') || lower.includes('chana') || lower.includes('toor') ||
        lower.includes('arhar') || lower.includes('moong') || lower.includes('urad') ||
        lower.includes('chickpea') || lower.includes('दाल') || lower.includes('चना') ||
        lower.includes('अरहर') || lower.includes('ਤੂਰ') || lower.includes('ਛੋਲੇ') ||
        lower.includes('डाळ') || lower.includes('हरभरा') || lower.includes('పప్పు') ||
        lower.includes('శనగలు')
      ) {
        if (language === 'hi') {
          aiResponseText = `🥣 **दलहन (दालें व चना) मंडी अपडेट**:\n• **देसी चना**: ₹5,400/क्विंटल (अकोला व बीकानेर मंडी)।\n• **अरहर/तूर दाल (पॉलिश रहित)**: ₹7,150/क्विंटल (लातूर व गुलबर्गा एफपीओ)।\n• **मूंग दाल**: ₹7,800/क्विंटल।\n• **हॉस्टल मेस लाभ**: बिना पॉलिश वाली प्राकृतिक दाल सीधे एफपीओ से 16% बचत पर प्राप्त करें।`;
        } else if (language === 'pa') {
          aiResponseText = `🥣 **ਦਾਲਾਂ ਅਤੇ ਛੋਲੇ ਲਾਈਵ ਮੰਡੀ ਰਿਪੋਰਟ**:\n• **ਦੇਸੀ ਛੋਲੇ**: ₹5,400/ਕੁਇੰਟਲ (ਅਕੋਲਾ ਮੰਡੀ)।\n• **ਤੂਰ ਦਾਲ**: ₹7,150/ਕੁਇੰਟਲ।\n• **ਮੈੱਸ ਖਰੀਦ**: ਪ੍ਰੋਟੀਨ ਨਾਲ ਭਰਪੂਰ ਦਾਲਾਂ ਵਿਚੋਲਿਆਂ ਤੋਂ ਬਿਨਾਂ ਸਿੱਧੀਆਂ ਮਿਲਦੀਆਂ ਹਨ।`;
        } else if (language === 'mr') {
          aiResponseText = `🥣 **कडधान्ये व डाळी थेट बाजार भाव**:\n• **देशी हरभरा**: ₹5,400/क्विंटल (अकोला बाजार).\n• **तूर डाळ (अनपॉलिश्ड)**: ₹7,150/क्विंटल (लातूर FPO).\n• **हॉस्टेल मेससाठी**: थेट शेतकरी गटांकडून 16% थेट बचतीवर डाळी उपलब्ध.`;
        } else if (language === 'te') {
          aiResponseText = `🥣 **పప్పు ధాన్యాలు మరియు శనగల మార్కెట్ అప్‌డేట్**:\n• **దేశీ శనగలు**: ₹5,400/క్వింటా (అకోలా మార్కెట్).\n• **కందిపప్పు**: ₹7,150/క్వింటా.\n• **హాస్టల్ మెస్ కోసం**: దళారీలు లేకుండా 16% ఆదాతో సరఫరా.`;
        } else {
          aiResponseText = `🥣 **Pulses & Legumes Mandi Intelligence**:\n• **Desi Chana (Chickpeas)**: ₹5,400/Qtl (Akola & Bikaner APMC).\n• **Unpolished Toor / Arhar Dal**: ₹7,150/Qtl (Direct from Latur & Gulbarga FPOs).\n• **Moong Whole**: ₹7,800/Qtl.\n• **Hostel Mess Advantage**: Zero polishing chemicals, 100% natural protein batches with 16% cost savings.`;
        }
        actionObj = {
          label: t('nav.marketplace', 'View Pulses & Dal Lots'),
          onClick: () => {
            if (onNavigate) onNavigate('marketplace');
            setIsOpen(false);
          }
        };
      }
      // 6. VEGETABLES / ONION / POTATO / TOMATO
      else if (
        lower.includes('vegetable') || lower.includes('potato') || lower.includes('aloo') ||
        lower.includes('alu') || lower.includes('onion') || lower.includes('pyaz') ||
        lower.includes('kanda') || lower.includes('tomato') || lower.includes('tamatar') ||
        lower.includes('sabzi') || lower.includes('tarkari') || lower.includes('सब्जी') ||
        lower.includes('आलू') || lower.includes('प्याज') || lower.includes('टमाटर') ||
        lower.includes('ਆਲੂ') || lower.includes('ਪਿਆਜ਼') || lower.includes('टोमॅटो') ||
        lower.includes('कांदा') || lower.includes('ఆలుగడ్డ') || lower.includes('ఉల్లిపాయ')
      ) {
        if (language === 'hi') {
          aiResponseText = `🥔 **सब्जियां (आलू, प्याज, टमाटर) कोल्ड-चेन रिपोर्ट**:\n• **नासिक प्याज (लासलगांव)**: ₹1,650/क्विंटल (ग्रेड ए सुखाया हुआ)।\n• **कुफरी ज्योति आलू (आगरा व जालंधर)**: ₹1,280/क्विंटल।\n• **टमाटर**: ₹1,850/क्विंटल (बेंगलुरु ग्रामीण)।\n• **कोल्ड-चेन सुरक्षा**: खेत से सीधे तापमान-नियंत्रित रीफर वाहनों द्वारा 48 घंटे में डिलीवरी।`;
        } else if (language === 'pa') {
          aiResponseText = `🥔 **ਆਲੂ ਅਤੇ ਪਿਆਜ਼ ਸਿੱਧੀ ਖੇਤ ਰਿਪੋਰਟ**:\n• **ਨਾਸਿਕ ਪਿਆਜ਼**: ₹1,650/ਕੁਇੰਟਲ।\n• **ਕੁਫਰੀ ਜਯੋਤੀ ਆਲੂ (ਜਲੰਧਰ)**: ₹1,280/ਕੁਇੰਟਲ।\n• **ਟਰਾਂਸਪੋਰਟ**: ਸਿੱਧੀ ਕੋਲਡ-ਚੇਨ ਸਪਲਾਈ ਨਾਲ ਖਰਾਬ ਹੋਣ ਦਾ ਕੋਈ ਖਤਰਾ ਨਹੀਂ।`;
        } else if (language === 'mr') {
          aiResponseText = `🥔 **भाजीपाला (कांदा, बटाटा, टोमॅटो) थेट अहवाल**:\n• **लासलगाव कांदा (नाशिक)**: ₹1,650/क्विंटल (ग्रेड ए).\n• **कुफरी बटाटा**: ₹1,280/क्विंटल.\n• **थेट शेतातून**: शीतगृह वाहनांद्वारे सुरक्षित वाहतूक.`;
        } else if (language === 'te') {
          aiResponseText = `🥔 **కూరగాయలు (ఉల్లిపాయ, ఆలుగడ్డ) మార్కెట్ సమాచారం**:\n• **నాసిక్ ఉల్లిపాయలు**: ₹1,650/క్వింటా.\n• **ఆలుగడ్డ (బంగాళాదుంప)**: ₹1,280/క్వింటా.\n• **కోల్డ్-చైన్ రవాణా**: పొలం నుండి నేరుగా శీతలీకరణ వాహనాల ద్వారా డెలివరీ.`;
        } else {
          aiResponseText = `🥔 **Perishable Produce (Onion, Potato, Tomato) Telemetry**:\n• **Nashik Red Onion (Lasalgaon APMC)**: ₹1,650/Qtl (Cured Grade A).\n• **Kufri Jyoti Potato (Agra & Jalandhar)**: ₹1,280/Qtl.\n• **Hybrid Tomato**: ₹1,850/Qtl (Bengaluru Rural).\n• **Cold-Chain Guarantee**: Dispatched in IoT-monitored refrigerated reefers with live temperature telemetry to prevent transit spoilage.`;
        }
        actionObj = {
          label: t('nav.orders', 'View Cold-Chain Telemetry'),
          onClick: () => {
            if (onNavigate) onNavigate('order-tracking');
            setIsOpen(false);
          }
        };
      }
      // 7. HOSTEL MESS & BULK PROCUREMENT
      else if (
        lower.includes('hostel') || lower.includes('mess') || lower.includes('canteen') ||
        lower.includes('hotel') || lower.includes('college') || lower.includes('procure') ||
        lower.includes('wholesale') || lower.includes('मेस') || lower.includes('ਮੈੱਸ') ||
        lower.includes('हॉस्टेल') || lower.includes('మెస్')
      ) {
        if (language === 'hi') {
          aiResponseText = `🏢 **कॉलेज हॉस्टल मेस एवं थोक खरीदार खरीद प्रणाली**:\n1. **शून्य मंडी उपकर व दलाली**: स्थानीय बिचौलियों की तुलना में 14% से 18% की सीधी बचत।\n2. **सीधे एफपीओ से प्रमाणित लॉट**: गेहूं आटा, बासमती चावल, अरहर दाल, आलू-प्याज एक ही इनवॉइस पर।\n3. **ऑडिट-तैयार जीएसटी इनवॉइस**: कॉलेज व यूनिवर्सिटी ऑडिट हेतु 100% डिजिटल ई-वे बिल।\n4. **एनएबीएल लैब परीक्षण**: प्रत्येक लॉट के साथ नमी और कीटनाशक रहित होने का प्रमाणपत्र।\n5. **मासिक अनुबंध**: मासिक खपत अनुसार निर्धारित तारीखों पर चरणबद्ध डिलीवरी।`;
        } else if (language === 'pa') {
          aiResponseText = `🏢 **ਕਾਲਜ ਹੋਸਟਲ ਮੈੱਸ ਅਤੇ ਥੋਕ ਖਰੀਦਦਾਰਾਂ ਲਈ ਲਾਭ**:\n1. **ਜ਼ੀਰੋ ਆੜ੍ਹਤੀਆ ਫੀਸ**: ਵਿਚੋਲਿਆਂ ਦੇ ਮੁਕਾਬਲੇ 14% ਤੋਂ 18% ਦੀ ਸਿੱਧੀ ਬੱਚਤ।\n2. **ਪ੍ਰਮਾਣਿਤ ਖੇਤ ਲਾਟਾਂ**: ਕਣਕ ਦਾ ਆਟਾ, ਚੌਲ, ਦਾਲਾਂ ਸਿੱਧੀਆਂ ਕਿਸਾਨ ਸਮੂਹਾਂ ਤੋਂ।\n3. **ਜੀਐਸਟੀ ਬਿੱਲ**: ਕਾਲਜ ਆਡਿਟ ਲਈ ਪੂਰੀ ਤਰ੍ਹਾਂ ਕਾਨੂੰਨੀ ਡਿਜੀਟਲ ਬਿੱਲ।\n4. **ਲੈਬ ਟੈਸਟ ਰਿਪੋਰਟ**: ਹਰ ਲਾਟ ਨਾਲ NABL ਕੁਆਲਿਟੀ ਸਰਟੀਫਿਕੇਟ।`;
        } else if (language === 'mr') {
          aiResponseText = `🏢 **हॉस्टेल मेस व घाऊक खरेदीदारांसाठी थेट खरेदी**:\n1. **शून्य बाजार समिती सेस**: स्थानिक व्यापाऱ्यांपेक्षा 14% ते 18% थेट बचत.\n2. **थेट शेतातून धान्य**: गहू, तांदूळ, डाळी थेट शेतकरी उत्पादक कंपन्यांकडून.\n3. **जीएसटी इनव्हॉइस**: कॉलेज ऑडिटसाठी अधिकृत पावती व ई-वे बिल.\n4. **लॅब तपासलेली गुणवत्ता**: एनएबीएल डिजिटल गुणवत्ता प्रमाणपत्र.`;
        } else if (language === 'te') {
          aiResponseText = `🏢 **కాలేజీ హాస్టల్ మెస్ & బల్క్ కొనుగోలుదారుల ప్రయోజనాలు**:\n1. **సున్నా దళారీ కమీషన్**: స్థానిక మార్కెట్ల కంటే 14% నుండి 18% వరకు ప్రత్యక్ష ఆదా.\n2. **రైతుల నుండి నేరుగా**: గోధుమ పిండి, బాస్మతి బియ్యం, కందిపప్పు నేరుగా FPOల నుండి.\n3. **GST ఇన్వాయిస్ & ఇ-వే బిల్లు**: కాలేజీ ఆడిట్ కోసం అధికారిక బిల్లులు.\n4. **NABL నాణ్యతా ధృవీకరణ**: ప్రతి లాట్‌తో ల్యాబ్ పరీక్ష నివేదిక.`;
        } else {
          aiResponseText = `🏢 **Hostel Mess & Bulk Institutional Procurement on Khet Link**:\n1. **Zero Mandi Cess & 0% Dalali**: Save 14% to 18% compared to buying from local Kirana middlemen.\n2. **Direct Farmgate Lots**: Procure monthly staple supplies (Flour/Atta, Basmati Rice, Toor Dal, Potatoes, Onions) directly from certified FPOs.\n3. **Audit-Ready GST Invoices**: 100% compliant digital tax invoices and e-Way bills for institutional accounting.\n4. **NABL Digital Lab Certification**: Every batch is certified for moisture and grading.\n5. **Monthly Schedule Contracts**: Set recurring delivery schedules matching semester cycles.`;
        }
        actionObj = {
          label: t('hero.buyerSignupBtn', 'Register as Hostel/Mess Buyer'),
          onClick: () => {
            if (onOpenAuth) onOpenAuth('buyer');
            setIsOpen(false);
          }
        };
      }
      // 8. FARMER ONBOARDING, SELLING & KYC
      else if (
        lower.includes('farmer') || lower.includes('sell') || lower.includes('onboard') ||
        lower.includes('register') || lower.includes('signup') || lower.includes('kyc') ||
        lower.includes('document') || lower.includes('aadhar') || lower.includes('aadhaar') ||
        lower.includes('kcc') || lower.includes('dbt') || lower.includes('पंजीकरण') ||
        lower.includes('किसान') || lower.includes('ਕਿਸਾਨ') || lower.includes('शेतकरी') ||
        lower.includes('రైతు')
      ) {
        if (language === 'hi') {
          aiResponseText = `🌾 **किसान एवं एफपीओ पंजीकरण व फसल बेचने की प्रक्रिया**:\n1. **मोबाइल ओटीपी**: एसएमएस द्वारा त्वरित 1-क्लिक लॉगिन।\n2. **किसान प्रोफाइल**: नाम, गांव, जमीन का रकबा और एफपीओ समूह।\n3. **फसल लॉट अपलोड**: फसल का नाम, फोटो, अनुमानित क्विंटल और नमी प्रतिशत।\n4. **बैंक डीबीटी**: बैंक खाता व आईएफएससी (माल तुलते ही टी+0 सीधा बैंक ट्रांसफर)।\n5. **केवाईसी सत्यापन**: किसान क्रेडिट कार्ड (KCC) या आधार से 100% सत्यापित ग्रीन बैज।`;
        } else if (language === 'pa') {
          aiResponseText = `🌾 **ਕਿਸਾਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਫਸਲ ਵੇਚਣ ਦਾ ਤਰੀਕਾ**:\n1. **ਮੋਬਾਈਲ ਓਟੀਪੀ**: ਤੁਰੰਤ ਐਸਐਮਐਸ ਨਾਲ ਲੌਗਇਨ।\n2. **ਕਿਸਾਨ ਵੇਰਵੇ**: ਨਾਮ, ਪਿੰਡ, ਜ਼ਮੀਨ ਦਾ ਰਕਬਾ ਅਤੇ FPO ਦਾ ਨਾਂ।\n3. **ਫਸਲ ਲਾਟ ਦਰਜ ਕਰੋ**: ਫਸਲ ਦੀ ਫੋਟੋ, ਕੁਇੰਟਲ ਅਤੇ ਨਮੀ ਦਰਜ ਕਰੋ।\n4. **ਸਿੱਧਾ ਬੈਂਕ ਖਾਤਾ (DBT)**: ਕੰਪਿਊਟਰ ਕੰਡੇ 'ਤੇ ਤੋਲ ਹੁੰਦਿਆਂ ਹੀ ਸਿੱਧਾ ਪੈਸਾ ਖਾਤੇ ਵਿੱਚ।\n5. **ਕੇਵਾਈਸੀ**: ਕੇਸੀਸੀ ਕਾਰਡ ਜਾਂ ਆਧਾਰ ਨਾਲ ਪੱਕਾ ਗ੍ਰੀਨ ਬੈਜ।`;
        } else if (language === 'mr') {
          aiResponseText = `🌾 **शेतकरी नोंदणी व शेतमाल विक्री प्रक्रिया**:\n1. **मोबाईल ओटीपी**: तात्काळ सुरक्षित लॉगिन.\n2. **शेतकरी माहिती**: पूर्ण नाव, गाव आणि जमीन क्षेत्र.\n3. **पीक लॉट नोंदणी**: पिकाचा फोटो, उपलब्ध क्विंटल व आर्द्रता.\n4. **थेट बँक खात्यात पैसे (DBT)**: वजन पूर्ण होताच 2 तासांत पैसे बँक खात्यात.\n5. **केवायसी पडताळणी**: केसीसी किंवा 7/12 उतारा द्वारे प्रमाणित शेतकरी बॅज.`;
        } else if (language === 'te') {
          aiResponseText = `🌾 **రైతు నమోదు మరియు పంట విక్రయ విధానం**:\n1. **మొబైల్ OTP**: తక్షణ SMS ధృవీకరణ.\n2. **రైతు వివరాలు**: పూర్తి పేరు, గ్రామం, సాగు విస్తీర్ణం.\n3. **పంట వివరాలు**: పంట ఫోటో, పరిమాణం మరియు తేమ శాతం.\n4. **బ్యాంక్ ఖాతా (DBT)**: తోట వద్ద తూకం కాగానే T+0 బ్యాంక్ బదిలీ.\n5. **KYC వెరిఫికేషన్**: KCC లేదా ఆధార్‌తో గ్రీన్ బ్యాడ్జ్.`;
        } else {
          aiResponseText = `🌾 **Farmer & FPO Onboarding & Crop Listing Process**:\n1. **Mobile OTP Verification**: Instant 1-click mobile authorization.\n2. **Farmer Profile**: Name, village, land holding (acres), and collective/FPO affiliation.\n3. **Harvest Batch Listing**: Upload crop variety, photos, available quintals, and moisture %.\n4. **Aadhaar Bank DBT**: Bank account & IFSC for instant T+0 settlement upon farmgate weighing.\n5. **KYC Trust Badge**: Upload Kisan Credit Card (KCC) or Aadhaar to get verified institutional priority.`;
        }
        actionObj = {
          label: t('hero.farmerSignupBtn', 'Open Farmer Registration Form'),
          onClick: () => {
            if (onOpenAuth) onOpenAuth('farmer');
            setIsOpen(false);
          }
        };
      }
      // 9. ESCROW & SECURE PAYMENTS
      else if (
        lower.includes('escrow') || lower.includes('payment') || lower.includes('safe') ||
        lower.includes('secure') || lower.includes('payout') || lower.includes('money') ||
        lower.includes('bank') || lower.includes('t+0') || lower.includes('guarantee') ||
        lower.includes('एस्क्रो') || lower.includes('भुगतान') || lower.includes('ਭੁਗਤਾਨ') ||
        lower.includes('पैसे') || lower.includes('చెల్లింపు')
      ) {
        if (language === 'hi') {
          aiResponseText = `🛡️ **खेत लिंक 100% एस्क्रो सुरक्षा गारंटी प्रणाली**:\n• **खरीदार सुरक्षा**: जब थोक खरीदार या हॉस्टल मेस ऑर्डर देती है, तो 100% राशि आरबीआई-विनियमित एस्क्रो ट्रस्ट खाते में जमा होती है।\n• **किसान को फंड गारंटी**: किसान को ट्रक रवाना करने से पूर्व फंड सुरक्षित होने का डिजिटल प्रमाणपत्र मिलता है।\n• **टी+0 त्वरित निपटान**: गंतव्य पर माल पहुंचते ही और वजन/नमी जांच होते ही 2 घंटे के भीतर सीधे किसान के बैंक खाते में भुगतान जारी किया जाता है।\n• **शून्य भुगतान चूक**: 42,000 से अधिक लॉट में शून्य भुगतान डिफ़ॉल्ट दर।`;
        } else if (language === 'pa') {
          aiResponseText = `🛡️ **ਖੇਤ ਲਿੰਕ 100% ਐਸਕਰੋ ਬੈਂਕ ਸੁਰੱਖਿਆ**:\n• ਆਰਡਰ ਬੁੱਕ ਹੁੰਦਿਆਂ ਹੀ ਪੂਰੀ ਰਕਮ RBI ਨਿਯਮਿਤ ਐਸਕਰੋ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ।\n• ਕਿਸਾਨ ਨੂੰ ਗੱਡੀ ਤੋਰਨ ਤੋਂ ਪਹਿਲਾਂ ਪੈਸੇ ਸੁਰੱਖਿਅਤ ਹੋਣ ਦੀ ਪੱਕੀ ਗਾਰੰਟੀ ਮਿਲਦੀ ਹੈ।\n• ਮਾਲ ਪਹੁੰਚਣ ਅਤੇ ਨਮੀ ਜਾਂਚ ਪਾਸ ਹੋਣ 'ਤੇ 2 ਘੰਟਿਆਂ ਅੰਦਰ ਸਿੱਧਾ ਕਿਸਾਨ ਦੇ ਖਾਤੇ ਵਿੱਚ T+0 ਪੈਸੇ ਪਹੁੰਚਦੇ ਹਨ।`;
        } else if (language === 'mr') {
          aiResponseText = `🛡️ **खेत लिंक 100% एस्क्रो हमी प्रणाली**:\n• खरेदीदाराची संपूर्ण रक्कम आरबीआय संरक्षित एस्क्रो खात्यात सुरक्षित ठेवली जाते.\n• माल शेतातून निघण्यापूर्वी शेतकऱ्याला बँक हमी मिळते.\n• माल पोहोचून लॅब तपासणी होताच 2 तासांच्या आत थेट शेतकऱ्याच्या बँक खात्यात T+0 पैसे जमा केले जातात.`;
        } else if (language === 'te') {
          aiResponseText = `🛡️ **ఖేత్ లింక్ 100% ఎస్క్రో భద్రతా హామీ**:\n• కొనుగోలుదారు మొత్తం ఆర్డర్ మొత్తాన్ని RBI నిబంధనల ప్రకారం ఎస్క్రోలో జమ చేస్తారు.\n• ట్రక్ బయలుదేరే ముందే రైతుకు నిధుల హామీ లభిస్తుంది.\n• డెలివరీ నిర్ధారణ అయిన వెంటనే 2 గంటల్లో నేరుగా రైతు బ్యాంక్ ఖాతాలో T+0 చెల్లింపు జరుగుతుంది.`;
        } else {
          aiResponseText = `🛡️ **Khet Link 100% Escrow Guarantee Protocol**:\n• **Buyer Vault Protection**: When an order is placed, 100% of the funds are deposited into an RBI-regulated escrow trust account.\n• **Farmer Dispatch Assurance**: Farmers receive cryptographic proof of secured funds before dispatching truckloads from their farmgate.\n• **Automated T+0 Settlement**: Once the consignment arrives and passes digital moisture/weight inspection, funds are released within 2 hours directly into the farmer's bank account.\n• **Zero Default Record**: 100% settlement rate maintained across 42,000+ lots.`;
        }
        actionObj = {
          label: t('nav.orders', 'Track Active Escrow Orders'),
          onClick: () => {
            if (onNavigate) onNavigate('order-tracking');
            setIsOpen(false);
          }
        };
      }
      // 10. LOGISTICS, COLD-CHAIN & TELEMETRY
      else if (
        lower.includes('logistics') || lower.includes('truck') || lower.includes('delivery') ||
        lower.includes('transport') || lower.includes('tracking') || lower.includes('telemetry') ||
        lower.includes('dispatch') || lower.includes('cold-chain') || lower.includes('reefer') ||
        lower.includes('वाहन') || lower.includes('ट्रक') || lower.includes('ਟਰਾਂਸਪੋਰਟ') ||
        lower.includes('वाहतूक') || lower.includes('రవాణా')
      ) {
        if (language === 'hi') {
          aiResponseText = `🚚 **कोल्ड-चेन वाहन व खेत से गोदाम तक लाइव ट्रैकिंग**:\n• **सीधा खेत से उठाव**: खेत पर ही इलेक्ट्रॉनिक तौल कांटा और गुणवत्ता जांच।\n• **20-टन एकत्रीकरण**: छोटे किसानों के माल को मिलाकर 20-टन बड़े ट्रकों में लोड किया जाता है जिससे भाड़ा 35% कम होता है।\n• **जीपीएस लाइव टेलीमेट्री**: तापमान और आर्द्रता सेंसर से लैस वाहन, ऐप पर लाइव लोकेशन ट्रैकिंग।\n• **डिलीवरी समय**: अंतर-राज्यीय दूरी अनुसार 48 से 72 घंटे में गंतव्य तक आपूर्ति।`;
        } else if (language === 'pa') {
          aiResponseText = `🚚 **ਕੋਲਡ-ਚੇਨ ਟਰੱਕ ਅਤੇ ਲਾਈਵ ਟਰੈਕਿੰਗ**:\n• **ਸਿੱਧਾ ਖੇਤੋਂ ਚੁਕਾਈ**: ਖੇਤ ਵਿੱਚ ਕੰਪਿਊਟਰਾਈਜ਼ਡ ਤੋਲ ਅਤੇ ਬਾਰਕੋਡ ਟੈਗਿੰਗ।\n• **20-ਟਨ ਪੂਲਿੰਗ**: ਛੋਟੇ ਕਿਸਾਨਾਂ ਦਾ ਮਾਲ ਇਕੱਠਾ ਕਰਕੇ ਟਰੱਕ ਭਰਿਆ ਜਾਂਦਾ ਹੈ, ਜਿਸ ਨਾਲ ਕਿਰਾਇਆ 35% ਘਟਦਾ ਹੈ।\n• **ਜੀਪੀਐਸ ਟੈਲੀਮੈਟਰੀ**: ਲਾਈਵ ਨਕਸ਼ੇ ਉੱਤੇ ਟਰੱਕ ਦੀ ਲੋਕੇਸ਼ਨ ਵੇਖੋ।`;
        } else if (language === 'mr') {
          aiResponseText = `🚚 **कोल्ड-चेन वाहतूक आणि लाइव्ह ट्रॅकिंग**:\n• **थेट शेतातून उचल**: शेतावरच डिजिटल वजन आणि लॅब तपासणी.\n• **20-टन एकत्रीकरण**: अल्पभूधारक शेतकऱ्यांचा माल एकत्र करून मोठ्या वाहनांतून पाठवल्याने भाडे 35% वाचते.\n• **जीपीएस टेलीमेट्री**: थेट मोबाईलवर वाहनाचे लाइव्ह लोकेशन.`;
        } else if (language === 'te') {
          aiResponseText = `🚚 **కోల్డ్-చైన్ రవాణా మరియు లైవ్ ఆర్డర్ ట్రాకింగ్**:\n• **తోట వద్దే రవాణా**: పొలంలోనే డిజిటల్ తూకం మరియు బార్‌కోడ్ ట్యాగింగ్.\n• **20-టన్నుల పూలింగ్**: రవాణా ఖర్చు 35% తగ్గుతుంది.\n• **GPS టెలిమెట్రీ**: ఉష్ణోగ్రత సెన్సార్లు మరియు రియల్-టైమ్ మ్యాప్ ట్రాకింగ్.`;
        } else {
          aiResponseText = `🚚 **Cold-Chain Logistics & Farmgate Telemetry Protocol**:\n• **Direct Farmgate Loading**: Produce is weighed on digital electronic scales at the farmgate with tamper-proof barcoding.\n• **20-Ton Lot Pooling**: Aggregates smallholder harvest to fill 20-ton logistics freights, reducing freight costs by 35%.\n• **IoT Telematics**: Fleet vehicles equipped with GPS and real-time temperature/humidity telemetry to prevent spoilage.\n• **Transit SLA**: Standard delivery guaranteed within 48 to 72 hours.`;
        }
        actionObj = {
          label: t('nav.orders', 'View Live Telemetry Map'),
          onClick: () => {
            if (onNavigate) onNavigate('order-tracking');
            setIsOpen(false);
          }
        };
      }
      // 11. FPO COLLECTIVE & SMALLHOLDER POOLING
      else if (
        lower.includes('fpo') || lower.includes('collective') || lower.includes('pool') ||
        lower.includes('pooling') || lower.includes('aggregate') || lower.includes('smallholder') ||
        lower.includes('marginal') || lower.includes('समूह') || lower.includes('ਸਮੂਹ') ||
        lower.includes('समिతి')
      ) {
        if (language === 'hi') {
          aiResponseText = `👥 **एफपीओ समूह एकत्रीकरण (5 एकड़ से कम जोत वाले किसान)**:\n• **समूह की ताकत**: 5 एकड़ से कम जोत वाले छोटे किसान अपनी फसल को एक साथ मिलाकर 20-टन की बड़ी खेप तैयार करते हैं।\n• **+18% अधिक भाव**: स्थानीय आढ़तियों के दबाव से मुक्त होकर बड़े कॉर्पोरेट खरीदारों से सीधे उच्च दर प्राप्त होती है।\n• **निःशुल्क परीक्षण**: एफपीओ केंद्र पर डिजिटल नमी परीक्षण और सॉर्टिंग की सुविधा।`;
        } else if (language === 'pa') {
          aiResponseText = `👥 **FPO ਕਿਸਾਨ ਇਕੱਠੀਕਰਨ ਅਤੇ ਪੂਲਿੰਗ**:\n• ਛੋਟੇ ਕਿਸਾਨ ਆਪਣੀ ਫਸਲ ਇਕੱਠੀ ਕਰਕੇ 20-ਟਨ ਟਰੱਕ ਲਾਟ ਬਣਾਉਂਦੇ ਹਨ।\n• ਸਥਾਨਕ ਵਿਚੋਲਿਆਂ ਤੋਂ ਛੁਟਕਾਰਾ ਪਾ ਕੇ +18% ਵੱਧ ਸਰਕਾਰੀ ਤੇ ਸੰਸਥਾਗਤ ਭਾਅ ਮਿਲਦਾ ਹੈ।`;
        } else if (language === 'mr') {
          aiResponseText = `👥 **एफपीओ शेतकरी एकत्रीकरण मंच**:\n• अल्पभूधारक शेतकरी आपले उत्पादन एकत्र करून 20-टन लॉट तयार करतात.\n• मध्यस्थांशिवाय +18% जास्त थेट भाव मिळतो.`;
        } else if (language === 'te') {
          aiResponseText = `👥 **FPO రైతు సమితి పూలింగ్**:\n• చిన్న రైతులు తమ పంటను పూల్ చేసి 20-టన్నుల పెద్ద లాట్లుగా విక్రయిస్తారు.\n• దళారుల ప్రభావం లేకుండా +18% ఎక్కువ ఆదాయం లభిస్తుంది.`;
        } else {
          aiResponseText = `👥 **FPO Collective Aggregation & Smallholder Pooling**:\n• **Volume Power**: Smallholders (< 5 acres) combine verified harvest volumes into 20-ton freight lots.\n• **+18% Price Premium**: Bypass village aggregators and deal directly with national food corporations and hostel chains.\n• **Free Quality Sorting**: FPO centers provide certified digital moisture assaying and hermetic packaging.`;
        }
        actionObj = {
          label: t('nav.fpoCollective', 'Explore FPO Collectives Directory'),
          onClick: () => {
            if (onNavigate) onNavigate('fpo-collective');
            setIsOpen(false);
          }
        };
      }
      // 12. HELPLINE, SUPPORT & QUERY DESK
      else if (
        lower.includes('help') || lower.includes('support') || lower.includes('helpline') ||
        lower.includes('query') || lower.includes('complaint') || lower.includes('issue') ||
        lower.includes('ticket') || lower.includes('problem') || lower.includes('contact') ||
        lower.includes('call') || lower.includes('phone') || lower.includes('सहायता') ||
        lower.includes('शिकायत') || lower.includes('ਮਦਦ') || lower.includes('సహాయం')
      ) {
        if (language === 'hi') {
          aiResponseText = `📞 **24x7 किसान व खरीदार सहायता डेस्क**:\n• **टोल-फ्री किसान कॉल सेंटर**: **1800-180-1551** (22 आधिकारिक भाषाओं में उपलब्ध)।\n• **ऑनलाइन शिकायत टिकट**: आप नीचे फुटर में जाकर 'सहायता चाहिए? अपनी समस्या दर्ज करें' फॉर्म भर सकते हैं।\n• **समाधान समय**: टिकट दर्ज होने के 2 घंटे के भीतर हमारे नोडल अधिकारी द्वारा आपसे संपर्क किया जाता है।`;
        } else if (language === 'pa') {
          aiResponseText = `📞 **24x7 ਕਿਸਾਨ ਅਤੇ ਖਰੀਦਦਾਰ ਸਹਾਇਤਾ ਡੈਸਕ**:\n• **ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ**: **1800-180-1551**.\n• **ਸ਼ਿਕਾਇਤ ਟਿਕਟ**: ਤੁਸੀਂ ਹੇਠਾਂ ਫੁੱਟਰ ਵਿੱਚ ਆਪਣਾ ਮੋਬਾਈਲ ਅਤੇ ਸਮੱਸਿਆ ਦਰਜ ਕਰਕੇ ਤੁਰੰਤ ਟਿਕਟ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ।\n• ਸਾਡੇ ਅਧਿਕਾਰੀ 2 ਘੰਟੇ ਅੰਦਰ ਸੰਪਰਕ ਕਰਨਗੇ।`;
        } else if (language === 'mr') {
          aiResponseText = `📞 **24x7 शेतकरी व खरेदीदार सहाय्यता कक्ष**:\n• **टोल-फ्री किसान कॉल सेंटर**: **1800-180-1551**.\n• **तक्रार निवारण**: फुटरमध्ये 'आपली तक्रार नोंदवा' फॉर्म भरून तात्काळ तिकीट मिळवा.\n• 2 तासांच्या आत नोडल अधिकाऱ्यांकडून संपर्क केला जाईल.`;
        } else if (language === 'te') {
          aiResponseText = `📞 **24x7 కిసాన్ మరియు కొనుగోలుదారుల సహాయ కేంద్రం**:\n• **టోల్-ఫ్రీ హెల్ప్‌లైన్**: **1800-180-1551**.\n• **ఆన్‌లైన్ ఫిర్యాదు**: ఫుటర్‌లోని విచారణ ఫారమ్‌ను సమర్పించి అధికారిక టిక్కెట్ పొందండి. 2 గంటల్లో పరిష్కారం ప్రారంభమవుతుంది.`;
        } else {
          aiResponseText = `📞 **24x7 Kisan & Buyer Dedicated Support Desk**:\n• **Toll-Free Helpline**: **1800-180-1551** (Available 24x7 in 22 regional Indian languages).\n• **Raise a Support Query**: You can submit a query right in our footer Helpdesk Desk with your mobile number and email to generate an official resolution ticket.\n• **Response SLA**: A designated nodal officer contacts you within 2 hours of ticket generation.`;
        }
        actionObj = {
          label: t('query.title', 'Scroll to Raise Support Query Desk'),
          onClick: () => {
            const el = document.getElementById('footer-query-helpdesk');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
          }
        };
      }
      // 13. MANDI RATES & GENERAL PRICE FORECAST
      else if (
        lower.includes('mandi') || lower.includes('rate') || lower.includes('price') ||
        lower.includes('msp') || lower.includes('forecast') || lower.includes('trend') ||
        lower.includes('cost') || lower.includes('bhav') || lower.includes('bhaav') ||
        lower.includes('भाव') || lower.includes('ਭਾਅ') || lower.includes('दर') ||
        lower.includes('ధర')
      ) {
        if (language === 'hi') {
          aiResponseText = `📊 **आज के लाइव मंडी व एमएसपी भाव (सीधा खेत)**:\n• **शरबती गेहूं**: ₹2,850/क्विंटल (सीहोर मंडी, म.प्र. - भारत सरकार MSP ₹2,275 से +₹210 अधिक)\n• **बासमती 1121**: ₹3,920/क्विंटल (करनाल मंडी, हरियाणा)\n• **पीली सरसों (42% तेल)**: ₹5,750/क्विंटल (अलवर, राजस्थान)\n• **देसी चना**: ₹5,400/क्विंटल (अकोला, महाराष्ट्र)\n\n💡 *एआई सुझाव*: आगामी त्योहारी मांग के कारण अगले महीने अनाज भाव में +4.8% की बढ़ोतरी संभावित है।`;
        } else if (language === 'pa') {
          aiResponseText = `📊 **ਅੱਜ ਦੇ ਲਾਈਵ ਮੰਡੀ ਤੇ ਐਮਐਸਪੀ ਭਾਅ (ਸਿੱਧਾ ਖੇਤ)**:\n• **ਸ਼ਰਬਤੀ ਕਣਕ**: ₹2,850/ਕੁਇੰਟਲ (ਸੀਹੋਰ - ਸਰਕਾਰੀ MSP ₹2,275 ਨਾਲੋਂ +₹210 ਵੱਧ)\n• **ਬਾਸਮਤੀ 1121**: ₹3,920/ਕੁਇੰਟਲ (ਕਰਨਾਲ, ਹਰਿਆਣਾ)\n• **ਪੀਲੀ ਸਰ੍ਹੋਂ (42% ਤੇਲ)**: ₹5,750/ਕੁਇੰਟਲ (ਅਲਵਰ, ਰਾਜਸਥਾਨ)\n• **ਦੇਸੀ ਛੋਲੇ**: ₹5,400/ਕੁਇੰਟਲ (ਅਕੋਲਾ, ਮਹਾਰਾਸ਼ਟਰ)\n\n💡 *ਏਆਈ ਸੁਝਾਅ*: ਅਗਲੇ ਮਹੀਨੇ ਕਣਕ ਦੇ ਭਾਅ ਵਿੱਚ +4.8% ਵਾਧੇ ਦਾ ਅਨੁਮਾਨ ਹੈ।`;
        } else if (language === 'mr') {
          aiResponseText = `📊 **आजचे थेट बाजार भाव आणि हमीभाव (MSP)**:\n• **शरबती गहू**: ₹2,850/क्विंटल (सीहोर - केंद्र हमीभावापेक्षा +₹210 जास्त)\n• **बासमती 1121**: ₹3,920/क्विंटल (कर्नाल)\n• **पिवळी मोहरी**: ₹5,750/क्विंटल (अलवर)\n• **देशी हरभरा**: ₹5,400/क्विंटल (अकोला, महाराष्ट्र)\n\n💡 *एआय विश्लेषण*: सणांच्या मागणीमुळे पुढील महिन्यात गव्हाचे दर +4.8% वाढण्याचा अंदाज आहे.`;
        } else if (language === 'te') {
          aiResponseText = `📊 **నేటి లైవ్ మార్కెట్ మరియు MSP ధరలు (రైతు క్షేత్రం నుండి)**:\n• **శర్బతి గోధుమలు**: ₹2,850/క్వింటా (సీహోర్ - ప్రభుత్వ MSP ₹2,275 కంటే +₹210 ఎక్కువ)\n• **బాస్మతి 1121**: ₹3,920/క్వింటా (కర్నాల్)\n• **ఆవాలు**: ₹5,750/క్వింటా\n• **దేశీ శనగలు**: ₹5,400/క్వింటా (అకోలా, మహారాష్ట్ర)\n\n💡 *AI సూచన*: పండుగల డిమాండ్ కారణంగా వచ్చే నెలలో గోధుమల ధరలు +4.8% పెరిగే అవకాశం ఉంది.`;
        } else {
          aiResponseText = `📊 **Current Live Mandi & MSP Spot Rates**:\n• **Sharbati Wheat**: ₹2,850/Qtl in Sehore, MP (+₹210 over GoI MSP ₹2,275).\n• **Basmati 1121**: ₹3,920/Qtl in Karnal, Haryana.\n• **Yellow Mustard (42% Oil)**: ₹5,750/Qtl in Alwar, Rajasthan.\n• **Desi Chana**: ₹5,400/Qtl in Akola, Maharashtra.\n\n💡 *AI Insight*: Wheat prices are projected to rise +4.8% next month ahead of festive demands. Farmers are advised to warehouse 40% stock for delayed liquidation.`;
        }
        actionObj = {
          label: t('nav.aiPredictions', 'View Full AI Predictions Dashboard'),
          onClick: () => {
            if (onNavigate) onNavigate('ai-predictions');
            setIsOpen(false);
          }
        };
      }
      // 14. DEFAULT CONTEXTUAL INTELLIGENT RESPONSE
      else {
        if (language === 'hi') {
          aiResponseText = `🌾 **आपके प्रश्न का उत्तर**:\nआपने पूछा: *"${text.trim()}"*\n\nखेत लिंक एक राष्ट्रीय सीधा कृषि मंच है, जहाँ:\n1. किसान और एफपीओ 0% बिचौलिया दलाली के साथ फसल सीधे थोक खरीदारों व कॉलेज हॉस्टल मेस को बेच सकते हैं।\n2. 100% एस्क्रो सुरक्षा द्वारा माल तुलते ही टी+0 बैंक भुगतान मिलता है।\n3. एआई मॉडल 10 वर्षों के मंडी डेटा अनुसार भाव पूर्वानुमान प्रदान करता है।\n\nक्या आप लाइव फसल लॉट देखना चाहते हैं या थोक खरीद कोटेशन पोस्ट करना चाहते हैं?`;
        } else if (language === 'pa') {
          aiResponseText = `🌾 **ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਜਵਾਬ**:\nਤੁਹਾਡਾ ਸਵਾਲ: *"${text.trim()}"*\n\nਖੇਤ ਲਿੰਕ 'ਤੇ ਕਿਸਾਨਾਂ ਅਤੇ FPO ਸਮੂਹਾਂ ਨੂੰ 0% ਆੜ੍ਹਤੀਆ ਕਮਿਸ਼ਨ ਨਾਲ 4,500+ ਪ੍ਰਮਾਣਿਤ ਖਰੀਦਦਾਰਾਂ ਅਤੇ ਹੋਸਟਲ ਮੈੱਸਾਂ ਤੱਕ ਸਿੱਧੀ ਪਹੁੰਚ ਮਿਲਦੀ ਹੈ।\n100% ਐਸਕਰੋ ਭੁਗਤਾਨ ਸੁਰੱਖਿਆ ਅਤੇ ਕੋਲਡ-ਚੇਨ ਵਾਹਨ ਉਪਲਬਧ ਹਨ। ਕੀ ਤੁਸੀਂ ਮੰਡੀ ਬਾਜ਼ਾਰ ਵੇਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?`;
        } else if (language === 'mr') {
          aiResponseText = `🌾 **आपल्या प्रश्नाचे उत्तर**:\nआपण विचारले: *"${text.trim()}"*\n\nखेत लिंकवर शेतकऱ्यांना आणि एफपीओ गटांना शून्य दलालीसह थेट 4,500+ खरेदीदारांशी जोडले जाते. येथे 100% एस्क्रो हमी आणि डिजिटल लॅब तपासणी उपलब्ध आहे. आपण शेतमाल लॉट्स पाहू इच्छिता की एआय अंदाज?`;
        } else if (language === 'te') {
          aiResponseText = `🌾 **మీ ప్రశ్నకు సమాధానం**:\nమీ ప్రశ్న: *"${text.trim()}"*\n\nఖేత్ లింక్‌లో రైతులకు 0% దళారీతనం లేకుండా 4,500+ కొనుగోలుదారులతో మరియు హాస్టల్ మెస్‌లతో ప్రత్యక్ష అనుసంధానం లభిస్తుంది. 100% ఎస్క్రో భద్రతతో తక్షణ T+0 చెల్లింపులు జరుగుతాయి. మీరు మార్కెట్‌ప్లేస్‌ను చూడాలనుకుంటున్నారా?`;
        } else {
          aiResponseText = `🌾 **Answering your question regarding** *"${text.trim()}"*:\n\nOn Khet Link, farmers and FPOs connect directly with 4,500+ verified institutional buyers and hostel messes with 0% middleman margin.\n• **Buyers** enjoy direct farmgate pricing with NABL lab assay certification and GST invoices.\n• **Farmers** receive guaranteed T+0 bank payouts secured by 100% RBI-regulated escrow.\n• **AI Intelligence** guides optimal selling windows based on 10-year APMC trends.\n\nWould you like to explore our live marketplace lots or check AI price forecasts?`;
        }
        actionObj = {
          label: t('nav.marketplace', 'Explore Marketplace Lots'),
          onClick: () => {
            if (onNavigate) onNavigate('marketplace');
            setIsOpen(false);
          }
        };
      }
    }

    const aiMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: aiResponseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionObj,
      isLiveGemini
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);

    if (autoSpeakEnabled) {
      speakMessage(aiMsg.text, aiMsg.id);
    }
  };

  return (
    <>
      {/* Viewport boundary area to keep KhetAI within screen bounds when dragging */}
      <div 
        ref={dragAreaRef} 
        className="fixed inset-2 sm:inset-4 pointer-events-none z-40 overflow-hidden" 
        aria-hidden="true" 
      />

      {/* 1. Floating AI Trigger Button (Movable & Draggable anywhere on screen) */}
      <motion.div 
        drag
        dragConstraints={dragAreaRef}
        dragMomentum={false}
        dragElastic={0.08}
        whileDrag={{ scale: 1.05 }}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 select-none flex flex-col items-end gap-2 touch-none cursor-grab active:cursor-grabbing"
        title="Click to open or drag to reposition anywhere on screen"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-end gap-2"
        >
          {/* Animated Friendly Speech Balloon */}
          {!isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
              onClick={handleOpen}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#0F3829] text-[11px] font-bold shadow-lg border border-emerald-200 cursor-pointer hover:bg-white transition"
            >
              <GripVertical className="w-3.5 h-3.5 text-emerald-600/70" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('ai.speechBubble', 'Need Mandi rates or Mess supply help?')}</span>
              <span className="text-amber-500 text-xs">✨</span>
            </motion.div>
          )}

          <motion.button
            id="khet-ai-assistant-toggle-btn"
            ref={toggleButtonRef}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleToggle}
            className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0F3829] via-[#1B523D] to-[#2D6A4F] text-white shadow-2xl border-2 border-[#52B788]/70 cursor-pointer group"
            aria-label="Toggle KhetAI Assistant"
          >
            {/* Animated Glowing Ring & Ping */}
            <span className="absolute -inset-1 rounded-full bg-[#52B788]/30 blur-sm group-hover:bg-[#52B788]/50 animate-pulse pointer-events-none" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0B2E21] animate-ping pointer-events-none" />
            
            {/* Drag Handle Gripper */}
            <GripVertical className="w-3.5 h-3.5 text-emerald-300/70 -ml-1 group-hover:text-emerald-100 transition" />

            <div className="relative w-8 h-8 rounded-full bg-[#52B788] flex items-center justify-center text-[#0B2E21] shadow-md font-bold">
              <Bot className="w-5 h-5 text-[#072118]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-[#0B2E21]" />
            </div>

            <div className="relative text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold tracking-wide font-['Outfit'] text-white">
                  {t('ai.name', 'KhetAI Sahayak')}
                </span>
                <span className="text-[9px] bg-amber-400 text-[#0B2E21] px-1.5 py-0.2 rounded font-black tracking-wider uppercase shadow-xs">
                  {t('ai.badge', 'AI 2.5')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/90 leading-none">
                {t('ai.subtitle', 'Mandi Rates & Mess Advisor')}
              </p>
            </div>

            {/* Sparkle Icon with Rotation / Glow */}
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0 ml-0.5" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 2. Expandable AI Chat Modal Window (Movable Anywhere on Screen via Header Drag) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`khet-chat-modal-${chatResetKey}`}
            ref={chatContainerRef}
            drag
            dragListener={false}
            dragControls={chatDragControls}
            dragConstraints={dragAreaRef}
            dragMomentum={false}
            dragElastic={0.08}
            initial={{ opacity: 0, y: 25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-2 bottom-18 top-16 sm:top-auto sm:inset-x-auto sm:bottom-22 sm:right-6 sm:w-[420px] sm:h-[560px] max-h-[calc(100dvh-80px)] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden font-['Plus_Jakarta_Sans']"
          >
            {/* Header - Drag Handle */}
            <div 
              onPointerDown={(e) => chatDragControls.start(e)}
              className="bg-gradient-to-r from-[#0B2E21] via-[#103D2D] to-[#18533B] text-white p-3 sm:p-3.5 flex items-center justify-between border-b border-[#1E523D] shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
              title="Click and drag to move anywhere on screen"
            >
              <div className="flex items-center gap-2">
                {/* Drag Handle Icon */}
                <div className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Move className="w-3.5 h-3.5" />
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#52B788] flex items-center justify-center text-[#0B2E21] shadow-md shrink-0">
                  <Bot className="w-5 h-5 text-[#072118]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white font-['Outfit']">
                      KhetAI Sahayak
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] text-emerald-200/90 bg-white/10 px-1.5 py-0.5 rounded border border-white/10 font-medium">
                      <span>{t('ai.moveable', 'Moveable')}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-200/80 line-clamp-1">
                    {t('ai.advisorSubtitle', 'Agri Advisor for Farmers, FPOs & Hostel Messes')}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons (Stop propagation so dragging isn't triggered) */}
              <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                {/* Gemini Live Indicator & Config Button */}
                <button
                  type="button"
                  onClick={() => {
                    setInputApiKey(getGeminiApiKey());
                    setShowKeyModal((prev) => !prev);
                  }}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                    isGeminiConnected 
                      ? 'text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 shadow-xs' 
                      : 'text-neutral-300 hover:text-white bg-white/10 hover:bg-white/20'
                  }`}
                  title={isGeminiConnected ? "Google Gemini 2.5 Live Active • Click to configure key" : "Offline Mode • Click to connect Gemini API key"}
                  aria-label="Gemini API Configuration"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeminiConnected ? 'text-amber-300 animate-pulse' : 'text-neutral-400'}`} />
                  <span className="hidden sm:inline">{isGeminiConnected ? 'Gemini Live' : 'Connect Gemini'}</span>
                </button>

                {/* Auto-Speech Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setAutoSpeakEnabled(!autoSpeakEnabled);
                  }}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                    autoSpeakEnabled 
                      ? 'text-amber-300 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 shadow-xs' 
                      : 'text-emerald-200/50 hover:text-emerald-200 hover:bg-white/10'
                  }`}
                  title={autoSpeakEnabled ? "Auto-Speech Enabled: Bot speaks answer aloud (बोलकर उत्तर दें)" : "Auto-Speech Muted (म्यूट)"}
                  aria-label="Toggle speech audio"
                >
                  {autoSpeakEnabled ? (
                    <Volume2 className={`w-3.5 h-3.5 text-amber-300 ${isSpeaking ? 'animate-pulse' : ''}`} />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                  <span className="hidden sm:inline">{autoSpeakEnabled ? 'आवाज़ ON' : 'म्यूट'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChatResetKey((prev) => prev + 1)}
                  className="p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Reset position to default corner"
                  aria-label="Reset window position"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-bar with Live AI Ticker & Language */}
            <div className="bg-[#082016] text-[10px] text-emerald-200/90 py-1.5 px-3 flex items-center justify-between border-b border-[#0F3627] shrink-0">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{t('ai.enamGrounded', 'e-NAM & Agmarknet Grounded')}</span>
              </span>
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 animate-pulse cursor-pointer hover:bg-amber-400/30"
                  title="Stop audio playback"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span>बोल रहे हैं... रोकें (Stop)</span>
                </button>
              ) : (
                <span className="text-neutral-400">English • हिन्दी • Hinglish</span>
              )}
            </div>

            {/* Gemini In-App Key Setup Drawer */}
            {showKeyModal && (
              <div className="p-3.5 sm:p-4 bg-white border-b border-neutral-200 space-y-2.5 animate-fadeIn shrink-0 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#1B2727]">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Google Gemini Live AI Setup</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Enter your Google Gemini API key to enable live AI responses. Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">Google AI Studio</a>. You can also set <code>VITE_GEMINI_API_KEY</code> in <code>.env.local</code>.
                </p>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#6B8E4E]"
                  />
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        saveGeminiApiKey(inputApiKey);
                        setIsGeminiConnected(hasGeminiApiKey());
                        setShowKeyModal(false);
                      }}
                      className="px-3.5 py-1.5 bg-[#3C5148] hover:bg-[#253630] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                    >
                      Save & Connect
                    </button>
                    {inputApiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          saveGeminiApiKey('');
                          setInputApiKey('');
                          setIsGeminiConnected(false);
                        }}
                        className="px-2.5 py-1.5 text-neutral-500 hover:text-red-600 text-xs font-medium transition cursor-pointer"
                      >
                        Clear Key
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAF9] text-xs">
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[88%] rounded-2xl p-3 leading-relaxed shadow-2xs ${
                      m.sender === 'user'
                        ? 'bg-[#18533B] text-white rounded-br-none'
                        : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'
                    }`}
                  >
                    {m.isLiveGemini && (
                      <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1.5 border border-emerald-200">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                        <span>Gemini 3.6 Flash Live</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line text-xs">{m.text}</p>

                    {/* AI Message Audio Playback & Timestamp Bar */}
                    {m.sender === 'ai' && (
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-100 text-[10px]">
                        <button
                          type="button"
                          onClick={() => speakMessage(m.text, m.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer font-bold ${
                            speakingMessageId === m.id
                              ? 'bg-amber-400 text-neutral-900 shadow-xs ring-1 ring-amber-500 animate-pulse'
                              : 'text-[#1B523D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60'
                          }`}
                          title={speakingMessageId === m.id ? "Stop voice (आवाज़ रोकें)" : "Listen to answer (उत्तर बोलकर सुनें)"}
                        >
                          {speakingMessageId === m.id ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>आवाज़ रोकें (Stop)</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-[#1B523D]" />
                              <span>सुनें (Listen)</span>
                            </>
                          )}
                        </button>
                        <span className="text-neutral-400 text-[9px] font-mono">{m.time}</span>
                      </div>
                    )}

                    {/* Optional Interactive CTA button */}
                    {m.action && (
                      <button
                        onClick={m.action.onClick}
                        className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-[#144231] hover:bg-[#1E5C45] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <span>{m.action.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    {/* Quick suggestion pills */}
                    {m.pills && (
                      <div className="mt-2.5 space-y-1.5 pt-2 border-t border-neutral-100">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Suggested Topics:
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {m.pills.map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickQuestion(p)}
                              className="text-left py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-medium transition flex items-center justify-between border border-emerald-200/60 cursor-pointer"
                            >
                              <span>{p}</span>
                              <ChevronRight className="w-3 h-3 text-emerald-600" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-neutral-400 mt-0.5 px-1">
                    {m.time}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs py-1 px-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">KhetAI is analyzing mandi data...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Listening Feedback Banner (When Voice is active) */}
            {isListening && (
              <div className="px-3.5 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-fadeIn shrink-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <span className="font-semibold text-[11px]">
                    {speechFeedback || t('ai.voiceListening', `Listening... Speak in ${currentLangOption.nativeLabel}`)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-2 py-0.5 rounded bg-rose-200 hover:bg-rose-300 text-rose-900 text-[10px] font-bold cursor-pointer transition"
                >
                  {t('ai.voiceDone', 'Done')}
                </button>
              </div>
            )}

            {/* Quick Prompt Chips */}
            <div className="px-3 py-1.5 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => handleQuickQuestion(
                  language === 'hi' ? "गेहूं का आज का मंडी भाव क्या चल रहा है?" :
                  language === 'pa' ? "ਅੱਜ ਕਣਕ ਦਾ ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?" :
                  language === 'mr' ? "गव्हाचा आजचा बाजार भाव काय आहे?" :
                  language === 'te' ? "గోధుమల నేటి మార్కెట్ ధర ఎంత?" :
                  "What are the wheat mandi rates today?"
                )}
                className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] text-neutral-600 font-medium transition cursor-pointer border border-neutral-200"
              >
                {t('ai.pillWheat', "🌾 Mandi Rates")}
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion(
                  language === 'hi' ? "हॉस्टल मेस के लिए सीधे किसानों से दाल-चावल कैसे खरीदें?" :
                  language === 'pa' ? "ਹੋਸਟਲ ਮੈੱਸ ਲਈ ਬਾਸਮਤੀ ਝੋਨਾ ਸਿੱਧਾ ਕਿਵੇਂ ਖਰੀਦੀਏ?" :
                  language === 'mr' ? "मेससाठी थेट शेतकऱ्यांकडून धान्य खरेदी कशी करावी?" :
                  language === 'te' ? "హాస్టల్ మెస్ కోసం నేరుగా రైతుల నుండి బియ్యం ఎలా కొనాలి?" :
                  "How can a hostel mess buy rice & dal in bulk?"
                )}
                className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] text-neutral-600 font-medium transition cursor-pointer border border-neutral-200"
              >
                {t('ai.pillMess', "🏢 Hostel Mess Buying")}
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion(
                  language === 'hi' ? "किसान पंजीकरण और बैंक खाते में सीधा भुगतान कैसे मिलेगा?" :
                  language === 'pa' ? "ਕਿਸਾਨ ਕੇਵਾਈਸੀ ਅਤੇ ਸਿੱਧਾ ਬੈਂਕ ਖਾਤਾ ਕਿਵੇਂ ਜੋੜੀਏ?" :
                  language === 'mr' ? "शेतकरी नोंदणी आणि थेट बँक खात्यात पैसे कसे मिळतील?" :
                  language === 'te' ? "రైతు రిజిస్ట్రేషన్ మరియు ఖాతాలో నగదు జమ ఎలా జరుగుతుంది?" :
                  "What documents does a farmer need for registration?"
                )}
                className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] text-neutral-600 font-medium transition cursor-pointer border border-neutral-200"
              >
                {t('ai.pillKyc', "📜 Farmer KYC")}
              </button>
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t('ai.inputPlaceholder', 'Ask mandi rates, hostel mess bulk buying, KYC...')}
                  className="flex-1 py-2 sm:py-2.5 px-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white text-neutral-800 placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#144231] hover:bg-[#1E5C45] disabled:opacity-40 text-white transition shadow-xs cursor-pointer shrink-0"
                  aria-label={t('ai.send', 'Send')}
                  title={t('ai.send', 'Send')}
                >
                  <Send className="w-4 h-4" />
                </button>

                {/* Voice to Type Converter just right side of send button */}
                <button
                  type="button"
                  id="voice-type-converter-btn"
                  onClick={toggleVoiceRecording}
                  className={`p-2 sm:p-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center shrink-0 relative ${
                    isListening 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-2 ring-rose-300' 
                      : 'bg-emerald-100 hover:bg-emerald-200 text-[#0F3829] border border-emerald-300/80'
                  }`}
                  aria-label={isListening ? t('ai.voiceDone', 'Stop Listening') : t('ai.voiceTyping', 'Voice to Type')}
                  title={isListening ? "Listening... Click to stop" : `${t('ai.voiceTyping', 'Voice to Type (Bol kar type karein)')}`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white animate-bounce" />
                  ) : (
                    <Mic className="w-4 h-4 text-emerald-800" />
                  )}
                  {isListening && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                  )}
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

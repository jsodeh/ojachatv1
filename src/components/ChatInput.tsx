import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ArrowUp, Loader2, Paperclip, AudioLines, Camera, Crown, Plus, Send, XCircle } from "lucide-react";
import { useAnimatedHints } from '@/hooks/use-animated-hints';
import { useLocation } from '@/hooks/use-location';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import MoreOptionsDialog from "./MoreOptionsDialog";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthWrapper } from '@/components/AuthWrapper';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useElevenLabs } from '@/providers/ElevenLabsProvider';
import { useToast } from "@/components/ui/use-toast";

// Attachment options menu component
const AttachmentMenu = ({ 
  isOpen, 
  onClose, 
  position,
  onSelectOption 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  position: { top: number; left: number } | null;
  onSelectOption: (option: string) => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (position) {
      setAdjustedPosition(position);
    } else {
      setAdjustedPosition(null);
    }
  }, [position]);

  useLayoutEffect(() => {
    if (position && modalRef.current) {
      const GAP = 4;
      const modalHeight = modalRef.current.offsetHeight;
      let top = position.top - modalHeight - GAP;
      if (top < 0) top = 0;
      setAdjustedPosition({ top, left: position.left });
    }
  }, [position, isOpen]);

  if (!isOpen || !adjustedPosition) return null;

  const handleOptionClick = (option: string) => {
    onSelectOption(option);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
      />
      <div 
        ref={modalRef}
        className="fixed z-50 w-52 bg-grok-light-secondary dark:bg-grok-dark-secondary rounded-lg shadow-lg border border-grok-light-border dark:border-grok-dark-border overflow-hidden"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left
        }}
      >
        <div className="p-1">
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('picture')}
          >
            <Camera className="h-4 w-4" />
            <span>Use Camera</span>
          </button>
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('gallery')}
          >
            <Paperclip className="h-4 w-4" />
            <span>Upload from Gallery</span>
          </button>
        </div>
      </div>
    </>
  );
};

interface ChatInputProps {
  onSend: (message: string, sessionId: string) => void;
  isLoading?: boolean;
  isLarge?: boolean;
  sessionId: string;
  key?: string;
  onAttachment: (option: string) => void;
  onOptionSelect: (option: string) => void;
}

const ChatInput = ({ onSend, isLoading = false, isLarge = false, sessionId, onAttachment, onOptionSelect }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [moreOptionsPosition, setMoreOptionsPosition] = useState<{ top: number; left: number } | null>(null);
  const [attachmentMenuPosition, setAttachmentMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const moreOptionsButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  
  // State for voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingIntervalId, setRecordingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [recordedText, setRecordedText] = useState<string | null>(null);

  // Refs for audio visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const { startAgentSession, stopAgentSession, transcriptAudio } = useElevenLabs();
  const { toast } = useToast();
  
  const { location } = useLocation();
  const { currentText } = useAnimatedHints({
    location: location?.area
  });

  // Get authentication state
  const { isAuthenticated, user } = useAuth();
  const authWrapper = useAuthWrapper();
  const { subscription } = useSubscription();
  const isPaidUser = subscription?.status === 'active';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      // Small delay to ensure the canvas is rendered
      setTimeout(() => {
        setupVisualizer();
      }, 50);
    } else if (!isRecording && canvasRef.current && !audioBlob) {
      drawInitialVisualizer();
    }
  }, [isRecording, audioBlob]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalId) {
        clearInterval(recordingIntervalId);
      }
    };
  }, [recordingIntervalId]);

  const setupAudioContext = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.smoothingTimeConstant = 0.4;
      analyserRef.current.fftSize = 512;
      analyserRef.current.minDecibels = -85;
      analyserRef.current.maxDecibels = -10;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      if (canvasRef.current) {
        visualize();
      }
    } catch (error: any) {
      setMicError(error.message || 'Failed to access microphone.');
      toast({
        title: "Microphone Error",
        description: error.message || 'Failed to access microphone.',
        variant: "destructive"
      });
      setIsRecording(false);
      throw error;
    }
  };

  const setupVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    // Wait for next frame to ensure canvas is rendered
    requestAnimationFrame(() => {
      setCanvasSize();
      visualize();
    });
    
    window.addEventListener('resize', setCanvasSize);
  };

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(freqData);
      
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
      drawVisualizer(ctx, freqData, WIDTH, HEIGHT);
    };
    
    draw();
  };
  
  const drawVisualizer = (ctx: CanvasRenderingContext2D, freqData: Uint8Array, width: number, height: number) => {
    const m = height / 2;
    const colors = [
      [18, 67, 32],
      [25, 97, 39],
      [46, 139, 87],
      [85, 239, 196]
    ];
    
    const opts = {
      fillOpacity: 0.8,
      lineWidth: 1.5,
      glow: 15,
      width: width / 20,
      amp: 2.5
    };
    
    for (let channel = 0; channel < colors.length; channel++) {
      const color = colors[channel];
      ctx.fillStyle = `rgba(${color}, ${opts.fillOpacity})`;
      ctx.strokeStyle = ctx.shadowColor = `rgb(${color})`;
      ctx.lineWidth = opts.lineWidth;
      ctx.shadowBlur = opts.glow;
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      const dataPoints = 8;
      const step = Math.floor(freqData.length / dataPoints);
      const xPoints = Array(15).fill(0).map((_, i) => (width / 15) * i);
      const yValues = Array(dataPoints).fill(0).map((_, i) => {
        const freqIndex = i * step;
        const scaleFactor = 1 - Math.abs(2 - i) / 4;
        return Math.max(10, m - (freqData[freqIndex] / 255) * m * scaleFactor * opts.amp);
      });
      
      ctx.moveTo(0, m);
      ctx.lineTo(xPoints[0], m);
      ctx.bezierCurveTo(xPoints[1], m, xPoints[2], yValues[0], xPoints[3], yValues[0]);
      ctx.bezierCurveTo(xPoints[4], yValues[0], xPoints[4], yValues[1], xPoints[5], yValues[1]);
      ctx.bezierCurveTo(xPoints[6], yValues[1], xPoints[6], yValues[2], xPoints[7], yValues[2]);
      ctx.bezierCurveTo(xPoints[8], yValues[2], xPoints[8], yValues[3], xPoints[9], yValues[3]);
      ctx.bezierCurveTo(xPoints[10], yValues[3], xPoints[10], yValues[4], xPoints[11], yValues[4]);
      ctx.bezierCurveTo(xPoints[12], yValues[4], xPoints[12], m, xPoints[13], m);
      ctx.lineTo(width, m);
      ctx.lineTo(xPoints[13], m);
      ctx.bezierCurveTo(xPoints[12], m, xPoints[12], height - yValues[4], xPoints[11], height - yValues[4]);
      ctx.bezierCurveTo(xPoints[10], height - yValues[4], xPoints[10], height - yValues[3], xPoints[9], height - yValues[3]);
      ctx.bezierCurveTo(xPoints[8], height - yValues[3], xPoints[8], height - yValues[2], xPoints[7], height - yValues[2]);
      ctx.bezierCurveTo(xPoints[6], height - yValues[2], xPoints[6], height - yValues[1], xPoints[5], height - yValues[1]);
      ctx.bezierCurveTo(xPoints[4], height - yValues[1], xPoints[4], height - yValues[0], xPoints[3], height - yValues[0]);
      ctx.bezierCurveTo(xPoints[2], height - yValues[0], xPoints[1], m, xPoints[0], m);
      ctx.lineTo(0, m);
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawInitialVisualizer = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Wait for next frame to ensure canvas is rendered
    requestAnimationFrame(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const fakeFreqData = new Uint8Array(128);
      for (let i = 0; i < fakeFreqData.length; i++) {
        fakeFreqData[i] = 20 + Math.sin(i / 10) * 10;
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      drawVisualizer(ctx, fakeFreqData, WIDTH, HEIGHT);
    });
  };

  const startRecording = async () => {
    if (!isAuthenticated) {
      authWrapper.showAuthModal();
      return;
    }

    setMicError(null);
    setAudioChunks([]);
    setRecordingDuration(0);
    setRecordedText(null);
    setAudioBlob(null);
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        // Transcribe audio
        try {
          const text = await transcriptAudio(audioBlob);
          setRecordedText(text);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          toast({
            title: "Transcription Error",
            description: "Failed to transcribe audio. Please try again.",
            variant: "destructive"
          });
          setRecordedText(null);
        }
      };

      recorder.start();
      setupAudioContext();
      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setRecordingIntervalId(intervalId);

    } catch (error: any) {
      setMicError(error.message || 'Failed to access microphone.');
      toast({
        title: "Microphone Error",
        description: error.message || 'Failed to access microphone.',
        variant: "destructive"
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (recordingIntervalId) {
      clearInterval(recordingIntervalId);
      setRecordingIntervalId(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordedText(null);
    setMessage("");
    setRecordingDuration(0);
    setAudioChunks([]);
    if (recordingIntervalId) {
      clearInterval(recordingIntervalId);
      setRecordingIntervalId(null);
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop(); // Ensure media recorder is stopped if it's active
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const handleVoiceMode = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      authWrapper.showAuthModal();
      return;
    }

    if (audioBlob && recordedText) {
      onSend(recordedText, sessionId); // Send the transcribed text
      deleteRecording(); // Clear the recording after sending
    } else if (message.trim()) {
      onSend(message, sessionId);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isRecording) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setMessage(text);
  };
  
  const handleOpenMoreOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      authWrapper.showAuthModal();
      return;
    }
    const MENU_HEIGHT = 220;
    const GAP = 8;
    const buttonRect = moreOptionsButtonRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const top = buttonRect.top + window.scrollY - MENU_HEIGHT - GAP;
      const left = buttonRect.left + window.scrollX;
      setMoreOptionsPosition({ top, left });
    } else {
      let top = e.clientY + window.scrollY - MENU_HEIGHT - GAP;
      if (top < 0) top = 0;
      const left = e.clientX + window.scrollX;
      setMoreOptionsPosition({ top, left });
    }
    setIsMoreOptionsOpen(true);
  };
  const handleOpenAttachmentMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      authWrapper.showAuthModal();
      return;
    }
    const MENU_HEIGHT = 100;
    const GAP = 8;
    const buttonRect = attachmentButtonRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const top = buttonRect.top + window.scrollY - MENU_HEIGHT - GAP;
      const left = buttonRect.left + window.scrollX;
      setAttachmentMenuPosition({ top, left });
    } else {
      let top = e.clientY + window.scrollY - MENU_HEIGHT - GAP;
      if (top < 0) top = 0;
      const left = e.clientX + window.scrollX;
      setAttachmentMenuPosition({ top, left });
    }
    setIsAttachmentMenuOpen(true);
    document.addEventListener('click', handleCloseAttachmentMenu);
  };
  
  const handleCloseAttachmentMenu = () => {
    setIsAttachmentMenuOpen(false);
    document.removeEventListener('click', handleCloseAttachmentMenu);
  };

  const handleAttachmentSelect = (option: string) => {
    console.log(`Selected attachment option: ${option}`);
    onAttachment(option);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const pad = (num: number) => num < 10 ? '0' + num : num;
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  return (
    <div className="relative w-full max-w-full md:max-w-[800px] md:w-[calc(100%-20px)] mx-auto">
      <div 
        className={`grok-input w-full text-base relative ${isRecording || audioBlob ? 'bg-grok-light-secondary dark:bg-grok-dark-secondary' : ''}`}
        style={{ minHeight: isLarge ? "140px" : "120px" }}
      >
        {isRecording || audioBlob ? (
          <div className="w-full h-full flex items-center px-4 py-2">
            {micError ? (
              <p className="text-red-500 text-sm">{micError}</p>
            ) : (
              <div className="w-full flex items-center gap-3">
                <div className="text-sm text-grok-light-text-secondary dark:text-grok-dark-text-secondary font-mono">
                  {formatDuration(recordingDuration)}
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <canvas ref={canvasRef} className="h-[30px] w-full max-w-[200px]"></canvas>
                </div>
              </div>
            )}
            {(isRecording || audioBlob) && (
              <button
                onClick={deleteRecording}
                className="absolute top-2 right-2 text-grok-light-text-secondary dark:text-grok-dark-text-secondary hover:text-red-500"
                aria-label="Delete recording"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <textarea
            rows={isLarge ? 4 : 3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Connecting to service..." : currentText || "What do you want to know?"}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            style={{ minHeight: isLarge ? "140px" : "120px" }}
            disabled={isLoading || isRecording}
          />
        )}
      </div>
      
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-grok-light-text-secondary dark:text-grok-dark-text-secondary z-10">
          <button 
            ref={attachmentButtonRef}
            onClick={handleOpenAttachmentMenu}
            className="p-2 rounded-full bg-grok-light-button-bg dark:bg-grok-dark-button-bg border border-grok-light-border dark:border-grok-dark-border hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover mt-[2px]"
          >
            <Camera className="h-5 w-5" />
          </button>
          <button 
            onClick={handleVoiceMode}
            className="p-2 rounded-full bg-grok-light-button-bg dark:bg-grok-dark-button-bg border border-grok-light-border dark:border-grok-dark-border hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover mt-[2px]"
          >
            <AudioLines className="h-5 w-5" />
          </button>
          <button 
            ref={moreOptionsButtonRef}
            onClick={handleOpenMoreOptions}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white border border-grok-light-border dark:border-grok-dark-border cursor-pointer hover:opacity-90 transition-opacity mt-[2px]"
            style={{
              background: "linear-gradient(135deg, #12b76a 0%, #16a34a 50%, #15803d 100%)"
            }}
          >
            {isPaidUser ? (
              <Plus className="h-5 w-5" />
            ) : (
              <Crown className="h-5 w-5 text-yellow-500" />
            )}
            {!isMobile && <span className="text-sm font-medium">Do More</span>}
          </button>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-grok-blue" />
        ) : (
          <Button
            onClick={handleSubmit}
            className={`w-10 h-10 min-w-10 min-h-10 p-0 rounded-full ${!message.trim() && !audioBlob ? 'bg-grok-light-secondary dark:bg-grok-dark-secondary shadow-send-button-inactive' : 'bg-grokGreen-dark hover:bg-grokGreen-light shadow-send-button-active'}`}
            aria-label="Send message"
            disabled={!message.trim() && !audioBlob}
          >
            <Send className={`h-5 w-5 ${!message.trim() && !audioBlob ? 'text-grok-light-text-secondary dark:text-grok-dark-text-secondary' : 'text-white'}`} />
          </Button>
        )}
      </div>
      <MoreOptionsDialog
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        position={moreOptionsPosition}
      />
      <AttachmentMenu 
        isOpen={isAttachmentMenuOpen}
        onClose={handleCloseAttachmentMenu}
        position={attachmentMenuPosition}
        onSelectOption={handleAttachmentSelect}
      />
    </div>
  );
};

export default ChatInput;

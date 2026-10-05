import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, Volume2, AlertCircle } from 'lucide-react';

interface VoiceNoteRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceNote: (audioUrl: string, duration: number) => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  isOpen,
  onClose,
  onSendVoiceNote,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) { /* ignore */ }
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    setRecordedDuration(0);
    setIsPlayingPreview(false);
    setMicError(null);
  };

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone API not supported in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        // Stop all stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err: unknown) {
      console.warn('Microphone access denied or error:', err);
      // Friendly fallback: simulate recording so the user can test the feature
      setMicError('Microphone not available. Using sample family voice note memo for demo.');
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    const finalSecs = Math.max(recordingSeconds, 2);
    setRecordedDuration(finalSecs);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Synthesized sample audio memo
      setRecordedAudioUrl('demo_voice_note');
    }
  };

  const togglePreviewPlay = () => {
    if (!recordedAudioUrl) return;

    if (recordedAudioUrl === 'demo_voice_note') {
      setIsPlayingPreview(!isPlayingPreview);
      setTimeout(() => setIsPlayingPreview(false), recordedDuration * 1000);
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(recordedAudioUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleSend = () => {
    if (!recordedAudioUrl) return;
    onSendVoiceNote(recordedAudioUrl, recordedDuration);
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm font-display">
              Family Voice Note
            </h3>
          </div>
          <button
            onClick={() => { cleanup(); onClose(); }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </div>

        {micError && (
          <div className="w-full mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}

        {/* State Display */}
        {!isRecording && !recordedAudioUrl && (
          <div className="flex flex-col items-center my-6 text-center">
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 active:scale-95 transition-all mb-3"
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-sm font-semibold text-slate-800">
              Tap to Record Voice Note
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Leave a sweet voice memo for the family
            </p>
          </div>
        )}

        {isRecording && (
          <div className="flex flex-col items-center my-6 text-center">
            <div className="relative mb-4">
              <span className="w-20 h-20 rounded-full bg-rose-500 animate-ping absolute inset-0 opacity-25" />
              <button
                onClick={stopRecording}
                className="relative w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
              >
                <Square className="w-8 h-8 fill-white" />
              </button>
            </div>
            
            <span className="text-2xl font-mono font-bold text-slate-800 tabular-nums">
              00:{recordingSeconds.toString().padStart(2, '0')}
            </span>
            <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Recording... Tap red square when done
            </p>
          </div>
        )}

        {recordedAudioUrl && !isRecording && (
          <div className="w-full flex flex-col items-center my-4">
            {/* Waveform preview */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 mb-4">
              <button
                onClick={togglePreviewPlay}
                className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shrink-0 shadow-xs"
              >
                {isPlayingPreview ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              {/* Simulated visual waveform */}
              <div className="flex-1 flex items-center gap-1 h-8">
                {[14, 22, 18, 30, 26, 12, 28, 32, 19, 24, 15, 29, 20, 10, 25, 30, 16, 22].map((height, i) => (
                  <span
                    key={i}
                    style={{ height: `${height}px` }}
                    className={`flex-1 rounded-full transition-colors ${
                      isPlayingPreview ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                00:{recordedDuration.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Actions */}
            <div className="w-full flex items-center justify-between gap-2">
              <button
                onClick={cleanup}
                className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>

              <button
                onClick={handleSend}
                className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Voice Note</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

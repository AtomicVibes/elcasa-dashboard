'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Send, Mic, Square, Play, Trash2, MessageSquare, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Tab = 'text' | 'audio';

interface CommunicationModalProps {
  open: boolean;
  onClose: () => void;
  recipientName: string;
  recipientId?: string | number;
  projectId?: string | number;
}

const MAX_RECORDING_SECONDS = 60;

export default function CommunicationModal({
  open,
  onClose,
  recipientName,
  recipientId,
  projectId,
}: CommunicationModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveTab('text');
      setMessage('');
      setSent(false);
      setError('');
      setRecordedBlob(null);
      setRecordedUrl(null);
      setRecording(false);
      setRecordingSeconds(0);
      cleanupRecording();
    }
  }, [open]);

  const cleanupRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
  }, [recordedUrl]);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone permission and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  };

  const playPreview = () => {
    if (!audioRef.current || !recordedUrl) return;
    audioRef.current.src = recordedUrl;
    audioRef.current.onended = () => setPlaying(false);
    audioRef.current.play();
    setPlaying(true);
  };

  const discardRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!user) return;
    setSending(true);
    setError('');

    try {
      if (activeTab === 'text') {
        if (!message.trim()) {
          setError('Please enter a message.');
          setSending(false);
          return;
        }
        const { error: insertError } = await supabase.from('messages').insert({
          sender_id: user.id,
          recipient_id: recipientId ?? null,
          recipient_name: recipientName,
          project_id: projectId ?? null,
          content: message.trim(),
          type: 'text',
        });
        if (insertError) throw insertError;
      } else {
        if (!recordedBlob) {
          setError('Please record an audio message first.');
          setSending(false);
          return;
        }
        const fileName = `audio/${user.id}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from('audio-messages')
          .upload(fileName, recordedBlob, { contentType: 'audio/webm' });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('audio-messages').getPublicUrl(fileName);

        const { error: insertError } = await supabase.from('messages').insert({
          sender_id: user.id,
          recipient_id: recipientId ?? null,
          recipient_name: recipientName,
          project_id: projectId ?? null,
          content: urlData?.publicUrl ?? fileName,
          type: 'audio',
        });
        if (insertError) throw insertError;
      }

      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-50 pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white dark:bg-[#1c1b1b] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col max-h-[90vh] pointer-events-auto shadow-2xl shadow-black"
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Message {recipientName}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 rounded-lg transition">
              <X className="w-5 h-5 text-zinc-600 dark:text-[#8e8e8e] hover:text-zinc-900 dark:hover:text-white" />
            </button>
          </div>

          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'text'
                  ? 'text-[#FFB800] border-b-2 border-[#FFB800]'
                  : 'text-zinc-500 dark:text-[#8e8e8e] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'audio'
                  ? 'text-[#FFB800] border-b-2 border-[#FFB800]'
                  : 'text-zinc-500 dark:text-[#8e8e8e] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              Audio
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-zinc-900 dark:text-white font-semibold">Message sent!</p>
              </div>
            ) : activeTab === 'text' ? (
              <div className="space-y-3">
                <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] uppercase block">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write a message to ${recipientName}...`}
                  rows={5}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-900 dark:text-white placeholder-neutral-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all resize-none"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-[#8e8e8e] uppercase block">
                  Audio Message
                </label>

                {!recording && !recordedBlob && (
                  <button
                    onClick={startRecording}
                    className="w-full flex items-center justify-center gap-3 py-6 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#FFB800]/50 dark:hover:border-[#FFB800]/50 transition-colors bg-zinc-50 dark:bg-zinc-800/30"
                  >
                    <Mic className="w-6 h-6 text-zinc-500 dark:text-[#8e8e8e]" />
                    <span className="text-sm font-semibold text-zinc-600 dark:text-[#8e8e8e]">
                      Click to start recording (max {MAX_RECORDING_SECONDS}s)
                    </span>
                  </button>
                )}

                {recording && (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-2xl font-mono font-bold text-red-500">
                        {formatTime(recordingSeconds)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-red-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(recordingSeconds / MAX_RECORDING_SECONDS) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-all"
                    >
                      <Square className="w-4 h-4" fill="currentColor" />
                      Stop Recording
                    </button>
                  </div>
                )}

                {recordedBlob && !recording && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFB800]/10 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-[#FFB800]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            Recording ready
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-[#8e8e8e]">
                            {formatTime(recordingSeconds)} • {(recordedBlob.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={playPreview}
                          className="p-2.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all"
                        >
                          {playing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" fill="currentColor" />}
                        </button>
                        <button
                          onClick={discardRecording}
                          className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <audio ref={audioRef} className="hidden" />
              </div>
            )}
          </div>

          {error && (
            <div className="px-6 pb-2">
              <p className="text-xs text-red-500 font-semibold">{error}</p>
            </div>
          )}

          {!sent && (
            <div className="px-4 pt-4 pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b1b] flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 bg-[#B71C1C] text-[#212121] dark:text-[#FFEBEE] hover:opacity-90 transition-colors duration-200 border border-zinc-300 dark:border-zinc-700 px-5 py-3 rounded-xl text-sm font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={
                  sending ||
                  (activeTab === 'text' && !message.trim()) ||
                  (activeTab === 'audio' && !recordedBlob)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  sending || (activeTab === 'text' && !message.trim()) || (activeTab === 'audio' && !recordedBlob)
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-[#8e8e8e] cursor-not-allowed'
                    : 'bg-[#FFB800] text-neutral-950 hover:bg-[#E5A600] active:scale-[0.98] cursor-pointer'
                }`}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

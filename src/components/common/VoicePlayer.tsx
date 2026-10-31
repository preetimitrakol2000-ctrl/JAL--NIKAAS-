/**
 * Jal-Nikaas: Voice Player Component
 * Accessible, multilingual text-to-speech button for farmer and officer advisories
 */

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Pause, Play, Square, Loader2 } from 'lucide-react';
import { Language } from '../../types';
import { speechController, SpeechState } from '../../utils/speech';

interface VoicePlayerProps {
  text: string;
  language: Language;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'subtle';
  className?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  text,
  language,
  label,
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>({
    supported: true,
    speaking: false,
    paused: false,
    currentText: null,
    voiceName: null,
  });

  useEffect(() => {
    const unsubscribe = speechController.subscribe(setSpeechState);
    return () => unsubscribe();
  }, []);

  const isCurrentPlaying =
    speechState.speaking && speechState.currentText === text;
  const isCurrentPaused =
    isCurrentPlaying && speechState.paused;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying) {
      if (isCurrentPaused) {
        speechController.resume();
      } else {
        speechController.pause();
      }
    } else {
      speechController.speak(text, language);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechController.stop();
  };

  if (!speechState.supported) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    lg: 'px-4 py-2.5 text-sm font-bold gap-2',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const variantClasses = {
    primary: isCurrentPlaying
      ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm',
    secondary: isCurrentPlaying
      ? 'bg-amber-100 text-amber-900 border border-amber-300'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300',
    subtle: isCurrentPlaying
      ? 'text-amber-700 bg-amber-50'
      : 'text-emerald-700 hover:bg-emerald-50',
  };

  const buttonText = label
    ? label
    : isCurrentPlaying
    ? isCurrentPaused
      ? language === 'bn' ? 'চালু করুন' : language === 'hi' ? 'पुनः सुनें' : 'Resume Voice'
      : language === 'bn' ? 'শুনছেন (বিরতি দিন)' : language === 'hi' ? 'सुन रहे हैं (रोकें)' : 'Listening (Pause)'
    : language === 'bn' ? 'পরামর্শ শুনুন' : language === 'hi' ? 'सलाह सुनें' : 'Listen';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        title={isCurrentPlaying ? 'Pause / Resume Speech' : 'Listen to advisory in selected language'}
        className={`flex items-center justify-center rounded-lg transition-all active:scale-95 ${sizeClasses[size]} ${variantClasses[variant]}`}
      >
        {isCurrentPlaying ? (
          isCurrentPaused ? (
            <Play className={`${iconSizes[size]} fill-current`} />
          ) : (
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Pause className={`${iconSizes[size]}`} />
            </div>
          )
        ) : (
          <Volume2 className={`${iconSizes[size]}`} />
        )}
        <span>{buttonText}</span>
      </button>

      {isCurrentPlaying && (
        <button
          type="button"
          onClick={handleStop}
          title="Stop reading"
          className="rounded-lg p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
        </button>
      )}
    </div>
  );
};

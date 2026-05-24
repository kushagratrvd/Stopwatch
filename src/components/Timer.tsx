import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, BellRing, Plus, Minus } from 'lucide-react';
import { audioEngine } from '../utils/AudioEngine';

interface TimerProps {
  vibrationEnabled: boolean;
}

export const Timer: React.FC<TimerProps> = ({ vibrationEnabled }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(0);

  const [initialTimeMs, setInitialTimeMs] = useState<number>(5 * 60 * 1000);
  const [remainingTimeMs, setRemainingTimeMs] = useState<number>(5 * 60 * 1000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(true);

  const intervalRef = useRef<any>(null);
  const endTimeRef = useRef<number>(0);
  const remainingAtPauseRef = useRef<number>(5 * 60 * 1000);
  const lastSecTickRef = useRef<number>(0);

  const triggerVibrate = () => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const playClick = () => {
    audioEngine.playClick();
    triggerVibrate();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isAlarmActive) {
          dismissAlarm();
        } else {
          toggleStart();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, remainingTimeMs, isAlarmActive, initialTimeMs, isEditing]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      audioEngine.stopAlarm();
    };
  }, []);

  useEffect(() => {
    if (isEditing) {
      const ms = (hours * 3600 + minutes * 60 + seconds) * 1000;
      setInitialTimeMs(ms);
      setRemainingTimeMs(ms);
      remainingAtPauseRef.current = ms;
    }
  }, [hours, minutes, seconds, isEditing]);

  const toggleStart = () => {
    if (initialTimeMs <= 0) return;
    playClick();

    if (isRunning) {
      clearInterval(intervalRef.current);
      remainingAtPauseRef.current = remainingTimeMs;
      setIsRunning(false);
    } else {
      setIsEditing(false);
      setIsRunning(true);
      
      endTimeRef.current = Date.now() + remainingAtPauseRef.current;
      lastSecTickRef.current = Math.ceil(remainingAtPauseRef.current / 1000);

      intervalRef.current = setInterval(() => {
        const remaining = endTimeRef.current - Date.now();
        
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setTimeToZero();
        } else {
          setRemainingTimeMs(remaining);
          
          const roundedSec = Math.ceil(remaining / 1000);
          if (roundedSec <= 5 && roundedSec !== lastSecTickRef.current) {
            audioEngine.playTick();
            lastSecTickRef.current = roundedSec;
          }
        }
      }, 50);
    }
  };

  const setTimeToZero = () => {
    setRemainingTimeMs(0);
    setIsRunning(false);
    setIsAlarmActive(true);
    audioEngine.startAlarm();
    
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  };

  const resetTimer = () => {
    playClick();
    clearInterval(intervalRef.current);
    audioEngine.stopAlarm();
    setIsRunning(false);
    setIsAlarmActive(false);
    setIsEditing(true);
    
    setRemainingTimeMs(initialTimeMs);
    remainingAtPauseRef.current = initialTimeMs;
  };

  const dismissAlarm = () => {
    playClick();
    audioEngine.stopAlarm();
    setIsAlarmActive(false);
    setIsEditing(true);
    setRemainingTimeMs(initialTimeMs);
    remainingAtPauseRef.current = initialTimeMs;
  };

  const adjustValue = (type: 'h' | 'm' | 's', increment: boolean) => {
    playClick();
    if (type === 'h') {
      setHours(prev => {
        const val = increment ? prev + 1 : prev - 1;
        return Math.max(0, Math.min(99, val));
      });
    } else if (type === 'm') {
      setMinutes(prev => {
        const val = increment ? prev + 1 : prev - 1;
        if (val < 0) return 59;
        if (val > 59) return 0;
        return val;
      });
    } else if (type === 's') {
      setSeconds(prev => {
        const val = increment ? prev + 1 : prev - 1;
        if (val < 0) return 59;
        if (val > 59) return 0;
        return val;
      });
    }
  };

  const applyPreset = (h: number, m: number, s: number) => {
    playClick();
    if (isRunning || isAlarmActive) {
      clearInterval(intervalRef.current);
      audioEngine.stopAlarm();
      setIsRunning(false);
      setIsAlarmActive(false);
    }
    setIsEditing(true);
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  };

  const formatRemaining = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const s = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const m = totalMinutes % 60;
    const h = Math.floor(totalMinutes / 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      h: pad(h),
      m: pad(m),
      s: pad(s),
      hasHours: h > 0
    };
  };

  const formatted = formatRemaining(remainingTimeMs);

  const strokeDashoffset = initialTimeMs > 0
    ? 282.6 - (282.6 * remainingTimeMs) / initialTimeMs
    : 282.6;

  const presets = [
    { label: '1m', h: 0, m: 1, s: 0 },
    { label: '3m', h: 0, m: 3, s: 0 },
    { label: '5m', h: 0, m: 5, s: 0 },
    { label: '10m', h: 0, m: 10, s: 0 },
    { label: '15m', h: 0, m: 15, s: 0 },
    { label: '30m', h: 0, m: 30, s: 0 },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full py-2">
      <div className="w-full max-w-sm px-4 mt-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2 text-center">Quick Presets</span>
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.h, p.m, p.s)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 border ${
                hours === p.h && minutes === p.m && seconds === p.s && isEditing
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.25)]'
                  : 'glass-card border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center w-64 h-64 md:w-72 md:h-72 my-4">
        <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isAlarmActive 
            ? 'animate-pulse bg-rose-500/10 shadow-[0_0_50px_rgba(244,63,94,0.3)] border border-rose-500/30'
            : isRunning 
            ? 'shadow-[0_0_40px_rgba(59,130,246,0.15)] bg-blue-500/5 border border-blue-500/20' 
            : 'shadow-[0_0_20px_rgba(255,255,255,0.02)] bg-slate-900/40 border border-slate-800'
        }`} />

        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-slate-800/60 fill-none"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            className={`fill-none transition-all duration-100 ${
              isAlarmActive 
                ? 'stroke-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse' 
                : isRunning 
                ? 'stroke-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]' 
                : 'stroke-slate-600'
            }`}
            strokeWidth="2.5"
            strokeDasharray="282.6"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center w-full px-4">
          {isEditing ? (
            <div className="flex flex-col items-center select-none font-mono">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-3">Adjust Duration</span>
              <div className="flex items-center justify-center gap-2">
                <div className="flex flex-col items-center">
                  <button onClick={() => adjustValue('h', true)} className="p-1 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-900/40 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-3xl md:text-4xl font-extralight text-slate-200 w-12 text-center">
                    {String(hours).padStart(2, '0')}
                  </span>
                  <button onClick={() => adjustValue('h', false)} className="p-1 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-900/40 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-1">Hrs</span>
                </div>
                
                <span className="text-2xl text-slate-600 font-light mb-5">:</span>

                <div className="flex flex-col items-center">
                  <button onClick={() => adjustValue('m', true)} className="p-1 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-900/40 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-3xl md:text-4xl font-light text-slate-100 w-12 text-center">
                    {String(minutes).padStart(2, '0')}
                  </span>
                  <button onClick={() => adjustValue('m', false)} className="p-1 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-900/40 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-1">Min</span>
                </div>

                <span className="text-2xl text-slate-600 font-light mb-5">:</span>

                <div className="flex flex-col items-center">
                  <button onClick={() => adjustValue('s', true)} className="p-1 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-900/40 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-3xl md:text-4xl font-light text-slate-100 w-12 text-center">
                    {String(seconds).padStart(2, '0')}
                  </span>
                  <button onClick={() => adjustValue('s', false)} className="p-1 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-900/40 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-1">Sec</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center select-none font-mono">
              <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold mb-2 ${
                isAlarmActive ? 'text-rose-400 animate-pulse' : 'text-slate-500'
              }`}>
                {isAlarmActive ? 'Finished' : isRunning ? 'Remaining' : 'Paused'}
              </span>
              
              <div className="flex items-baseline justify-center">
                {formatted.hasHours && (
                  <>
                    <span className="text-4xl md:text-5xl font-light text-slate-100">{formatted.h}</span>
                    <span className="text-2xl text-slate-500 font-light mx-0.5">:</span>
                  </>
                )}
                <span className="text-5xl md:text-6xl font-light text-slate-100">{formatted.m}</span>
                <span className="text-2xl text-slate-500 font-light mx-0.5">:</span>
                <span className={`text-5xl md:text-6xl font-bold transition-colors duration-300 ${
                  isAlarmActive 
                    ? 'text-rose-500' 
                    : remainingTimeMs <= 5000 
                    ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                    : 'text-slate-100'
                }`}>
                  {formatted.s}
                </span>
              </div>
              
              {isAlarmActive && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider animate-bounce">
                  <BellRing className="w-4 h-4 stroke-[2.5]" />
                  <span>Time is Up!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 my-4 z-10 w-full max-w-sm px-4">
        {isAlarmActive ? (
          <button
            onClick={dismissAlarm}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 transition-all duration-300 active:scale-95 shadow-lg shadow-rose-500/20 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)] animate-pulse"
          >
            <Bell className="w-5 h-5 fill-current" />
            <span>Dismiss Alarm</span>
          </button>
        ) : (
          <>
            <button
              onClick={resetTimer}
              disabled={isEditing && hours === 0 && minutes === 0 && seconds === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-700 hover:border-rose-500/30 font-medium text-rose-400 glass-card hover:bg-rose-500/5 transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isEditing ? 'Clear' : 'Reset'}</span>
            </button>

            <button
              onClick={toggleStart}
              disabled={initialTimeMs <= 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 active:scale-95 shadow-lg disabled:opacity-40 disabled:pointer-events-none ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10 hover:shadow-amber-500/25 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10 hover:shadow-blue-500/25 drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

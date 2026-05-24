import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { audioEngine } from '../utils/AudioEngine';

interface StopwatchProps {
  vibrationEnabled: boolean;
}

export const formatTime = (ms: number) => {
  const totalCentiseconds = Math.floor(ms / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return {
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
      centiseconds: pad(centiseconds),
      full: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`
    };
  }
  return {
    hours: '',
    minutes: pad(minutes),
    seconds: pad(seconds),
    centiseconds: pad(centiseconds),
    full: `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`
  };
};

export const Stopwatch: React.FC<StopwatchProps> = ({ vibrationEnabled }) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  const intervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleStart();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetStopwatch();
      } else if (e.code === 'KeyL' || e.code === 'KeyS') {
        e.preventDefault();
        recordLap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, time, laps]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const triggerVibrate = () => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const toggleStart = () => {
    audioEngine.playClick();
    triggerVibrate();

    if (isRunning) {
      clearInterval(intervalRef.current);
      elapsedTimeRef.current = time;
      setIsRunning(false);
    } else {
      startTimeRef.current = Date.now() - elapsedTimeRef.current;
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    }
  };

  const resetStopwatch = () => {
    audioEngine.playClick();
    triggerVibrate();

    clearInterval(intervalRef.current);
    setTime(0);
    setIsRunning(false);
    setLaps([]);
    elapsedTimeRef.current = 0;
  };

  const recordLap = () => {
    if (!isRunning) return;
    audioEngine.playClick();
    triggerVibrate();

    setLaps([time, ...laps]);
  };

  const getLapDurations = () => {
    const durations: { index: number; duration: number }[] = [];
    for (let i = 0; i < laps.length; i++) {
      const nextTime = i === laps.length - 1 ? 0 : laps[i + 1];
      durations.push({
        index: i,
        duration: laps[i] - nextTime
      });
    }
    return durations;
  };

  const lapDurations = getLapDurations();
  
  let fastestLapIdx = -1;
  let slowestLapIdx = -1;

  if (lapDurations.length >= 2) {
    let min = Infinity;
    let max = -Infinity;
    lapDurations.forEach(ld => {
      if (ld.duration < min) {
        min = ld.duration;
        fastestLapIdx = ld.index;
      }
      if (ld.duration > max) {
        max = ld.duration;
        slowestLapIdx = ld.index;
      }
    });
  }

  const currentSecondMs = time % 1000;
  const strokeDashoffset = 282.6 - (282.6 * currentSecondMs) / 1000;

  const formatted = formatTime(time);

  return (
    <div className="flex flex-col items-center justify-between h-full py-2">
      <div className="relative flex items-center justify-center w-64 h-64 md:w-72 md:h-72 my-4">
        <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isRunning 
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
            className={`fill-none transition-all duration-75 ${
              isRunning ? 'stroke-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]' : 'stroke-slate-600'
            }`}
            strokeWidth="2.5"
            strokeDasharray="282.6"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center select-none font-mono">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-1">
            {isRunning ? 'Running' : 'Paused'}
          </span>
          <div className="flex items-baseline justify-center">
            {formatted.hours && (
              <>
                <span className="text-3xl md:text-4xl font-light text-slate-100">{formatted.hours}</span>
                <span className="text-xl md:text-2xl text-slate-400 font-light mx-0.5">:</span>
              </>
            )}
            <span className="text-5xl md:text-6xl font-extralight text-slate-500/80 w-[1.25em] text-right inline-block">
              {formatted.minutes[0]}
            </span>
            <span className="text-5xl md:text-6xl font-light text-slate-100 w-[1.25em] text-left inline-block">
              {formatted.minutes[1]}
            </span>
            
            <span className="text-3xl md:text-4xl text-slate-400 font-light mx-0.5">:</span>
            
            <span className="text-5xl md:text-6xl font-light text-slate-100 w-[1.25em] text-right inline-block">
              {formatted.seconds[0]}
            </span>
            <span className="text-5xl md:text-6xl font-light text-slate-100 w-[1.25em] text-left inline-block">
              {formatted.seconds[1]}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-center">
            <span className="text-xl md:text-2xl font-normal text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.3)]">
              .{formatted.centiseconds}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 my-4 z-10 w-full max-w-sm px-4">
        <button
          onClick={isRunning ? recordLap : resetStopwatch}
          disabled={time === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-medium transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
            isRunning 
              ? 'glass-card border-slate-700 hover:border-blue-500/30 text-blue-400 hover:bg-blue-500/5' 
              : 'glass-card border-slate-700 hover:border-rose-500/30 text-rose-400 hover:bg-rose-500/5'
          }`}
        >
          {isRunning ? (
            <>
              <Flag className="w-4 h-4" />
              <span>Lap</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </>
          )}
        </button>

        <button
          onClick={toggleStart}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 active:scale-95 shadow-lg ${
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
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col mt-2 px-2">
        <div className="flex justify-between items-center text-xs uppercase tracking-wider text-slate-500 px-4 pb-2 border-b border-slate-800">
          <span>Lap</span>
          <span className="flex-1 text-right pr-12">Split Time</span>
          <span>Cumulative</span>
        </div>
        
        <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1">
          {laps.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8 text-sm select-none">
              <Flag className="w-8 h-8 stroke-[1.5] opacity-20 mb-2" />
              <p>Lap recordings will appear here</p>
              <p className="text-xs text-slate-600 mt-1">Press Space to start, L to record laps</p>
            </div>
          ) : (
            laps.map((lapTime, i) => {
              const currentDuration = lapDurations[i].duration;
              const isFastest = i === fastestLapIdx;
              const isSlowest = i === slowestLapIdx;
              const lapNum = laps.length - i;

              return (
                <div
                  key={lapTime}
                  className={`flex justify-between items-center py-2.5 px-4 rounded-lg transition-all duration-300 font-mono text-sm ${
                    isFastest 
                      ? 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400' 
                      : isSlowest 
                      ? 'bg-rose-500/5 border border-rose-500/10 text-rose-400' 
                      : 'hover:bg-slate-900/40 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-semibold">#{String(lapNum).padStart(2, '0')}</span>
                    {isFastest && <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10">Fastest</span>}
                    {isSlowest && <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10">Slowest</span>}
                  </div>
                  <div className="flex-1 text-right pr-12 font-medium">
                    {formatTime(currentDuration).full}
                  </div>
                  <div className="text-slate-400">
                    {formatTime(lapTime).full}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

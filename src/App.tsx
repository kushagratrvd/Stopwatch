import React, { useState } from 'react';
import { Stopwatch } from './components/Stopwatch';
import { Timer } from './components/Timer';
import { audioEngine } from './utils/AudioEngine';
import { 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Keyboard, 
  Zap, 
  Clock, 
  Timer as TimerIcon 
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);

  const toggleSound = () => {
    const newState = !soundMuted;
    setSoundMuted(newState);
    audioEngine.muted = newState;
    
    if (!newState) {
      setTimeout(() => audioEngine.playClick(), 50);
    }
  };

  const toggleVibration = () => {
    setVibrationEnabled(!vibrationEnabled);
    if (!vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(30);
    }
    audioEngine.playClick();
  };

  const handleTabChange = (tab: 'stopwatch' | 'timer') => {
    setActiveTab(tab);
    audioEngine.playClick();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-4 bg-slate-950 bg-gradient-to-tr from-slate-950 via-zinc-950 to-slate-900 animate-bg-flow text-slate-100 overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md h-[680px] md:h-[720px] rounded-3xl glass-panel shadow-glass-glow flex flex-col p-5 md:p-6 z-10 overflow-hidden">
        
        <header className="flex justify-between items-center pb-4 border-b border-white/5 select-none">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.25)]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-slate-100 to-indigo-400">
                ChronoShift
              </h1>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.15em] leading-none mt-0.5">Time Laboratory</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg transition-all duration-300 ${
                soundMuted 
                  ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' 
                  : 'text-blue-400 bg-blue-500/10 border border-blue-500/10 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
              }`}
              title={soundMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleVibration}
              className={`p-2 rounded-lg transition-all duration-300 ${
                !vibrationEnabled 
                  ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' 
                  : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
              }`}
              title={vibrationEnabled ? "Disable Haptics" : "Enable Haptics"}
            >
              <Smartphone className={`w-4 h-4 ${vibrationEnabled ? 'animate-pulse' : ''}`} />
            </button>

            <button
              onClick={() => { audioEngine.playClick(); setShowCheatsheet(!showCheatsheet); }}
              className={`p-2 rounded-lg transition-all duration-300 ${
                showCheatsheet
                  ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </header>

        <nav className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 my-4 select-none relative">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.3)] ${
              activeTab === 'timer' ? 'left-[calc(50%+3px)]' : 'left-1.5'
            }`}
          />

          <button
            onClick={() => handleTabChange('stopwatch')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide transition-colors duration-300 z-10 ${
              activeTab === 'stopwatch' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 stroke-[2]" />
            <span>Stopwatch</span>
          </button>

          <button
            onClick={() => handleTabChange('timer')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-wide transition-colors duration-300 z-10 ${
              activeTab === 'timer' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TimerIcon className="w-4 h-4 stroke-[2]" />
            <span>Timer</span>
          </button>
        </nav>

        <main className="flex-1 min-h-0 relative">
          <div className="w-full h-full flex flex-col">
            {activeTab === 'stopwatch' ? (
              <Stopwatch vibrationEnabled={vibrationEnabled} />
            ) : (
              <Timer vibrationEnabled={vibrationEnabled} />
            )}
          </div>

          {showCheatsheet && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col justify-between z-20 transition-all duration-300 animate-pulse-subtle">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                  <Keyboard className="w-5 h-5" />
                  <span className="tracking-wide">Keyboard Hotkeys</span>
                </div>
                
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Control the time-lab tools swiftly using standard physical keyboard buttons from anywhere in the application.
                </p>

                <div className="space-y-3 font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-xs text-slate-400">Start / Pause</span>
                    <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-indigo-300 shadow">Space</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-xs text-slate-400">Reset / Clear</span>
                    <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-indigo-300 shadow">R</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-xs text-slate-400">Record Lap (Stopwatch)</span>
                    <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-indigo-300 shadow">L / S</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-xs text-slate-400">Dismiss Alarm (Timer)</span>
                    <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-indigo-300 shadow">Space</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { audioEngine.playClick(); setShowCheatsheet(false); }}
                className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white glass-card hover:bg-slate-900/60 transition-all duration-300"
              >
                Got It
              </button>
            </div>
          )}
        </main>
      </div>

      <div className="flex items-center justify-center gap-1 opacity-20 pointer-events-none select-none z-0">
        <div className="w-1 h-3 bg-blue-500 rounded-full sound-bar sound-bar-1" />
        <div className="w-1 h-5 bg-indigo-500 rounded-full sound-bar sound-bar-2" />
        <div className="w-1 h-8 bg-blue-400 rounded-full sound-bar sound-bar-3" />
        <div className="w-1 h-4 bg-indigo-400 rounded-full sound-bar sound-bar-4" />
        <div className="w-1 h-2 bg-blue-600 rounded-full sound-bar sound-bar-5" />
      </div>
    </div>
  );
};

export default App;

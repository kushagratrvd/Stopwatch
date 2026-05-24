# ChronoShift // Stopwatch & Timer

A premium, state-of-the-art Stopwatch and Timer application built with React, TypeScript, and Tailwind CSS. Featuring a space-themed glassmorphic dark mode, high-performance SVG animations, and a fully synthesized custom sound engine.

---

## ✨ Features

### ⏱️ High-Precision Stopwatch
- Accurate centisecond-level (MM:SS.CC) calculations built with time-differential offsets to prevent browser tab-throttling drift.
- Elegant, sweeping SVG progress ring animating relative to each passing second.
- Custom lap split capture table displaying individual durations and cumulative elapsed times.
- Automated Lap Analyzer highlighting the **Fastest** (emerald green) and **Slowest** (rose red) splits.

### ⏳ High-Fidelity Countdown Timer
- Instant presets (1m, 3m, 5m, 10m, 15m, 30m) for fast configuration.
- Precision adjustments with inline incremental buttons for Hours, Minutes, and Seconds.
- SVG radial countdown ring that drains from 100% to 0% in real-time.
- Audio ticks that play on every second of the final 5-second countdown.
- Bright flashing visual overlay with custom synthesized chime alarms on completion.

### 🔊 Pure Web Audio API Synthesizer
- Built-in physical sound waves (sine and triangle sweeps) generated directly through the browser's `AudioContext`.
- Tactile button clicks, warning second ticks, and dual-tone vibrato sirens without downloading external `.mp3` assets.
- Integrated quick toggles for global sound mute and device haptics/vibrations.

### ⌨️ Physical Keyboard Shortcuts
- Fully responsive hotkey listener to control the timer laboratory:
  - `Space`: Start / Pause time & Dismiss active alarms.
  - `R`: Reset / Clear inputs.
  - `L` or `S`: Record lap splits (in Stopwatch mode).
- Expandable on-screen cheatsheet modal helper.

---

## 🛠️ Technology Stack
- **Framework**: React 18
- **Bundler**: Vite + TypeScript
- **Styling**: Tailwind CSS (custom animations, radial gradients, glowing frosted-glass effects)
- **Icons**: Lucide React
- **Audio Node Engine**: Native Web Audio API

---

## 🚀 Getting Started

Follow these simple instructions to install dependencies and run the project locally on your host environment:

### 1. Prerequisites
Ensure you have Node.js and `pnpm` installed on your machine.

### 2. Installation
Navigate into the workspace and run the installer:
```bash
pnpm install
```

### 3. Start Development Server
Boot up the fast local development server:
```bash
pnpm run dev
```
Open your browser and navigate to the local address displayed (usually `http://localhost:5173`).

### 4. Build for Production
To generate a highly optimized static production bundle:
```bash
pnpm run build
```
The output directory will be created at `dist/`.

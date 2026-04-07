# Atlas of War — Global Conflict Visualizer

A cinematic, high-performance 3D spatial interface for exploring the historical timeline of human conflict. Built for researchers, historians, and educators, the **Atlas of War** provides a visceral, data-driven look at the geography and human cost of war across millennia.

## ✨ Features

### 1. Cinematic "Command Center" Experience
*   **The 3D Globe**: Built with GL-accelerated point clouds and custom WebGL shaders. 
*   **Dynamic Shockwaves (Sonar Rings)**: Every conflict manifests as a pulsating shockwave that scales in size and frequency based on casualty intensity.
*   **Cinematic Filter Layers**: A global vignette and scanline overlay reinforce the "Dossier Access" atmosphere.
*   **Casualty-Driven UI Glow**: The timeline panel pulses with a deep red aura during years of catastrophic loss.

### 2. High-Performance Data Architecture
*   **Summary/Detail Split**: Optimized for Cloud/Vercel deployment. The server dynamically prunes a 20,000+ line database, sending only essential metadata initially to ensure millisecond load times.
*   **On-Demand Archival Access**: Full historical descriptions and belligerent lists are fetched asynchronously only when a specific war is selected.

### 3. Integrated Research Tools
*   **The Dossier**: A detailed side-panel providing historical context, strategic outcomes, and combatant lists with staggered archival animations.
*   **Country Profile**: A territory-specific conflict registry that tracks the military history of any nation selected on the globe.
*   **Interactive Timeline**: Scrub through thousands of years of history, with statistics (nations, casualties) updating in real-time.

## 🛠 Technology Stack

*   **Framework**: [Next.js 15+](https://nextjs.org/) (React 19)
*   **Visuals**: [react-globe.gl](https://github.com/vasturiano/react-globe.gl) & [Three.js](https://threejs.org/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Styling**: Vanilla CSS with [TailwindCSS v4](https://tailwindcss.com/)

## 🚀 Getting Started

### Local Development

1. **Clone and Install**:
```bash
git clone https://github.com/Zion203/Atlas-of-war.git
cd Atlas-of-war
npm install
```

2. **Run Server**:
```bash
npm run dev
```

3. **Explore**:
Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

*   `src/app`: Next.js App Router and API endpoints. 
*   `src/components`: UI components including the Globe, Timeline, and Dossier panels.
*   `src/data`: The historical war database and narrative storyline definitions.
*   `src/store`: Global state for timeline scrubbing and selection management.

---

*Note: This application is a visualization tool. Historical casualty data is estimated based on archival records.*

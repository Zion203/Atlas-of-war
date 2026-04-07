'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Timeline from '@/components/Timeline';
import Dossier from '@/components/Dossier';
import SearchBar from '@/components/SearchBar';
import DisclaimerModal from '@/components/DisclaimerModal';
import BootSequence from '@/components/BootSequence';
import GlobeWrapper from '@/components/GlobeWrapper';
import ComparisonView from '@/components/ComparisonView';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import NarrativePanel from '@/components/NarrativePanel';
import CountryProfile from '@/components/CountryProfile';
import { useWarStore } from '@/store/useWarStore';

export default function Page() {
  const { setWars, isBooted, activeNarrative } = useWarStore();
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        const res = await fetch('/api/wars');
        if (res.ok) {
          const data = await res.json();
          setWars(data);
        }
      } catch (err) {
        console.error('Failed to load DB:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [setWars]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Cinematic Overlays */}
      <div className="ambient-vignette" />
      <div className="scanlines" />
      <div className="texture-overlay" />

      {/* Elegant Fade Reveal */}
      <BootSequence />

      {/* Main UI */}
      {!loading && (
        <main className="absolute inset-0">
          <GlobeWrapper />
          
          {isBooted && (
            <>
              <DisclaimerModal />
              <Header />
              <div className="flex flex-1 overflow-hidden relative">
                {!activeNarrative && <Sidebar />}
                
                <div className="flex-1 relative">
                  <GlobeWrapper />
                  {!activeNarrative && (
                    <>
                      <Timeline />
                      <Dossier />
                      <CountryProfile />
                      <ComparisonView />
                      <AnalyticsPanel />
                      <SearchBar />
                    </>
                  )}
                  <NarrativePanel />
                </div>
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
}

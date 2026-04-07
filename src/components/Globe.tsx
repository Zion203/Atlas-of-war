'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import GlobeGL from 'react-globe.gl';
import * as THREE from 'three';
import { useWarStore } from '@/store/useWarStore';
import { getActiveWars, getActiveCountries, getArcs, TYPE_COLORS } from '@/lib/utils';
import type { War } from '@/lib/types';

// Pre-define the custom editorial material to avoid recreating it on render
const customGlobeMaterial = new THREE.MeshStandardMaterial({
  color: 0x1c1c1f,
  roughness: 0.8,
  metalness: 0.1,
  emissive: 0x111111,
  emissiveIntensity: 0.5
});

export default function Globe() {
  const globeRef = useRef<any>(null);
  const { wars, currentYear, typeFilter, eraFilter, selectedWar, selectWar, comparedWars, activeNarrative, narrativeStepIndex } = useWarStore();
  const [geoData, setGeoData] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Load GeoJSON
  useEffect(() => {
    fetch('/countries.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data.features))
      .catch((err) => console.error('GeoJSON load error:', err));
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Camera focus on selection
  useEffect(() => {
    if (selectedWar && globeRef.current) {
      const arc = selectedWar.arcs[0];
      if (arc) {
        globeRef.current.pointOfView(
          { lat: arc.startLat, lng: arc.startLng, altitude: 1.5 },
          2000 // Slower, more deliberate motion
        );
      }
    }
  }, [selectedWar]);

  // Listen for custom phase focus events
  useEffect(() => {
    const handleFocus = (e: any) => {
      if (globeRef.current && e.detail) {
        globeRef.current.pointOfView(e.detail, 1500);
      }
    };
    window.addEventListener('globe-focus', handleFocus);
    return () => window.removeEventListener('globe-focus', handleFocus);
  }, []);

  const COMPARE_COLORS = ['#d15c5c', '#c9a270', '#5c9bd1', '#85b37e'];
  const isComparing = comparedWars.length > 0;
  
  const displayWars = useMemo(() => {
    // If a narrative is playing, suppress all background wars 
    if (activeNarrative) return [];

    if (isComparing) return comparedWars;
    
    // If a specific war is selected (Dossier open), ONLY highlight countries for that war
    if (selectedWar) return [selectedWar];
    
    // Otherwise, show all conflicts for the current year + filters
    return getActiveWars(wars, currentYear, typeFilter, eraFilter);
  }, [isComparing, comparedWars, wars, currentYear, typeFilter, eraFilter, selectedWar, activeNarrative]);

  const activeCountries = useMemo(() => getActiveCountries(displayWars), [displayWars]);
  const arcs = useMemo(() => getArcs(displayWars), [displayWars]);

  const impactRings = useMemo(() => {
    if (activeNarrative) {
      const step = activeNarrative.steps[narrativeStepIndex];
      // Optional chaining or checking if lat exists
      if (step && step.lat !== undefined && step.lng !== undefined) {
        return [step];
      }
      return [];
    }
    
    // Convert active war arcs into ring locations
    const rings: any[] = [];
    if (!isComparing && !selectedWar) {
      displayWars.forEach((w) => {
        if (w.arcs && w.arcs.length > 0) {
          // Just place a pulse at the primary start location to avoid overwhelming the view
          rings.push({ 
            lat: w.arcs[0].startLat, 
            lng: w.arcs[0].startLng, 
            color: TYPE_COLORS[w.type as keyof typeof TYPE_COLORS] || '#c9a270',
            radius: Math.min(10, 2 + (Math.log10(w.casualties || 1) / 2)),
            speed: 0.5 + (Math.log10(w.casualties || 1) / 10)
          });
        }
      });
    }
    return rings;
  }, [activeNarrative, narrativeStepIndex, displayWars, isComparing, selectedWar]);

  // Pre-calculate O(1) maps for polygon property lookups
  const comparedCountryColors = useMemo(() => {
    const map = new Map<string, { cap: string, stroke: string }>();
    if (isComparing) {
      comparedWars.forEach((w: War, i: number) => {
        w.countries.forEach((iso: string) => {
          map.set(iso, {
            cap: `${COMPARE_COLORS[i]}80`,
            stroke: `${COMPARE_COLORS[i]}E6`
          });
        });
      });
    }
    return map;
  }, [isComparing, comparedWars]);

  const countryToWarsMap = useMemo(() => {
    const map = new Map<string, War[]>();
    displayWars.forEach((w: War) => {
      w.countries.forEach((iso: string) => {
        if (!map.has(iso)) map.set(iso, []);
        map.get(iso)!.push(w);
      });
    });
    return map;
  }, [displayWars]);

  // Helper to safely extract ISO from Natural Earth data (which sometimes uses "-99" for France/Norway)
  const getIso = (d: any) => {
    let code = d.properties.ISO_A3;
    if (!code || code === '-99' || code === -99) {
      code = d.properties.ADM0_A3;
    }
    return code;
  };

  // Memoize Accessors to prevent react-globe.gl material tearing down and rebuilding on every render
  const getPolygonCapColor = useCallback((d: any) => {
    const iso = getIso(d);
    if (isComparing) {
      const colors = comparedCountryColors.get(iso);
      if (colors) return colors.cap;
      return 'rgba(35, 35, 38, 0.4)';
    }
    if (activeCountries.has(iso)) {
      const activeWarsForCountry = countryToWarsMap.get(iso);
      if (activeWarsForCountry && activeWarsForCountry.length > 0) {
        const hex = TYPE_COLORS[activeWarsForCountry[0].type] || '#d15c5c';
        return hex + '66'; // 40% opacity
      }
    }
    return 'rgba(35, 35, 38, 0.4)';
  }, [isComparing, comparedCountryColors, activeCountries, countryToWarsMap]);

  const getPolygonSideColor = useCallback((d: any) => {
    const iso = getIso(d);
    if (activeCountries.has(iso)) {
      const activeWarsForCountry = countryToWarsMap.get(iso);
      if (activeWarsForCountry && activeWarsForCountry.length > 0) {
        const hex = TYPE_COLORS[activeWarsForCountry[0].type as keyof typeof TYPE_COLORS] || '#d15c5c';
        return hex + '05'; // 2% opacity
      }
    }
    return 'rgba(230, 228, 223, 0.02)';
  }, [activeCountries, countryToWarsMap]);

  const getPolygonStrokeColor = useCallback((d: any) => {
    const iso = getIso(d);
    if (isComparing) {
      const colors = comparedCountryColors.get(iso);
      if (colors) return colors.stroke;
      return 'rgba(230, 228, 223, 0.05)';
    }
    if (activeCountries.has(iso)) {
      const activeWarsForCountry = countryToWarsMap.get(iso);
      if (activeWarsForCountry && activeWarsForCountry.length > 0) {
        const hex = TYPE_COLORS[activeWarsForCountry[0].type] || '#d15c5c';
        return hex + 'CC'; // 80% opacity
      }
    }
    return 'rgba(230, 228, 223, 0.05)';
  }, [isComparing, comparedCountryColors, activeCountries, countryToWarsMap]);

  const getPolygonLabel = useCallback((d: any) => {
    const iso = getIso(d);
    const name = d.properties.NAME || d.properties.ADMIN;
    const inWar = activeCountries.has(iso);
    const relevantWars = countryToWarsMap.get(iso) || [];

    if (!inWar) {
      return `
        <div class="globe-tooltip">
          <strong style="font-family: 'Playfair Display', serif; font-size: 14px; color: #e6e4df;">${name}</strong>
        </div>
      `;
    }

    return `
      <div class="globe-tooltip">
        <strong style="font-family: 'Playfair Display', serif; font-size: 14px; color: #e6e4df;">${name}</strong><br/>
        <span style="color: #d15c5c; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-top: 4px;">Active Interface</span>
        <span style="opacity:0.8; font-size: 11px;">${relevantWars.map(w => w.name).join('<br/>')}</span>
      </div>
    `;
  }, [activeCountries, countryToWarsMap]);

  const handlePolygonClick = useCallback((d: any) => {
    const iso = getIso(d);
    const name = d.properties.NAME || d.properties.ADMIN;
    
    // Find ALL wars this country has ever been in, not just the currently active ones
    const allRelevantWars = useWarStore.getState().wars.filter(w => w.countries.includes(iso));
    
    if (allRelevantWars.length > 0) {
      useWarStore.getState().selectCountry({ iso, name, wars: allRelevantWars });
    }
  }, []);

  const getArcColor = useCallback((d: any) => {
    if (isComparing) {
      const cIndex = comparedWars.findIndex((w: War) => w.id === d.war.id);
      if (cIndex !== -1) return COMPARE_COLORS[cIndex];
    }
    return TYPE_COLORS[d.war?.type as keyof typeof TYPE_COLORS] || '#c9a270'; 
  }, [isComparing, comparedWars, COMPARE_COLORS]);

  return (
    <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing overflow-hidden outline-none">
      <GlobeGL
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeMaterial={customGlobeMaterial}
        backgroundColor="rgba(26,26,28,0)" // Transparent, letting texture-overlay bleed through
        showAtmosphere={true}
        atmosphereColor="#2f3b52" // Deep moody dramatic glow
        atmosphereAltitude={0.2}  // Thicker atmosphere edge
        
        // Polygons (Countries)
        polygonsData={geoData}
        polygonAltitude={0.005} // Nearly flat to bypass heavy 3D extrusion geometry generation
        polygonCapColor={getPolygonCapColor}
        polygonSideColor={getPolygonSideColor}
        polygonStrokeColor={getPolygonStrokeColor}
        polygonLabel={getPolygonLabel}
        onPolygonClick={handlePolygonClick}

        // Arcs (Conflict Paths)
        arcsData={arcs}
        arcColor={getArcColor}
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={3000} // Slower, elegant paths
        arcStroke={0.5} // Thinner arcs
        arcAltitudeAutoScale={0.25}
        arcLabel={(d: any) => `
          <div class="globe-tooltip">
            <span style="font-family: 'Playfair Display', serif;">${d.label}</span>
          </div>
        `}
        
        // Setup Radar Shockwaves (Fast Shaders)
        ringsData={impactRings}
        ringColor={(d: any) => d.color || '#c9a270'} 
        ringMaxRadius={(d: any) => d.radius || 3}
        ringPropagationSpeed={(d: any) => d.speed || 0.8}
        ringRepeatPeriod={activeNarrative ? 1000 : 2500}
        
        onArcClick={(d: any) => selectWar(d.war)}
        
        // Setup materials
        onGlobeReady={() => {
          if (globeRef.current) {
            const controls = globeRef.current.controls();
            // Restrain the rotation. Interaction should drive it mostly.
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.15; // Very slow moving
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
          }
        }}
      />
    </div>
  );
}

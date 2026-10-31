/**
 * Jal-Nikaas: Farmer Interface - Local Drainage Map View
 * Simplified, intuitive map view showing farmer field and nearby canal outfall
 */

import React from 'react';
import { AgriculturalArea, LocationData, Language } from '../../types';
import { Map, MapPin, Compass, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface FarmerLocalMapViewProps {
  areas: AgriculturalArea[];
  selectedAreaId: string;
  onSelectArea: (areaId: string) => void;
  location: LocationData;
  language: Language;
}

export const FarmerLocalMapView: React.FC<FarmerLocalMapViewProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  location,
  language,
}) => {
  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0];

  const isBackflow = location.differentialLevelCm <= 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Map className="h-6 w-6 text-emerald-700" />
              <h2 className="text-xl font-black text-slate-900">
                {language === 'bn' ? 'স্থানীয় নিকাশী ও খালের মানচিত্র' : language === 'hi' ? 'स्थानीय जल निकासी एवं नहर मानचित्र' : 'Local Drainage & Canal Map'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'bn' ? 'আপনার জমির অবস্থান এবং খালের জল প্রবাহের পথ' : language === 'hi' ? 'आपके खेत की स्थिति एवं नहर के पानी का मार्ग' : 'Your agricultural plot location and canal discharge path'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-emerald-100 text-emerald-900 px-3 py-1 font-bold">
              {selectedArea.name}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="rounded-2xl border-2 border-slate-800 bg-[#0c1825] p-4 text-white shadow-md overflow-hidden relative min-h-[440px]">
        {/* Floating Area Switcher Chips */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 max-w-lg">
          {areas.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectArea(a.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                a.id === selectedArea.id
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {a.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Vector SVG Map */}
        <svg viewBox="0 0 1000 600" className="w-full h-auto min-h-[400px]">
          {/* Main River / Drainage System */}
          <path
            d="M 500,20 Q 480,180 440,320 T 400,580"
            fill="none"
            stroke="#0284c7"
            strokeWidth="24"
            opacity="0.85"
          />
          <text x="430" y="300" className="fill-sky-200 text-xs font-mono font-bold" transform="rotate(82 430 300)">
            MAIN DISCHARGE CANAL →
          </text>

          {/* Secondary Field Canals */}
          <path d="M 140,380 Q 280,390 440,320" fill="none" stroke="#38bdf8" strokeWidth="10" />
          <path d="M 780,240 Q 600,280 440,320" fill="none" stroke="#38bdf8" strokeWidth="8" />

          {/* Draw all Agricultural Areas with Highlight on Selected */}
          {areas.map((a) => {
            const isSelected = a.id === selectedArea.id;
            const pointsStr = a.svgPolygon.map(([x, y]) => `${x},${y}`).join(' ');

            return (
              <g
                key={a.id}
                onClick={() => onSelectArea(a.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <polygon
                  points={pointsStr}
                  fill={isSelected ? '#059669' : '#1e293b'}
                  fillOpacity={isSelected ? 0.75 : 0.4}
                  stroke={isSelected ? '#34d399' : '#475569'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                <text
                  x={a.svgPolygon[0][0] + 15}
                  y={a.svgPolygon[0][1] + 35}
                  className={`text-[12px] font-bold ${
                    isSelected ? 'fill-white' : 'fill-slate-400'
                  }`}
                >
                  {a.name}
                </text>
              </g>
            );
          })}

          {/* Sluice Gate Indicator */}
          <g transform="translate(435, 312)">
            <rect x="-10" y="-10" width="20" height="20" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            <text x="16" y="5" className="fill-amber-300 text-[11px] font-mono font-bold">
              Sluice Outfall Gate
            </text>
          </g>

          {/* Direction indicator */}
          {isBackflow ? (
            <g transform="translate(300, 370)">
              <line x1="40" y1="0" x2="-20" y2="0" stroke="#f59e0b" strokeWidth="4" />
              <polygon points="-15,-6 -30,0 -15,6" fill="#f59e0b" className="animate-pulse" />
              <text x="-90" y="-10" className="fill-amber-300 text-xs font-mono font-bold">
                ⚠️ CANAL WATER FLOWING IN
              </text>
            </g>
          ) : (
            <g transform="translate(250, 370)">
              <line x1="-20" y1="0" x2="40" y2="0" stroke="#10b981" strokeWidth="4" />
              <polygon points="35,-6 50,0 35,6" fill="#10b981" />
              <text x="-15" y="-10" className="fill-emerald-300 text-xs font-mono font-bold">
                ✓ NORMAL FIELD OUTFLOW →
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-slate-300 space-y-1.5 backdrop-blur-sm">
          <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-1">
            {language === 'bn' ? 'মানচিত্র নির্দেশিকা' : language === 'hi' ? 'मानचित्र संकेत' : 'Map Legend'}
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-5 rounded bg-emerald-600 inline-block"></span>
            <span>{language === 'bn' ? 'আপনার নির্বাচিত জমি' : language === 'hi' ? 'आपका चयनित खेत' : 'Your Selected Field Area'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-5 rounded bg-sky-400 inline-block"></span>
            <span>{language === 'bn' ? 'জলনিকাশী খাল' : language === 'hi' ? 'जल निकासी नहर' : 'Drainage Canal'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 inline-block"></span>
            <span>{language === 'bn' ? 'স্লুইস গেট' : language === 'hi' ? 'स्लूस गेट' : 'Sluice Outfall Gate'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

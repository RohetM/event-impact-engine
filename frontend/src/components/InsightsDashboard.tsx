"use client";

import { Activity, AlertTriangle, TrendingUp, Users, Map, Clock, Info, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

interface InsightsDashboardProps {
  data: any;
}

export default function InsightsDashboard({ data }: InsightsDashboardProps) {
  const [typedSummary, setTypedSummary] = useState("");
  const [typeIndex, setTypeIndex] = useState(0);

  useEffect(() => {
    // Reset typing state when new data arrives
    setTypedSummary("");
    setTypeIndex(0);
  }, [data?.executive_summary?.overallSummary]);

  useEffect(() => {
    const fullText = data?.executive_summary?.overallSummary || '';
    if (typeIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedSummary((prev) => prev + fullText[typeIndex]);
        setTypeIndex((prev) => prev + 1);
      }, 15);
      return () => clearTimeout(timeout);
    }
  }, [typeIndex, data?.executive_summary?.overallSummary]);

  if (!data?.executive_summary) return null;

  const { event_analysis, sector_mapping, predictions, executive_summary: insights } = data;

  // 1. Market Sentiment Calculation
  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;

  if (Array.isArray(sector_mapping)) {
     sector_mapping.forEach((s: any) => {
       const sentiment = s.sentiment?.toLowerCase() || '';
       if (sentiment === 'bullish') bullishCount++;
       else if (sentiment === 'bearish') bearishCount++;
       else neutralCount++; 
     });
  }

  let overallSentiment = { label: "NEUTRAL",  text: "text-amber-500", border: "border-amber-500/30" };
  if (bullishCount > bearishCount) {
     overallSentiment = { label: "BULLISH", text: "text-emerald-500", border: "border-emerald-500/30" };
  } else if (bearishCount > bullishCount) {
     overallSentiment = { label: "BEARISH", text: "text-rose-500", border: "border-rose-500/30" };
  }

  // 2. Risk Meter Calculation
  const confidence = predictions?.confidence_score || 50;
  const riskValue = 100 - confidence;
  
  const getRiskStyle = (risk: number) => {
    if (risk > 70) return { text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30", label: "CRITICAL RISK" };
    if (risk >= 40) return { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "ELEVATED RISK" };
    return { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "STABLE / LOW RISK" };
  };
  const riskStyle = getRiskStyle(riskValue);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in font-mono">
      
      {/* ROW 1: Top Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Event Summary Card */}
        <div className="terminal-card flex flex-col">
          <div className="flex justify-between items-center mb-5 border-b border-slate-700/80 pb-3">
             <span className="text-slate-400 text-[11px] tracking-widest uppercase">Event Profile</span>
             <Info className="w-4 h-4 text-slate-500 focus-ring" />
          </div>
          <div className="flex-1 text-slate-300 text-xs space-y-3 uppercase tracking-wide">
             <p className="flex"><span className="text-slate-500 w-20 shrink-0">CATEGORY</span> <span className="font-semibold text-emerald-400 truncate">{event_analysis?.category || 'N/A'}</span></p>
             <p className="flex"><span className="text-slate-500 w-20 shrink-0">WHO</span> <span className="font-semibold text-slate-200 truncate">{event_analysis?.who || 'N/A'}</span></p>
             <p className="flex"><span className="text-slate-500 w-20 shrink-0">WHERE</span> <span className="font-semibold text-slate-200 truncate">{event_analysis?.where || 'N/A'}</span></p>
             <p className="flex"><span className="text-slate-500 w-20 shrink-0">WHEN</span> <span className="font-semibold text-slate-200 truncate">{event_analysis?.when || 'N/A'}</span></p>
          </div>
        </div>

        {/* Market Sentiment Card */}
        <div className={`terminal-card flex flex-col border border-solid ${overallSentiment.border} bg-[#040812]`}>
          <div className="flex justify-between items-center mb-5 border-b border-slate-700/80 pb-3">
             <span className="text-slate-400 text-[11px] tracking-widest uppercase">Market Vector</span>
             <TrendingUp className={`w-4 h-4 ${overallSentiment.text}`} />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
             <span className={`text-4xl font-bold tracking-widest ${overallSentiment.text}`}>
               {overallSentiment.label}
             </span>
             <div className="flex items-center gap-4 mt-6 text-[10px] text-slate-500 uppercase tracking-widest bg-slate-950/80 px-4 py-2 border border-slate-800 rounded-sm">
                <span className="text-emerald-500 font-bold">{bullishCount} BULL</span>
                <span className="text-slate-600 font-bold">|</span>
                <span className="text-amber-500 font-bold">{neutralCount} NEUT</span>
                <span className="text-slate-600 font-bold">|</span>
                <span className="text-rose-500 font-bold">{bearishCount} BEAR</span>
             </div>
          </div>
        </div>

        {/* Risk Meter Card */}
        <div className={`terminal-card flex flex-col border border-solid ${riskStyle.border} ${riskStyle.bg}`}>
          <div className="flex justify-between items-center mb-5 border-b border-slate-700/80 pb-3">
             <span className="text-slate-400 text-[11px] tracking-widest uppercase">Global Risk Index</span>
             <ShieldAlert className={`w-4 h-4 ${riskStyle.text}`} />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
             <div className="flex items-baseline gap-2">
               <span className={`text-5xl font-black ${riskStyle.text}`}>{riskValue}</span>
               <span className="text-slate-600 font-semibold">/100</span>
             </div>
             <div className="mt-4 flex items-center justify-between w-3/4">
               <span className={`text-[10px] tracking-widest font-bold px-3 py-1 bg-black/40 border border-slate-800 ${riskStyle.text}`}>{riskStyle.label}</span>
               <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 tracking-wider">MODEL CONFIDENCE</span>
                 <span className="text-indigo-400 font-bold">{confidence}%</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Sector Impact Analysis (2-column split) */}
      <div className="terminal-card">
         <div className="flex items-center gap-3 mb-6 border-b border-slate-700/80 pb-3">
            <Map className="w-5 h-5 text-cyan-500" />
            <span className="text-slate-300 text-xs font-semibold tracking-widest uppercase">Sector Impact Heatmap</span>
         </div>
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-4">
            {sector_mapping?.map((item: any, i: number) => {
               const sentLower = item.sentiment?.toLowerCase() || '';
               const isBull = sentLower === 'bullish';
               const isBear = sentLower === 'bearish';
               const sColor = isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-amber-400';
               const sBg = isBull ? 'bg-emerald-400/10' : isBear ? 'bg-rose-400/10' : 'bg-amber-400/10';

               return (
                 <div key={i} className="flex flex-col pb-4 border-b border-slate-800/60 transition-colors hover:bg-slate-800/20 p-2 rounded-sm -mx-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider">{item.sector}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase border border-slate-800 ${sColor} ${sBg}`}>
                        {item.sentiment || 'NEUTRAL'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs font-sans leading-relaxed tracking-wide">{item.rationale}</p>
                 </div>
               );
            })}
         </div>
      </div>

      {/* ROW 3: Predictions Table */}
      <div className="terminal-card p-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
               <Clock className="w-5 h-5 text-indigo-500" />
               <span className="text-slate-300 text-xs font-semibold tracking-widest uppercase">Predictive Modeling Matrix</span>
            </div>
            {predictions?.historical_parallels && predictions.historical_parallels.length > 0 && (
               <div className="flex items-center gap-2">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest">HISTORICAL ALIGNMENT:</span>
                 <div className="flex gap-2">
                    {predictions.historical_parallels.map((h: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-indigo-950/30 border border-indigo-900/50 text-indigo-400 text-[10px] truncate max-w-[150px]">{h}</span>
                    ))}
                 </div>
               </div>
            )}
         </div>
         
         <div className="w-full overflow-x-auto shadow-inner bg-[#040812] border border-slate-800/80">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
               <thead className="bg-[#080d1c] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <tr>
                     <th className="px-6 py-4 font-semibold w-40 border-r border-slate-800">Horizon</th>
                     <th className="px-6 py-4 font-semibold">Forecast Vector</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/70 font-sans">
                  {predictions?.short_term_predictions?.map((pred: string, i: number) => (
                     <tr key={`st-${i}`} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-indigo-400 font-bold font-mono text-[11px] border-r border-slate-800">1-3 MONTHS</td>
                        <td className="px-6 py-4 text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">{pred}</td>
                     </tr>
                  ))}
                  {predictions?.long_term_predictions?.map((pred: string, i: number) => (
                     <tr key={`lt-${i}`} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-purple-400 font-bold font-mono text-[11px] border-r border-slate-800">1-5 YEARS</td>
                        <td className="px-6 py-4 text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">{pred}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {predictions?.macroeconomic_reasoning && (
           <div className="mt-8 p-5 bg-[#080c18] border border-slate-800 border-l-4 border-l-indigo-500/70 text-slate-400 text-xs leading-relaxed font-sans shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                 <span className="block text-indigo-400 font-bold font-mono uppercase tracking-widest text-[10px]">Macroeconomic Reasoning Engine</span>
              </div>
              <p className="tracking-wide">"{predictions.macroeconomic_reasoning}"</p>
           </div>
         )}
      </div>

      {/* ROW 4: Executive Summary Panel (Highlighted) */}
      <div className="bg-[#050b14] border border-slate-700 shadow-xl shadow-black p-6 md:p-8 flex flex-col lg:flex-row gap-8 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50">
         <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"></div>
         
         <div className="flex-1 flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-emerald-500" />
                  <span className="text-white text-base font-bold tracking-widest uppercase drop-shadow-md">Executive Briefing</span>
               </div>
               <p className="text-emerald-400 text-sm leading-relaxed font-mono font-medium min-h-[60px]">
                  > {typedSummary}
                  <span className="animate-pulse font-mono text-emerald-500">_</span>
               </p>
            </div>
            <div className="flex gap-4 mt-8">
               <div className="bg-slate-950 px-4 py-3 border border-slate-800 border-l-2 border-l-purple-500 text-xs flex-1 transition-all duration-300 hover:border-l-4">
                  <span className="text-slate-500 block mb-2 uppercase tracking-widest text-[10px] font-bold">Societal Index Status</span>
                  <span className="text-purple-400 font-bold uppercase tracking-widest text-sm drop-shadow-md">{insights.societalImpact?.status || 'N/A'}</span>
               </div>
            </div>
         </div>
         
         <div className="flex-1 bg-slate-950/50 border border-slate-800 p-6 shadow-inner rounded-sm">
            <span className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-5 border-b border-slate-800 pb-3">Directive Actions Recommended</span>
            <ul className="space-y-4">
               {insights.recommendedActions?.map((action: string, i: number) => (
                  <li key={i} className="flex gap-4 text-xs font-sans text-slate-300 transition-transform duration-200 hover:translate-x-1">
                     <span className="text-emerald-500 font-bold font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)]">[{i+1}]</span>
                     <span className="leading-relaxed tracking-wide font-medium">{action}</span>
                  </li>
               ))}
            </ul>
         </div>
      </div>

    </div>
  );
}

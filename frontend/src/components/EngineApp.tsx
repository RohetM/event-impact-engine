"use client";

import { useState } from "react";
import EventInputForm from "@/components/EventInputForm";
import InsightsDashboard from "@/components/InsightsDashboard";
import { Globe } from "lucide-react";

export default function EngineApp() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (eventText: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/analyze-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: eventText }),
      });

      if (!response.ok) {
        throw new Error("Invalid or irrelevant event");
      }

      const data = await response.json();
      
      // Secondary check: if backend returned valid 200 but missing data (crash proof)
      if (!data || Object.keys(data).length === 0) {
         throw new Error("Invalid or irrelevant event");
      }
      
      setAnalysisResult(data);
    } catch (err: any) {
      // Overwrite with strict message requested
      setError("Invalid or irrelevant event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans animate-fade-in w-full">
      {/* Top Navigation / Terminal Bar */}
      <div className="w-full bg-slate-950 border-b border-slate-900 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          <h1 className="text-sm font-bold tracking-widest text-slate-300 uppercase">
            Bloomberg Event Terminal
          </h1>
        </div>
        <div className="text-xs font-mono text-slate-500">
          SYS.RUNNING
        </div>
      </div>

      <EventInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
      
      {error && (
        <div className="p-3 bg-red-950/30 border-b border-red-900/50 text-red-500 font-mono text-xs text-center uppercase tracking-widest animate-fade-in">
          ERR: {error}
        </div>
      )}

      <div className="flex-1 p-6 w-full max-w-[1600px] mx-auto flex flex-col">
        {isLoading ? (
          <DashboardSkeleton />
        ) : analysisResult ? (
          <div className="animate-fade-in"><InsightsDashboard data={analysisResult} /></div>
        ) : (
          <div className="h-full flex-1 flex flex-col items-center justify-center text-slate-600 font-mono tracking-widest uppercase">
            <Globe className="w-16 h-16 text-slate-800 mb-6 animate-pulse-slow" />
            <h2 className="text-lg text-slate-400 mb-2 font-bold">SYSTEM IDLE</h2>
            <p className="text-xs max-w-md text-center leading-relaxed">
              Waiting for global event input. The Intelligence Engine will map sectors, predict consequences, and compile an executive summary automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse font-mono opacity-70">
      {/* ROW 1: Top Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-36 bg-slate-900 border border-slate-800/80 rounded-sm"></div>
        <div className="h-36 bg-slate-900 border border-slate-800/80 rounded-sm"></div>
        <div className="h-36 bg-slate-900 border border-slate-800/80 rounded-sm"></div>
      </div>
      {/* ROW 2: Sectors */}
      <div className="h-[350px] bg-slate-900 border border-slate-800/80 rounded-sm"></div>
      {/* ROW 3: Predictions */}
      <div className="h-[400px] bg-slate-900 border border-slate-800/80 rounded-sm"></div>
      {/* ROW 4: Executive Summary */}
      <div className="h-48 bg-slate-900 border border-slate-800/80 border-l-4 border-l-slate-700 rounded-sm"></div>
    </div>
  );
}

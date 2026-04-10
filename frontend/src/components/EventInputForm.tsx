"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

interface EventInputFormProps {
  onAnalyze: (eventText: string) => void;
  isLoading: boolean;
}

export default function EventInputForm({ onAnalyze, isLoading }: EventInputFormProps) {
  const [eventText, setEventText] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventText.trim()) {
      setValidationError("SYS.ERR: Input cannot be empty");
      return;
    }
    setValidationError("");
    if (!isLoading) {
      onAnalyze(eventText);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <form onSubmit={handleSubmit} className="w-full flex flex-col md:flex-row md:items-center bg-slate-900 border-b border-slate-800 px-6 py-3">
        <div className="flex-1 flex items-center">
          <span className="text-emerald-500 font-mono text-xs md:text-sm mr-4 tracking-widest uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            CMD
          </span>
          <input
            type="text"
            value={eventText}
            onChange={(e) => {
               setEventText(e.target.value);
               if (validationError) setValidationError("");
            }}
            placeholder="Enter global event to analyze..."
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-700 font-mono text-sm"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-3 md:mt-0 md:ml-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-pulse flex items-center"><span className="text-emerald-500 mr-2">●</span> EXECUTING...</span>
          ) : (
            <><ArrowRight className="w-4 h-4 text-emerald-500" /> ANALYZE</>
          )}
        </button>
      </form>
      {validationError && (
        <div className="px-6 py-2 bg-rose-950/30 border-b border-rose-900/50 text-rose-500 font-mono text-[10px] uppercase tracking-widest">
          {validationError}
        </div>
      )}
    </div>
  );
}

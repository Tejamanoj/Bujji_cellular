'use client'

import React from 'react';
import { Check } from 'lucide-react';

export interface TimelineStep {
  title: string;
  date?: string;
  description: string;
  completed: boolean;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  return (
    <div className="flex flex-col space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-start space-x-6 relative">
          {/* Node */}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border z-10 transition-colors duration-300 ${
              step.completed
                ? 'bg-primary-gold border-primary-gold text-pure-black shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                : 'bg-zinc-950 border-zinc-800 text-zinc-600'
            }`}
          >
            {step.completed ? <Check size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-zinc-800" />}
          </div>

          {/* Info */}
          <div className="flex-1 -mt-0.5">
            <div className="flex items-center justify-between">
              <h4
                className={`text-sm font-semibold tracking-wide ${
                  step.completed ? 'text-primary-gold' : 'text-zinc-400'
                }`}
              >
                {step.title}
              </h4>
              {step.date && <span className="text-[10px] text-zinc-500 font-mono">{step.date}</span>}
            </div>
            <p className="text-xs text-zinc-400 mt-1">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Timeline;


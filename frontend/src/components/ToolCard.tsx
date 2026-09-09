import React from 'react';
import * as Icons from 'lucide-react';
import { ToolItem } from '../types';
import { ArrowRight, Star } from 'lucide-react';

interface ToolCardProps {
  tool: ToolItem;
  onSelect: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  // Dynamically resolve icon from lucide-react with fallback
  const IconComponent = (Icons as any)[tool.iconName] || Icons.FileText;

  return (
    <div
      onClick={() => onSelect(tool)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(tool);
        }
      }}
      className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-800 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
    >
      <div>
        {/* Top bar with Icon Badge & Popular Tag */}
        <div className="flex items-center justify-between mb-5">
          <div
            className={`w-13 h-13 rounded-2xl ${tool.badgeBg} ${tool.badgeColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
          >
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>

          {tool.popular && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Popular
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
          {tool.description}
        </p>
      </div>

      {/* Bottom Action Link */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span>Open tool</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

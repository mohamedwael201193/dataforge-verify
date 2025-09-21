import React from 'react';
import { motion } from 'framer-motion';

interface CalendarHeatmapProps {
  data: Array<{
    date: string;
    value: number;
    success: boolean;
  }>;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
  const getIntensity = (success: boolean) => {
    return success ? 'bg-success/80' : 'bg-destructive/60';
  };

  const getTooltipText = (item: { date: string; success: boolean }) => {
    const date = new Date(item.date).toLocaleDateString();
    return `${date}: ${item.success ? 'Proof Successful' : 'Proof Failed'}`;
  };

  // Group data by weeks
  const weeks = [];
  let currentWeek = [];
  
  data.forEach((item, index) => {
    currentWeek.push(item);
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1 justify-center">
        {data.map((item, index) => (
          <motion.div
            key={item.date}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className={`w-3 h-3 rounded-sm ${getIntensity(item.success)} cursor-pointer hover:scale-125 transition-transform`}
            title={getTooltipText(item)}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success/80 rounded-sm" />
          <span>Proof Success</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-destructive/60 rounded-sm" />
          <span>Proof Failed</span>
        </div>
      </div>
    </div>
  );
};
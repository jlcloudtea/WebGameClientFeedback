'use client';

import { motion } from 'framer-motion';

interface ClientSatisfactionMeterProps {
  /** 0-100 satisfaction value */
  value: number;
  /** Size of the gauge (default 120) */
  size?: number;
  /** Whether to show the numeric label (default true) */
  showLabel?: boolean;
}

function getColor(v: number): string {
  if (v <= 30) return 'text-red-500';
  if (v <= 60) return 'text-amber-500';
  return 'text-emerald-500';
}

function getGradient(v: number): string {
  if (v <= 30) return 'from-red-400 to-red-600';
  if (v <= 60) return 'from-amber-400 to-orange-500';
  return 'from-emerald-400 to-emerald-600';
}

function getLabel(v: number): string {
  if (v <= 20) return 'Very Unhappy';
  if (v <= 40) return 'Unhappy';
  if (v <= 60) return 'Neutral';
  if (v <= 80) return 'Happy';
  return 'Very Happy';
}

export default function ClientSatisfactionMeter({
  value,
  size = 120,
  showLabel = true,
}: ClientSatisfactionMeterProps) {
  const radius = (size - 16) / 2;
  const circumference = Math.PI * radius; // half-circle
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size / 2 + 12 }}>
        <svg
          width={size}
          height={size / 2 + 12}
          viewBox={`0 0 ${size} ${size / 2 + 12}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M 8 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2 + 4}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200"
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          <motion.path
            d={`M 8 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2 + 4}`}
            fill="none"
            stroke="url(#satisfaction-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="satisfaction-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {value <= 30 && (
                <>
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </>
              )}
              {value > 30 && value <= 60 && (
                <>
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f97316" />
                </>
              )}
              {value > 60 && (
                <>
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        {/* Center numeric value */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-center ${getColor(value)}`}
        >
          <span className="text-2xl font-bold leading-none">{value}</span>
        </div>
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${getColor(value)}`}>
          {getLabel(value)}
        </span>
      )}
    </div>
  );
}

import React from 'react';

interface StatCardProps {
    title: string;
    count: number;
    total: number;
    color: string; // e.g., "orange", "blue", "emerald"
    subLabel?: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, total, color, subLabel = "Món", className = "" }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    const radius = 32;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color maps
    const colors: Record<string, { ring: string, track: string, dot: string, lightDot: string }> = {
        orange: { ring: 'text-orange-500', track: 'text-orange-100', dot: 'bg-orange-500', lightDot: 'bg-orange-200' },
        blue: { ring: 'text-blue-500', track: 'text-blue-100', dot: 'bg-blue-500', lightDot: 'bg-blue-200' },
        emerald: { ring: 'text-emerald-500', track: 'text-emerald-100', dot: 'bg-emerald-500', lightDot: 'bg-emerald-200' },
        purple: { ring: 'text-purple-500', track: 'text-purple-100', dot: 'bg-purple-500', lightDot: 'bg-purple-200' },
        rose: { ring: 'text-rose-500', track: 'text-rose-100', dot: 'bg-rose-500', lightDot: 'bg-rose-200' },
        yellow: { ring: 'text-yellow-500', track: 'text-yellow-100', dot: 'bg-yellow-500', lightDot: 'bg-yellow-200' },
        indigo: { ring: 'text-indigo-500', track: 'text-indigo-100', dot: 'bg-indigo-500', lightDot: 'bg-indigo-200' },
        pink: { ring: 'text-pink-500', track: 'text-pink-100', dot: 'bg-pink-500', lightDot: 'bg-pink-200' },
        cyan: { ring: 'text-cyan-500', track: 'text-cyan-100', dot: 'bg-cyan-500', lightDot: 'bg-cyan-200' },
        amber: { ring: 'text-amber-500', track: 'text-amber-100', dot: 'bg-amber-500', lightDot: 'bg-amber-200' },
    };

    const theme = colors[color] || colors.orange;

    return (
        <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all ${className}`}>
            <div className="flex flex-col gap-2">
                <h3 className="text-gray-600 font-bold text-sm">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">{count}</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`}></span>
                        <span className="text-xs text-gray-500 font-medium">{subLabel}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${theme.lightDot}`}></span>
                    <span className="text-xs text-gray-400 font-medium">{percentage}% Tổng số</span>
                </div>
            </div>

            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset: 0 }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className={`${theme.track}`}
                    />
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className={`${theme.ring} transition-all duration-1000 ease-out`}
                    />
                </svg>
            </div>
        </div>
    );
};

export default StatCard;

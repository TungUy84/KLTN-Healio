import React from 'react';
import type { FoodStats } from '../services/foodService';
import { Utensils, Flame, Sunrise, Sun, Moon, Coffee, Beef, WheatOff, Dumbbell, Droplet, Scale } from 'lucide-react';

interface FoodStatsOverviewProps {
    stats: FoodStats;
}

const FoodStatsOverview: React.FC<FoodStatsOverviewProps> = ({ stats }) => {
    // Reusable styles for consistency
    const cardBaseClass = "relative overflow-hidden flex flex-col justify-between p-4 rounded-xl shadow-sm border h-full";
    const bgDecorClass = "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none";
    const titleClass = "font-bold mb-3 flex items-center gap-2 relative z-10 text-base text-gray-900";

    // Component for a single stat item using the "Diet" style (Compact)
    // Layout: Icon + Value (Row), Label (Below)
    const StatItem = ({
        icon: Icon,
        value,
        label,
        color,
        iconColor,
        borderColor
    }: {
        icon: any,
        value: string | number,
        label: string,
        color: string,
        iconColor: string,
        borderColor: string
    }) => (
        <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
                <div className={`p-1 bg-white rounded-md shadow-sm border ${borderColor} ${iconColor}`}>
                    <Icon size={13} />
                </div>
                <p className={`text-lg font-bold ${color} leading-none tracking-tight`}>{value}</p>
            </div>
            <p className="text-gray-500 text-[10px] font-medium truncate w-full pl-0.5" title={label}>{label}</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Section 1: Overview - Updated to match Diet style (No Chart, Compact) */}
            <div className={`bg-gradient-to-br from-purple-50 via-white to-purple-50/20 border-purple-100 ${cardBaseClass}`}>
                <div className={`bg-purple-100/50 ${bgDecorClass}`}></div>

                <h3 className={titleClass}>
                    <span className="w-1 h-4 bg-purple-600 rounded-full"></span>
                    Tổng quan
                </h3>

                {/* 2 Cols for 2 Items */}
                <div className="grid grid-cols-2 gap-4 relative z-10 h-full content-center">
                    <StatItem
                        icon={Utensils}
                        value={stats.total}
                        label="Tổng món ăn"
                        color="text-purple-700"
                        iconColor="text-purple-600"
                        borderColor="border-purple-100"
                    />
                    <StatItem
                        icon={Flame}
                        value={stats.avgCalories}
                        label="Calo trung bình"
                        color="text-orange-600"
                        iconColor="text-orange-500"
                        borderColor="border-orange-100"
                    />
                </div>
            </div>

            {/* Section 2: Meal Analysis - Updated to match Diet style (Compact) */}
            <div className={`bg-gradient-to-br from-indigo-50 via-white to-indigo-50/20 border-indigo-100 ${cardBaseClass}`}>
                <div className={`bg-indigo-100/50 ${bgDecorClass}`}></div>

                <h3 className={titleClass}>
                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                    Bữa ăn
                </h3>

                {/* 2 Cols for Balanced 4 Items */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 relative z-10 h-full content-center">
                    {[
                        { label: 'Bữa Sáng', count: stats.meals.breakfast, color: 'text-yellow-600', icon: Sunrise, iconColor: 'text-yellow-600', borderColor: 'border-yellow-100' },
                        { label: 'Bữa Trưa', count: stats.meals.lunch, color: 'text-amber-600', icon: Sun, iconColor: 'text-amber-600', borderColor: 'border-amber-100' },
                        { label: 'Bữa Tối', count: stats.meals.dinner, color: 'text-indigo-600', icon: Moon, iconColor: 'text-indigo-600', borderColor: 'border-indigo-100' },
                        { label: 'Ăn Vặt', count: stats.meals.snack, color: 'text-pink-600', icon: Coffee, iconColor: 'text-pink-600', borderColor: 'border-pink-100' },
                    ].map((m) => (
                        <StatItem
                            key={m.label}
                            icon={m.icon}
                            value={m.count}
                            label={m.label}
                            color={m.color}
                            iconColor={m.iconColor}
                            borderColor={m.borderColor}
                        />
                    ))}
                </div>
            </div>

            {/* Section 3: Diet Analysis - Proven Style (Compact) */}
            <div className={`bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20 border-emerald-100 ${cardBaseClass}`}>
                <div className={`bg-emerald-100/50 ${bgDecorClass}`}></div>

                <h3 className={titleClass}>
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    Chế độ
                </h3>

                {/* 3 Cols for 5 Items */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-1 relative z-10 h-full content-center">
                    {[
                        { label: 'Keto', count: stats.diets.keto, color: 'text-rose-600', icon: Beef, iconColor: 'text-rose-600', borderColor: 'border-rose-100' },
                        { label: 'Low Carb', count: stats.diets.low_carb, color: 'text-orange-600', icon: WheatOff, iconColor: 'text-orange-600', borderColor: 'border-orange-100' },
                        { label: 'Hi-Protein', count: stats.diets.high_protein, color: 'text-blue-600', icon: Dumbbell, iconColor: 'text-blue-600', borderColor: 'border-blue-100' },
                        { label: 'Low Fat', count: stats.diets.low_fat, color: 'text-cyan-600', icon: Droplet, iconColor: 'text-cyan-600', borderColor: 'border-cyan-100' },
                        { label: 'Balanced', count: stats.diets.balanced, color: 'text-emerald-600', icon: Scale, iconColor: 'text-emerald-600', borderColor: 'border-emerald-100' },
                        { label: 'Vegetarian', count: stats.diets.vegetarian, color: 'text-green-600', icon: WheatOff, iconColor: 'text-green-600', borderColor: 'border-green-100' },
                    ].map((d) => (
                        <StatItem
                            key={d.label}
                            icon={d.icon}
                            value={d.count}
                            label={d.label}
                            color={d.color}
                            iconColor={d.iconColor}
                            borderColor={d.borderColor}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FoodStatsOverview;

import React from 'react';
import { RotateCcw, Flame, Dna, Droplet, Wheat } from 'lucide-react';

interface Nutrition {
    total_calories: number;
    total_protein: number;
    total_carb: number;
    total_fat: number;
}

interface NutritionSectionProps {
    nutrition: Nutrition;
    dietTags: string[];
    onResetCalculation: () => void;
    onDietTagToggle: (tag: string) => void;
}

const NutritionSection: React.FC<NutritionSectionProps> = ({
    nutrition,
    dietTags,
    onResetCalculation,
    onDietTagToggle
}) => {
    const availableDietTags = [
        { value: 'keto', label: 'Keto' },
        { value: 'low_carb', label: 'Low Carb' },
        { value: 'high_protein', label: 'High Protein' },
        { value: 'low_fat', label: 'Low Fat' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'vegetarian', label: 'Vegetarian' }
    ];

    const MacroCard = ({ icon: Icon, label, value, unit, color, bg }: any) => (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} ${color}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                <div className={`text-lg font-bold ${color}`}>
                    {value || 0}<span className="text-sm font-medium text-gray-400 ml-0.5">{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">3</span>
                    Dinh dưỡng & Phân loại
                </h3>
                <button
                    type="button"
                    onClick={onResetCalculation}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-gray-200 hover:border-indigo-200"
                    title="Tính lại từ nguyên liệu"
                >
                    <RotateCcw size={14} />
                    Tính lại
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MacroCard
                    icon={Flame}
                    label="Calories"
                    value={Math.round(nutrition.total_calories * 10) / 10}
                    unit="kcal"
                    color="text-orange-500"
                    bg="bg-orange-50"
                />
                <MacroCard
                    icon={Dna}
                    label="Protein"
                    value={Math.round(nutrition.total_protein * 10) / 10}
                    unit="g"
                    color="text-emerald-500"
                    bg="bg-emerald-50"
                />
                <MacroCard
                    icon={Droplet}
                    label="Fat"
                    value={Math.round(nutrition.total_fat * 10) / 10}
                    unit="g"
                    color="text-amber-500"
                    bg="bg-amber-50"
                />
                <MacroCard
                    icon={Wheat}
                    label="Carbs"
                    value={Math.round(nutrition.total_carb * 10) / 10}
                    unit="g"
                    color="text-blue-500"
                    bg="bg-blue-50"
                />
            </div>

            {/* Diet Tags */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">Tag chế độ ăn (Tự động đề xuất)</label>
                <div className="flex flex-wrap gap-2">
                    {availableDietTags.map(tag => {
                        const isSelected = dietTags.includes(tag.value);
                        return (
                            <label
                                key={tag.value}
                                className={`cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-all select-none ${isSelected
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onDietTagToggle(tag.value)}
                                    className="hidden"
                                />
                                {tag.label}
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NutritionSection;

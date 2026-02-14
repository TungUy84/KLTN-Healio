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
    availableDietTags: { value: string; label: string }[]; // New Prop
    onResetCalculation: () => void;
    onDietTagToggle: (tag: string) => void;
}

const NutritionSection: React.FC<NutritionSectionProps> = ({
    nutrition,
    dietTags,
    availableDietTags, // Destructure
    onResetCalculation,
    onDietTagToggle
}) => {
    // Moved hardcoded list to parent

    const MacroCard = ({ icon: Icon, label, value, unit, color, bg, fromColor, borderColor }: any) => (
        <div className={`bg-linear-to-br ${fromColor} to-white p-4 rounded-2xl border ${borderColor} shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}>
            <div className={`absolute top-0 right-0 w-16 h-16 ${bg} rounded-full blur-xl -mr-6 -mt-6`}></div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                <div className={`p-2 bg-white rounded-xl w-fit shadow-sm ${color} border ${borderColor} bg-opacity-80`}>
                    <Icon size={20} strokeWidth={2} />
                </div>
                <div>
                    <div className="text-gray-500 text-xs font-medium mb-1">{label}</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {value || 0} <span className="text-sm font-medium text-gray-400">{unit}</span>
                    </div>
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
                    label="Năng lượng"
                    value={Math.round(nutrition.total_calories * 10) / 10}
                    unit="kcal"
                    color="text-orange-500"
                    bg="bg-orange-100"
                    fromColor="from-orange-50"
                    borderColor="border-orange-100"
                />
                <MacroCard
                    icon={Dna}
                    label="Protein"
                    value={Math.round(nutrition.total_protein * 10) / 10}
                    unit="g"
                    color="text-emerald-500"
                    bg="bg-emerald-100"
                    fromColor="from-emerald-50"
                    borderColor="border-emerald-100"
                />
                <MacroCard
                    icon={Droplet}
                    label="Fat (Béo)"
                    value={Math.round(nutrition.total_fat * 10) / 10}
                    unit="g"
                    color="text-amber-500"
                    bg="bg-amber-100"
                    fromColor="from-amber-50"
                    borderColor="border-amber-100"
                />
                <MacroCard
                    icon={Wheat}
                    label="Carb (Đường)"
                    value={Math.round(nutrition.total_carb * 10) / 10}
                    unit="g"
                    color="text-blue-500"
                    bg="bg-blue-100"
                    fromColor="from-blue-50"
                    borderColor="border-blue-100"
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

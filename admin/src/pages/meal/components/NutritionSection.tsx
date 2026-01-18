import React from 'react';
import { FaRedo } from 'react-icons/fa';

interface Nutrition {
    total_calories: number;
    total_protein: number;
    total_carb: number;
    total_fat: number;
}

interface NutritionSectionProps {
    nutrition: Nutrition;
    dietTags: string[];
    onNutritionChange: (field: keyof Nutrition, value: number) => void;
    onResetCalculation: () => void;
    onDietTagToggle: (tag: string) => void;
}

const NutritionSection: React.FC<NutritionSectionProps> = ({
    nutrition,
    dietTags,
    onNutritionChange,
    onResetCalculation,
    onDietTagToggle
}) => {
    const availableDietTags = [
        { value: 'keto', label: 'Keto' },
        { value: 'low_carb', label: 'Low Carb' },
        { value: 'high_protein', label: 'High Protein' },
        { value: 'low_fat', label: 'Low Fat' },
        { value: 'balanced', label: 'Balanced' }
    ];

    return (
        <>
            {/* PB_53: Tính Dinh dưỡng & Gắn nhãn */}
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-6">
                Tính Dinh dưỡng & Gắn nhãn
                <button
                    type="button"
                    onClick={onResetCalculation}
                    className="ml-3 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                    title="Tính lại từ nguyên liệu"
                >
                    <FaRedo className="text-xs" />
                    Tính lại
                </button>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tổng Calo (kcal)</label>
                    <input
                        type="number"
                        value={nutrition.total_calories}
                        onChange={(e) => onNutritionChange('total_calories', parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        step="0.01"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Protein (g)</label>
                    <input
                        type="number"
                        value={nutrition.total_protein}
                        onChange={(e) => onNutritionChange('total_protein', parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        step="0.01"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Carb (g)</label>
                    <input
                        type="number"
                        value={nutrition.total_carb}
                        onChange={(e) => onNutritionChange('total_carb', parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        step="0.01"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fat (g)</label>
                    <input
                        type="number"
                        value={nutrition.total_fat}
                        onChange={(e) => onNutritionChange('total_fat', parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        step="0.01"
                    />
                </div>
            </div>

            {/* PB_53: Diet Tags */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag chế độ ăn</label>
                <div className="flex flex-wrap gap-2">
                    {availableDietTags.map(tag => (
                        <label
                            key={tag.value}
                            className={`flex items-center px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                dietTags.includes(tag.value)
                                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={dietTags.includes(tag.value)}
                                onChange={() => onDietTagToggle(tag.value)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                            />
                            <span className="text-sm font-medium">{tag.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </>
    );
};

export default NutritionSection;

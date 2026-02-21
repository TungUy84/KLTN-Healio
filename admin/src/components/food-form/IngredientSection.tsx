import React from 'react';
import { Trash2, Search, ChefHat, Plus } from 'lucide-react';
import { type RawFood } from '../../services/rawFoodService';

export interface Ingredient {
    ingredient_id: number;
    raw_food_name: string;
    amount_in_grams: number;
}

interface IngredientSectionProps {
    ingredients: Ingredient[];
    searchQuery: string;
    searchResults: RawFood[];
    showSearchDropdown: boolean;
    onSearchChange: (query: string) => void;
    onSearchFocus: () => void;
    onAddIngredient: (rawFood: RawFood) => void;
    onRemoveIngredient: (index: number) => void;
    onUpdateQuantity: (index: number, quantity: number) => void;
}

const IngredientSection: React.FC<IngredientSectionProps> = ({
    ingredients,
    searchQuery,
    searchResults,
    showSearchDropdown,
    onSearchChange,
    onSearchFocus,
    onAddIngredient,
    onRemoveIngredient,
    onUpdateQuantity
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold shadow-sm border border-emerald-100">2</span>
                    Thành phần nguyên liệu
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    {ingredients.length} nguyên liệu
                </span>
            </div>

            {/* Search Input */}
            <div className="relative max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={onSearchFocus}
                        placeholder="Tìm kiếm nguyên liệu (thịt gà, trứng...)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                    />
                </div>
                {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                        {searchResults.map(rawFood => (
                            <button
                                key={rawFood.id}
                                type="button"
                                onClick={() => onAddIngredient(rawFood)}
                                className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-b-0 flex items-center justify-between group"
                            >
                                <div>
                                    <div className="font-semibold text-gray-800 group-hover:text-indigo-700">{rawFood.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {Math.round(rawFood.energy_kcal)} kcal • P: {rawFood.protein_g} • C: {rawFood.carb_g} • F: {rawFood.fat_g}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-indigo-200 group-hover:text-indigo-600">
                                    <Plus size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Empty State */}
            {ingredients.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-300">
                        <ChefHat size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">Chưa có nguyên liệu nào</p>
                    <p className="text-sm text-gray-400">Hãy tìm kiếm và thêm nguyên liệu ở trên</p>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 gap-3">
                {ingredients.map((ing, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-emerald-300 transition-colors shadow-sm group">
                        <div className="flex-1">
                            <div className="font-semibold text-gray-800">{ing.raw_food_name}</div>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                            <input
                                type="number"
                                value={ing.amount_in_grams}
                                onChange={(e) => onUpdateQuantity(index, parseFloat(e.target.value) || 0)}
                                className="w-20 p-1.5 bg-transparent text-center font-bold text-gray-800 outline-none text-sm"
                                min="0"
                                step="0.1"
                            />
                            <span className="text-xs font-bold text-gray-500 uppercase pr-2">grams</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => onRemoveIngredient(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Xóa nguyên liệu"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IngredientSection;

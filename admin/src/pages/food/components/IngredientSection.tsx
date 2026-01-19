import React from 'react';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { type RawFood } from '../../../services/rawFoodService';

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
        <>
            {/* PB_52: Select Ingredients */}
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-6">Chọn Nguyên liệu</h3>
            
            <div className="relative mb-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={onSearchFocus}
                        placeholder="Tìm kiếm nguyên liệu (tên hoặc mã số)..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                </div>
                {showSearchDropdown && searchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(rawFood => (
                            <button
                                key={rawFood.id}
                                type="button"
                                onClick={() => onAddIngredient(rawFood)}
                                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium text-sm text-gray-900">{rawFood.name}</div>
                                <div className="text-xs text-gray-500">Mã: {rawFood.code}</div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* PB_52: Ingredient List */}
            <div className="space-y-2 mb-6">
                {ingredients.map((ing, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{ing.raw_food_name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={ing.amount_in_grams}
                                onChange={(e) => onUpdateQuantity(index, parseFloat(e.target.value) || 0)}
                                placeholder="Khối lượng (g)"
                                min="0"
                                step="0.1"
                                className="w-24 p-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600">g</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemoveIngredient(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
                {ingredients.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        Chưa có nguyên liệu nào. Hãy tìm kiếm và thêm nguyên liệu ở trên.
                    </div>
                )}
            </div>
        </>
    );
};

export default IngredientSection;

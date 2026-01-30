// PB_52: View Detail Meal
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { foodService, type Food } from '../../services/foodService';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const FoodDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [food, setFood] = useState<Food | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchDetail(id);
    }, [id]);

    const fetchDetail = async (foodId: string) => {
        try {
            setLoading(true);
            const data = await foodService.getById(foodId);
            setFood(data);
        } catch (error) {
            console.error('Failed to fetch detail', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'breakfast': 'Sáng',
            'lunch': 'Trưa',
            'dinner': 'Tối',
            'snack': 'Vặt'
        };
        return labels[category] || category;
    };

    const getDietTagLabel = (tag: string) => {
        const labels: Record<string, string> = {
            'keto': 'Keto',
            'low_carb': 'Low Carb',
            'high_protein': 'High Protein',
            'low_fat': 'Low Fat',
            'balanced': 'Cân bằng'
        };
        return labels[tag] || tag;
    };

    if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>;
    if (!food) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Không tìm thấy dữ liệu</div>;

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/foods" className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 m-0">{food.name}</h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 m-0">Chi tiết món ăn</p>
                    </div>
                </div>
                <Link to={`/foods/edit/${food.id}`} className="flex items-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shrink-0">
                    <FaEdit className="mr-2" /> Chỉnh sửa
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Image & Basic Info */}
                <div className="flex flex-col">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                        <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 mb-5">
                            {food.image ? (
                                <img src={`http://localhost:3000${food.image}`} alt={food.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">No Image</div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đơn vị:</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 shadow-sm">
                                    1 {food.serving_unit || 'suất'}
                                </span>
                            </div>

                            {/* Meal Categories */}
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-500 dark:text-gray-400 font-medium text-sm">Nhóm bữa ăn:</label>
                                {food.meal_categories && food.meal_categories.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {food.meal_categories.map((cat, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                                                {getCategoryLabel(cat)}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 dark:text-gray-500 text-sm">Chưa chọn</span>
                                )}
                            </div>
                            
                            {/* Diet Tags */}
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-500 dark:text-gray-400 font-medium text-sm">Tag Chế độ:</label>
                                {food.diet_tags && food.diet_tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {food.diet_tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium">
                                                {getDietTagLabel(tag)}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                                )}
                            </div>

                            {/* Status */}
                            <div className="flex justify-between text-sm">
                                <label className="text-gray-500 dark:text-gray-400 font-medium">Trạng thái:</label>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    food.status === 'active' 
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                                        : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                }`}>
                                    {food.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Description */}
                        <div className="mt-5 border-t border-gray-200 dark:border-gray-600 pt-4">
                            <h4 className="m-0 mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">Mô tả</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed m-0">
                                {food.description || food.cooking || 'Chưa có mô tả'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Nutrition & Ingredients */}
                <div className="lg:col-span-2 flex flex-col">
                    {/* Macro Nutrients */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-4 m-0">Giá trị dinh dưỡng</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 rounded-lg flex flex-col items-center bg-red-50 dark:bg-red-900/30">
                                <span className="text-xs font-semibold mb-1 text-red-500 dark:text-red-400">Calo</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{Math.round(food.calories || 0)} Kcal</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-blue-50 dark:bg-blue-900/30">
                                <span className="text-xs font-semibold mb-1 text-blue-500 dark:text-blue-400">Protein</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{Math.round(food.protein || 0)}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-orange-50 dark:bg-orange-900/30">
                                <span className="text-xs font-semibold mb-1 text-orange-500 dark:text-orange-400">Fat</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{Math.round(food.fat || 0)}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-green-50 dark:bg-green-900/30">
                                <span className="text-xs font-semibold mb-1 text-green-500 dark:text-green-400">Carb</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{Math.round(food.carb || 0)}g</strong>
                            </div>
                        </div>
                    </div>

                    {/* Micro Nutrients (JSONB) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-6 h-fit">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-4 m-0">Vi chất (Micronutrients)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            {food.micronutrients && Object.entries(food.micronutrients).length > 0 ? (
                                Object.entries(food.micronutrients).map(([key, value]) => (
                                    <div key={key} className="flex justify-start items-baseline py-2.5 border-b border-gray-100 dark:border-gray-600 last:border-0">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm min-w-[100px]">{key}</span>
                                        <span className="mx-1 text-gray-400 dark:text-gray-500">-</span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-200 text-sm ml-2">{String(value)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 dark:text-gray-500 italic">Không có dữ liệu vi chất.</p>
                            )}
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-6 h-fit">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-4 m-0">Nguyên liệu</h3>
                        {food.ingredients && food.ingredients.length > 0 ? (
                            <div className="space-y-3">
                                {food.ingredients.map((ingredient, idx) => {
                                    const amount = ingredient.FoodIngredient?.amount_in_grams || 0;
                                    
                                    return (
                                        <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-600 last:border-0">
                                            <div className="flex-1">
                                                <span className="text-gray-900 dark:text-gray-200 font-medium text-sm">{ingredient.name}</span>
                                                {ingredient.code && (
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">({ingredient.code})</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900 dark:text-gray-200 font-semibold text-sm">
                                                    {Math.round(amount)}g
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 dark:text-gray-500 italic">Chưa có nguyên liệu.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetail;

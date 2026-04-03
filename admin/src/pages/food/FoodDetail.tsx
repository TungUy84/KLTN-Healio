import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { foodService, type Food } from '../../services/foodService';
import {
    ArrowLeft,
    Edit3,
    Clock,
    Flame,
    Utensils,
    ChevronRight,
    Beef,
    Droplet,
    Wheat,
    Scale,
    Tag,
    Activity,
    ChefHat,
    Atom
} from 'lucide-react';
import toast from 'react-hot-toast';

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
            toast.error('Không thể tải chi tiết món ăn');
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



    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
    );

    if (!food) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
            <Utensils size={48} className="mb-4 opacity-20" />
            <p>Không tìm thấy món ăn</p>
            <Link to="/foods" className="mt-4 text-emerald-600 hover:underline">Quay lại danh sách</Link>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/foods"
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-gray-400 border border-gray-100 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 m-0">{food.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${food.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {food.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span>Chi tiết món ăn</span>
                            <ChevronRight size={14} />
                            <span className="text-gray-900 font-medium">{food.name}</span>
                        </div>
                    </div>
                </div>

                <Link
                    to={`/foods/edit/${food.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
                >
                    <Edit3 size={18} />
                    Chỉnh sửa món này
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Image & Basic Info (4/12) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Image Card */}
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 relative group">
                            {food.image ? (
                                <img
                                    src={`${food.image}`}
                                    alt={food.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                    <Utensils size={48} className="mb-2" />
                                    <span className="text-sm font-medium">Chưa có ảnh</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Info Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500" />
                            Thông tin chung
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Scale size={16} /> Đơn vị tính
                                </span>
                                <span className="font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                    1 {food.serving_unit || 'suất'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Clock size={16} /> Bữa ăn phù hợp
                                </span>
                                <div className="flex flex-wrap gap-1.5 pl-6">
                                    {food.meal_categories && food.meal_categories.length > 0 ? (
                                        food.meal_categories.map((cat, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                                {getCategoryLabel(cat)}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Chưa chọn</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Tag size={16} /> Chế độ ăn
                                </span>
                                <div className="flex flex-wrap gap-1.5 pl-6">
                                    {food.dietPresets && food.dietPresets.length > 0 ? (
                                        food.dietPresets.map((preset) => (
                                            <span key={preset.id} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                                                {preset.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Chưa gắn thẻ</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1">
                        <h3 className="font-bold text-gray-900 mb-3">Mô tả / Cách nấu</h3>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {food.description || food.cooking || 'Chưa có mô tả chi tiết.'}
                        </p>
                    </div>
                </div>

                {/* Right Column: Nutrition & Ingredients (8/12) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* 1. Macro Nutrients - Hero Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Calories */}
                        <div className="bg-linear-to-br from-orange-50 to-white p-4 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-full blur-xl -mr-6 -mt-6"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="p-2 bg-white rounded-xl w-fit shadow-sm text-orange-500 mb-3 border border-orange-50">
                                    <Flame size={20} fill="currentColor" fillOpacity={0.2} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-medium mb-1">Năng lượng</p>
                                    <p className="text-2xl font-bold text-gray-900">{Math.round(food.calories || 0)} <span className="text-sm font-medium text-gray-400">kcal</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Protein */}
                        <div className="bg-linear-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full blur-xl -mr-6 -mt-6"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="p-2 bg-white rounded-xl w-fit shadow-sm text-blue-500 mb-3 border border-blue-50">
                                    <Beef size={20} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-medium mb-1">Protein (Đạm)</p>
                                    <p className="text-2xl font-bold text-gray-900">{Math.round(food.protein || 0)} <span className="text-sm font-medium text-gray-400">g</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Fat */}
                        <div className="bg-linear-to-br from-yellow-50 to-white p-4 rounded-2xl border border-yellow-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100 rounded-full blur-xl -mr-6 -mt-6"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="p-2 bg-white rounded-xl w-fit shadow-sm text-yellow-500 mb-3 border border-yellow-50">
                                    <Droplet size={20} fill="currentColor" fillOpacity={0.2} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-medium mb-1">Fat (Béo)</p>
                                    <p className="text-2xl font-bold text-gray-900">{Math.round(food.fat || 0)} <span className="text-sm font-medium text-gray-400">g</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Carb */}
                        <div className="bg-linear-to-br from-green-50 to-white p-4 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full blur-xl -mr-6 -mt-6"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="p-2 bg-white rounded-xl w-fit shadow-sm text-green-500 mb-3 border border-green-50">
                                    <Wheat size={20} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-medium mb-1">Carb (Đường)</p>
                                    <p className="text-2xl font-bold text-gray-900">{Math.round(food.carb || 0)} <span className="text-sm font-medium text-gray-400">g</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Micro Nutrients & Ingredients Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Ingredients List */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <ChefHat size={18} className="text-emerald-500" />
                                    Nguyên liệu
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {food.ingredients?.length || 0}
                                    </span>
                                </h3>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {food.ingredients && food.ingredients.length > 0 ? (
                                    food.ingredients.map((ingredient, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-gray-100/50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-medium text-xs">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">{ingredient.name}</p>
                                                    {ingredient.code && (
                                                        <p className="text-[10px] text-gray-400">#{ingredient.code}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-gray-700 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                                {Math.round(ingredient.FoodIngredient?.amount_in_grams || 0)}g
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">Chưa có danh sách nguyên liệu</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Micro Nutrients */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Atom size={18} className="text-purple-500" />
                                Vi chất (Micronutrients)
                            </h3>

                            <div className="space-y-1">
                                {food.micronutrients && Object.entries(food.micronutrients).length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {Object.entries(food.micronutrients).map(([key, value],) => (
                                            <div key={key} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-purple-50/50 border border-transparent hover:border-purple-100 transition-all">
                                                <span className="text-sm text-gray-600 font-medium">
                                                    {key.replace(/_/g, ' ').replace(/mg/g, '').replace(/mcg/g, '').replace('Vit ', 'Vitamin ').trim()}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                    {String(value)} mg
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm">Chưa có thông tin vi chất</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDetail;

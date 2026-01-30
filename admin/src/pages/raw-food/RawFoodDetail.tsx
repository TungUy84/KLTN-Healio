// PB_45: View Detail Raw Food
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rawFoodService, type RawFood } from '../../services/rawFoodService';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const RawFoodDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [food, setFood] = useState<RawFood | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchDetail(id);
    }, [id]);

    const fetchDetail = async (foodId: string) => {
        try {
            setLoading(true);
            const data = await rawFoodService.getById(foodId);
            setFood(data);
        } catch (error) {
            console.error('Failed to fetch detail', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>;
    if (!food) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Không tìm thấy dữ liệu</div>;

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/raw-foods" className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 m-0">{food.name} <span className="text-gray-500 dark:text-gray-400 text-lg font-normal">({food.code})</span></h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 m-0">Chi tiết nguyên liệu</p>
                    </div>
                </div>
                <Link to={`/raw-foods/edit/${food.id}`} className="flex items-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shrink-0">
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
                            <div className="flex justify-between text-sm">
                                <label className="text-gray-500 dark:text-gray-400 font-medium">Mã số:</label>
                                <span className="text-gray-900 dark:text-gray-200 font-semibold">{food.code}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <label className="text-gray-500 dark:text-gray-400 font-medium">Đơn vị:</label>
                                <span className="text-gray-900 dark:text-gray-200 font-semibold">{food.unit}</span>
                            </div>
                        </div>
                         {/* Description */}
                        <div className="mt-5 border-t border-gray-200 dark:border-gray-600 pt-4">
                            <h4 className="m-0 mb-2 text-sm font-semibold text-gray-900 dark:text-gray-200">Mô tả</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed m-0">{food.description || 'Chưa có mô tả'}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Nutrition */}
                <div className="lg:col-span-2 flex flex-col">
                    {/* Macro Nutrients */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-4 m-0">Giá trị dinh dưỡng (trên 100g)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                             <div className="p-3 rounded-lg flex flex-col items-center bg-red-50 dark:bg-red-900/30">
                                <span className="text-xs font-semibold mb-1 text-red-500 dark:text-red-400">Calo</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{food.energy_kcal} Kcal</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-blue-50 dark:bg-blue-900/30">
                                <span className="text-xs font-semibold mb-1 text-blue-500 dark:text-blue-400">Protein</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{food.protein_g}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-orange-50 dark:bg-orange-900/30">
                                <span className="text-xs font-semibold mb-1 text-orange-500 dark:text-orange-400">Fat</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{food.fat_g}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-green-50 dark:bg-green-900/30">
                                <span className="text-xs font-semibold mb-1 text-green-500 dark:text-green-400">Carb</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{food.carb_g}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-gray-50 dark:bg-gray-700/50">
                                <span className="text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Fiber</span>
                                <strong className="text-sm text-gray-800 dark:text-gray-200">{food.fiber_g}g</strong>
                            </div>
                        </div>
                    </div>

                    {/* Micro Nutrients (JSONB) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-6 h-fit">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-4 m-0">Vi chất (Micronutrients)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            {Object.entries(food.micronutrients).length > 0 ? (
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
                </div>
            </div>
        </div>
    );
};

export default RawFoodDetail;

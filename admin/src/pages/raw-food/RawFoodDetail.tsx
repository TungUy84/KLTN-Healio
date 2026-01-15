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

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!food) return <div className="p-10 text-center text-gray-500">Không tìm thấy dữ liệu</div>;

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/raw-foods" className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
                        <FaArrowLeft />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">
                        {food.name} <span className="text-gray-500 text-lg font-normal">({food.code})</span>
                    </h1>
                </div>
                <Link to={`/raw-foods/edit/${food.id}`} className="flex items-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                    <FaEdit className="mr-2" /> Chỉnh sửa
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Image & Basic Info */}
                <div className="flex flex-col">
                    <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
                        <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 mb-5">
                            {food.image ? (
                                <img src={`http://localhost:3000${food.image}`} alt={food.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-sm">
                                <label className="text-gray-500 font-medium">Mã số:</label>
                                <span className="text-gray-900 font-semibold">{food.code}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <label className="text-gray-500 font-medium">Đơn vị:</label>
                                <span className="text-gray-900 font-semibold">{food.unit}</span>
                            </div>
                        </div>
                         {/* Description */}
                        <div className="mt-5 border-t border-gray-200 pt-4">
                            <h4 className="m-0 mb-2 text-sm font-semibold text-gray-900">Mô tả</h4>
                            <p className="text-sm text-gray-600 leading-relaxed m-0">{food.description || 'Chưa có mô tả'}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Nutrition */}
                <div className="lg:col-span-2 flex flex-col">
                    {/* Macro Nutrients */}
                    <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
                        <h3 className="text-base font-bold text-gray-900 mb-4 m-0">Giá trị dinh dưỡng (trên 100g)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                             <div className="p-3 rounded-lg flex flex-col items-center bg-red-50">
                                <span className="text-xs font-semibold mb-1 text-red-500">Calo</span>
                                <strong className="text-sm text-gray-800">{food.energy_kcal} Kcal</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-blue-50">
                                <span className="text-xs font-semibold mb-1 text-blue-500">Protein</span>
                                <strong className="text-sm text-gray-800">{food.protein_g}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-orange-50">
                                <span className="text-xs font-semibold mb-1 text-orange-500">Fat</span>
                                <strong className="text-sm text-gray-800">{food.fat_g}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-green-50">
                                <span className="text-xs font-semibold mb-1 text-green-500">Carb</span>
                                <strong className="text-sm text-gray-800">{food.carb_g}g</strong>
                            </div>
                            <div className="p-3 rounded-lg flex flex-col items-center bg-gray-50">
                                <span className="text-xs font-semibold mb-1 text-gray-500">Fiber</span>
                                <strong className="text-sm text-gray-800">{food.fiber_g}g</strong>
                            </div>
                        </div>
                    </div>

                    {/* Micro Nutrients (JSONB) */}
                    <div className="bg-white rounded-xl p-6 shadow-sm mt-6 h-fit">
                        <h3 className="text-base font-bold text-gray-900 mb-4 m-0">Vi chất (Micronutrients)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            {Object.entries(food.micronutrients).length > 0 ? (
                                Object.entries(food.micronutrients).map(([key, value]) => (
                                    <div key={key} className="flex justify-start items-baseline py-2.5 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-600 text-sm min-w-[100px]">{key}</span>
                                        <span className="mx-1 text-gray-400">-</span>
                                        <span className="font-semibold text-gray-900 text-sm ml-2">{String(value)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic">Không có dữ liệu vi chất.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RawFoodDetail;

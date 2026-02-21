// PB_45: View Detail Raw Food
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rawFoodService, type RawFood } from '../../services/rawFoodService';
import {
    ArrowLeft,
    Edit,
    Activity,
    FlaskConical,
    Flame,
    Droplet,
    Wheat,
    Dna
} from 'lucide-react';

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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!food) return (
        <div className="text-center py-20">
            <h3 className="text-xl font-bold text-gray-700">Không tìm thấy dữ liệu nguyên liệu</h3>
            <Link to="/raw-foods" className="text-emerald-600 hover:underline mt-2 inline-block">Quay lại danh sách</Link>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/raw-foods"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-emerald-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-baseline gap-3">
                            {food.name}
                            <span className="text-lg font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg font-mono">#{food.code}</span>
                        </h1>
                        <p className="text-gray-500 mt-1">Chi tiết thông tin và giá trị dinh dưỡng</p>
                    </div>
                </div>
                <Link
                    to={`/raw-foods/edit/${food.id}`}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all transform hover:-translate-y-0.5 justify-center md:justify-start"
                >
                    <Edit size={18} /> Chỉnh sửa
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image & Basic Info */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mb-6 flex items-center justify-center relative group">
                            {food.image ? (
                                <img src={`http://localhost:3000${food.image}`} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <span className="text-gray-400 font-medium">Không có hình ảnh</span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Đơn vị tính</span>
                                <span className="text-gray-900 font-bold bg-gray-50 px-3 py-1 rounded-lg">{food.unit}</span>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider text-gray-400">Mô tả</h4>
                                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {food.description || <span className="italic text-gray-400">Chưa có mô tả nào cho nguyên liệu này.</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Nutrition */}
                <div className="lg:col-span-2 space-y-8 h-fit">

                    {/* Macro Nutrients */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Activity className="text-emerald-500" size={24} />
                            Giá trị dinh dưỡng <span className="text-sm font-normal text-gray-500">(trên 100g)</span>
                        </h3>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-red-50 p-5 rounded-2xl flex flex-col items-center border border-red-100">
                                <div className="p-2 bg-white rounded-full mb-2 shadow-sm text-red-500"><Flame size={20} /></div>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Calo</span>
                                <strong className="text-2xl text-gray-800">{food.energy_kcal}</strong>
                                <span className="text-xs text-gray-400">Kcal</span>
                            </div>
                            <div className="bg-emerald-50 p-5 rounded-2xl flex flex-col items-center border border-emerald-100">
                                <div className="p-2 bg-white rounded-full mb-2 shadow-sm text-emerald-500"><Dna size={20} /></div>
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Protein</span>
                                <strong className="text-2xl text-gray-800">{food.protein_g}</strong>
                                <span className="text-xs text-gray-400">g</span>
                            </div>
                            <div className="bg-amber-50 p-5 rounded-2xl flex flex-col items-center border border-amber-100">
                                <div className="p-2 bg-white rounded-full mb-2 shadow-sm text-amber-500"><Droplet size={20} /></div>
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Fat</span>
                                <strong className="text-2xl text-gray-800">{food.fat_g}</strong>
                                <span className="text-xs text-gray-400">g</span>
                            </div>
                            <div className="bg-blue-50 p-5 rounded-2xl flex flex-col items-center border border-blue-100">
                                <div className="p-2 bg-white rounded-full mb-2 shadow-sm text-blue-500"><Wheat size={20} /></div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Carb</span>
                                <strong className="text-2xl text-gray-800">{food.carb_g}</strong>
                                <span className="text-xs text-gray-400">g</span>
                            </div>
                        </div>

                        {/* Fiber Bar */}
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-gray-400 rounded-full"></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Chất xơ (Fiber)</p>
                                    <p className="font-medium text-gray-700">Hỗ trợ tiêu hóa</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-gray-800">{food.fiber_g}</span> <span className="text-sm text-gray-500">g</span>
                            </div>
                        </div>
                    </div>

                    {/* Micro Nutrients */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FlaskConical className="text-purple-500" size={24} />
                            Vi chất dinh dưỡng
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {Object.entries(food.micronutrients).length > 0 ? (
                                Object.entries(food.micronutrients).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center py-3 border-b border-gray-50 group hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                        <span className="text-gray-600 font-medium group-hover:text-emerald-700 transition-colors">{key}</span>
                                        <span className="font-bold text-gray-900 bg-white shadow-sm border border-gray-100 px-3 py-1 rounded-md text-sm">{String(value)}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 italic">Chưa có thông tin về vi chất.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RawFoodDetail;

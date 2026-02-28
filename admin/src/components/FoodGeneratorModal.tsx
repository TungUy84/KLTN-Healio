import React, { useState } from 'react';
import {
    Sparkles,
    Loader2,
    Plus,
    Edit3,
    X,
    Search,
    Flame,
    Dna,
    Droplet,
    Wheat,
    RotateCcw,
    ChefHat,
    Utensils,
    Frown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { foodService } from '../services/foodService';
import { useNotifications } from '../context/NotificationContext';

interface FoodGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onEdit: (data: any) => void;
}

const FoodGeneratorModal: React.FC<FoodGeneratorModalProps> = ({ isOpen, onClose, onSuccess, onEdit }) => {
    const { addNotification } = useNotifications();
    const [foodName, setFoodName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    if (!isOpen) return null;

    const handleReset = () => {
        setResult(null);
        setFoodName('');
    };

    const handleGenerate = async () => {
        if (!foodName.trim()) {
            toast.error('Vui lòng nhập tên món ăn');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Check validation (Duplicate) - Client Side
            const checkRes = await foodService.getAll(1, 10, foodName);
            const exists = checkRes.data.some(f => f.name.toLowerCase() === foodName.trim().toLowerCase());

            if (exists) {
                toast.error(`Món "${foodName}" đã tồn tại trong thực đơn!`);
                setLoading(false);
                return;
            }

            const response = await foodService.generateRecipeByAI(foodName);
            if (response.success) {
                setResult(response);
                toast.success('Đã tạo công thức thành công!');
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'AI đang bận, vui lòng thử lại sau.';
            if (msg.includes('Not a food') || msg.includes('Unexpected token')) {
                toast.error('AI không nhận diện được món này. Hãy thử tên khác!', { icon: <Frown /> });
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdd = async () => {
        if (!result) return;
        try {
            const submitData = {
                name: result.name,
                description: result.description,
                serving_unit: result.serving_unit || 'Suất',
                meal_categories: result.meal_categories || [],
                diet_tags: result.diet_tags || [],
                total_calories: result.total_calories || result.calories || 0,
                total_protein: result.total_protein || result.protein || 0,
                total_carb: result.total_carb || result.carb || 0,
                total_fat: result.total_fat || result.fat || 0,
                micronutrients: result.micronutrients || {},
                ingredients: result.ingredients.map((ing: any) => ({
                    ingredient_id: ing.raw_food_id,
                    amount_in_grams: ing.amount || 100
                })),
                status: 'active'
            };

            console.log('Quick Add Submitting:', submitData);
            console.log('Micronutrients to save:', submitData.micronutrients);

            const formData = new FormData();
            formData.append('name', submitData.name);
            formData.append('description', submitData.description);
            formData.append('serving_unit', submitData.serving_unit);
            formData.append('meal_categories', JSON.stringify(submitData.meal_categories));
            formData.append('diet_tags', JSON.stringify(submitData.diet_tags));
            formData.append('total_calories', String(submitData.total_calories));
            formData.append('total_protein', String(submitData.total_protein));
            formData.append('total_carb', String(submitData.total_carb));
            formData.append('total_fat', String(submitData.total_fat));
            formData.append('micronutrients', JSON.stringify(submitData.micronutrients));
            formData.append('status', 'active');
            formData.append('ingredients', JSON.stringify(submitData.ingredients));

            const created = await foodService.create(formData);
            toast.success('Đã thêm món ăn vào thực đơn!');
            addNotification({ message: `Thêm món ăn "${result.name}" thành công`, link: `/foods/${created.id}` });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi lưu món ăn. Hãy thử chế độ Chỉnh sửa.');
        }
    };

    // Clean Minimal Macro Item
    const MacroItem = ({ icon: Icon, label, value, color, bg }: any) => (
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-transparent hover:border-gray-100 group cursor-default">
            <div className={`p-2 rounded-full mb-2 ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <span className={`text-lg font-bold ${color} leading-none mb-1`}>{value}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300 font-sans">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-[600px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative border border-white/40 ring-1 ring-black/5">

                {/* 1. HEADER */}
                <div className="px-6 pt-6 pb-2 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                            <Sparkles size={20} fill="currentColor" className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">AI Chef</h2>
                            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-wider">Powered by Gemini</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-all active:scale-90"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 2. CONTENT */}
                <div className="p-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
                    {!result ? (
                        <div className="space-y-6">
                            <div className="text-center space-y-2 mt-4">
                                <h3 className="text-2xl font-bold text-gray-800">Hôm nay ăn gì?</h3>
                                <p className="text-gray-400 text-sm">Nhập tên món ăn để AI tạo công thức chi tiết cho bạn.</p>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:bg-indigo-500/30 transition-all opacity-0 group-hover:opacity-100 duration-500" />
                                <div className="relative bg-white rounded-2xl border-2 border-indigo-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm flex items-center p-1.5">
                                    <input
                                        type="text"
                                        value={foodName}
                                        onChange={(e) => setFoodName(e.target.value)}
                                        placeholder="VD: Phở bò, Pasta Carbonara..."
                                        className="flex-1 pl-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-800 font-semibold placeholder:text-gray-300 placeholder:font-normal h-12"
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || !foodName.trim()}
                                        className="w-12 h-12 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} strokeWidth={2.5} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {['Phở bò', 'Bún chả', 'Salad ức gà', 'Cơm tấm'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setFoodName(item)}
                                        className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold transition-all"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 fade-in">
                            {/* Food Header */}
                            <div className="text-center relative">
                                <button
                                    onClick={handleReset}
                                    className="absolute -top-1 -left-1 p-2 text-gray-300 hover:text-indigo-600 rounded-full transition-colors hover:bg-indigo-50"
                                    title="Tìm lại"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-gradient-to-tr from-indigo-50 to-purple-50 text-indigo-500 mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-indigo-100">
                                    <Utensils size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">{result.name}</h2>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-[480px] mx-auto line-clamp-3">
                                    {result.description}
                                </p>
                            </div>

                            {/* Nutrition Stats */}
                            <div className="grid grid-cols-4 gap-3">
                                <MacroItem
                                    icon={Flame} label="Calories" value={result.total_calories || result.calories || 0}
                                    color="text-orange-500" bg="bg-orange-50"
                                />
                                <MacroItem
                                    icon={Dna} label="Protein" value={`${result.total_protein || result.protein || 0}g`}
                                    color="text-emerald-500" bg="bg-emerald-50"
                                />
                                <MacroItem
                                    icon={Droplet} label="Fat" value={`${result.total_fat || result.fat || 0}g`}
                                    color="text-amber-500" bg="bg-amber-50"
                                />
                                <MacroItem
                                    icon={Wheat} label="Carbs" value={`${result.total_carb || result.carb || 0}g`}
                                    color="text-blue-500" bg="bg-blue-50"
                                />
                            </div>

                            {/* Ingredients Preview */}
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <ChefHat size={16} className="text-indigo-500" />
                                    <span className="text-sm font-bold text-gray-700">Nguyên liệu chính ({result.ingredients?.length || 0})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.ingredients?.slice(0, 5).map((ing: any, idx: number) => (
                                        <span key={idx} className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 font-medium shadow-sm">
                                            {ing.name} <span className="text-gray-400">({ing.amount}g)</span>
                                        </span>
                                    ))}
                                    {(result.ingredients?.length || 0) > 5 && (
                                        <span className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-400 font-medium border-dashed">
                                            +{result.ingredients.length - 5}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {result.diet_tags && result.diet_tags.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {result.diet_tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* 3. FOOTER */}
                {result && (
                    <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                        <button
                            onClick={() => onEdit(result)}
                            className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 shadow-sm"
                        >
                            <Edit3 size={16} />
                            Chỉnh sửa
                        </button>
                        <button
                            onClick={handleQuickAdd}
                            className="flex-[1.5] py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 shadow-md"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            Thêm ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodGeneratorModal;

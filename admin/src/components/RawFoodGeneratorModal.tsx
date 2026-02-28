import React, { useState } from 'react';
import {
    Sparkles,
    Loader2,
    Plus,
    X,
    Search,
    Flame,
    Dna,
    Droplet,
    Wheat,
    RotateCcw,
    Leaf,
    FlaskConical,
    Carrot,
    Frown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rawFoodService } from '../services/rawFoodService';
import { useNotifications } from '../context/NotificationContext';

interface RawFoodGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onEdit: (data: any) => void;
}

const RawFoodGeneratorModal: React.FC<RawFoodGeneratorModalProps> = ({ isOpen, onClose, onSuccess, onEdit }) => {
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
            toast.error('Vui lòng nhập tên nguyên liệu');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Check validation (Duplicate)
            const checkRes = await rawFoodService.getAll(1, 10, foodName);
            const exists = checkRes.data.some(f => f.name.toLowerCase() === foodName.trim().toLowerCase());

            if (exists) {
                toast.error(`Món "${foodName}" đã tồn tại trong kho!`);
                setLoading(false);
                return;
            }

            // Step 2: Generate if new
            const response = await rawFoodService.generateInfo(foodName);
            if (response.success) {
                setResult(response.data);
                toast.success('Đã tìm thấy thông tin!');
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || 'AI đang bận, vui lòng thử lại sau.';

            if (msg.includes('Không phải là thực phẩm') || msg.includes('Unexpected token')) {
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
            const formData = new FormData();
            formData.append('code', `AI_${Date.now()}`);
            formData.append('name', result.name);
            formData.append('description', result.description);
            formData.append('status', 'active');
            formData.append('energy_kcal', String(result.calories));
            formData.append('protein_g', String(result.protein));
            formData.append('fat_g', String(result.fat));
            formData.append('carb_g', String(result.carb));
            formData.append('fiber_g', String(result.fiber || 0));
            formData.append('unit', '100g');

            if (result.micronutrients) {
                formData.append('micronutrients', JSON.stringify(result.micronutrients));
            }

            const created = await rawFoodService.create(formData);
            toast.success('Đã thêm nguyên liệu vào kho!');
            addNotification({ message: `Thêm nguyên liệu "${result.name}" thành công`, link: `/raw-foods/${created.id}` });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi lưu nguyên liệu.');
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

                {/* 1. HEADER - Minimal & Clean */}
                <div className="px-6 pt-6 pb-2 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                            <Sparkles size={20} fill="currentColor" className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">AI Healio</h2>
                            <p className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider">Powered by Gemini</p>
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
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {!result ? (
                        <div className="space-y-6">
                            <div className="text-center space-y-2 mt-4">
                                <h3 className="text-2xl font-bold text-gray-800">Bạn đang tìm gì?</h3>
                                <p className="text-gray-400 text-sm">Nhập tên thực phẩm để phân tích dinh dưỡng ngay lập tức.</p>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl group-hover:bg-emerald-500/30 transition-all opacity-0 group-hover:opacity-100 duration-500" />
                                <div className="relative bg-white rounded-2xl border-2 border-emerald-100 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm flex items-center p-1.5">
                                    <input
                                        type="text"
                                        value={foodName}
                                        onChange={(e) => setFoodName(e.target.value)}
                                        placeholder="VD: Cá hồi, Bơ..."
                                        className="flex-1 pl-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-800 font-semibold placeholder:text-gray-300 placeholder:font-normal h-12"
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || !foodName.trim()}
                                        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} strokeWidth={2.5} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {['Ức gà', 'Khoai lang', 'Yến mạch', 'Chuối'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setFoodName(item)}
                                        className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-xs font-semibold transition-all"
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
                                    className="absolute -top-1 -left-1 p-2 text-gray-300 hover:text-emerald-600 rounded-full transition-colors hover:bg-emerald-50"
                                    title="Tìm lại"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-gradient-to-tr from-emerald-50 to-teal-50 text-emerald-500 mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-emerald-100">
                                    <Carrot size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">{result.name}</h2>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-[480px] mx-auto">
                                    {result.description}
                                </p>
                            </div>

                            {/* Nutrition Stats */}
                            <div className="grid grid-cols-4 gap-3">
                                <MacroItem
                                    icon={Flame} label="Calories" value={result.calories}
                                    color="text-orange-500" bg="bg-orange-50"
                                />
                                <MacroItem
                                    icon={Dna} label="Protein" value={`${result.protein}g`}
                                    color="text-emerald-500" bg="bg-emerald-50"
                                />
                                <MacroItem
                                    icon={Droplet} label="Fat" value={`${result.fat}g`}
                                    color="text-amber-500" bg="bg-amber-50"
                                />
                                <MacroItem
                                    icon={Wheat} label="Carbs" value={`${result.carb}g`}
                                    color="text-blue-500" bg="bg-blue-50"
                                />
                            </div>

                            {/* Fiber & Micros */}
                            <div className="space-y-3 pt-2">
                                <div className="bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between border border-emerald-100/50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                                            <Leaf size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">Chất xơ (Fiber)</span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">{result.fiber || 0}g</span>
                                </div>

                                {result.micronutrients && Object.keys(result.micronutrients).length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FlaskConical size={14} className="text-purple-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vi chất</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(result.micronutrients).map(([key, value]) => (
                                                <span key={key} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 font-medium shadow-sm">
                                                    {key}: <span className="text-gray-900 font-bold">{String(value)} mg</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                            Chỉnh sửa
                        </button>
                        <button
                            onClick={handleQuickAdd}
                            className="flex-[1.5] py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 shadow-md"
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

export default RawFoodGeneratorModal;
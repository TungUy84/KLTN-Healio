import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { rawFoodService } from '../../services/rawFoodService';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ImagePlus,
    Carrot,
    Loader2,
    Info,
    Activity,
    FlaskConical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';

interface MicronutrientInput {
    key: string;
    value: string;
}

const RawFoodForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        unit: '100g',
        energy_kcal: 0,
        protein_g: 0,
        fat_g: 0,
        carb_g: 0,
        fiber_g: 0
    });

    // Manage dynamic micronutrients list
    const [micronutrients, setMicronutrients] = useState<MicronutrientInput[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // AI Data Handling
    const [searchParams] = useSearchParams();
    const aiData = searchParams.get('aiData');

    useEffect(() => {
        if (aiData) {
            try {
                const parsed = JSON.parse(decodeURIComponent(aiData));
                setFormData(prev => ({
                    ...prev,
                    code: `AI_${Date.now()}`,
                    name: parsed.name,
                    description: parsed.description || '',
                    energy_kcal: parsed.calories,
                    protein_g: parsed.protein,
                    fat_g: parsed.fat,
                    carb_g: parsed.carb,
                    fiber_g: parsed.fiber || 0,
                    unit: '100g'
                }));

                if (parsed.micronutrients) {
                    const micros = Object.entries(parsed.micronutrients).map(([key, value]) => ({
                        key,
                        value: String(value)
                    }));
                    setMicronutrients(micros);
                }

                toast.success('Đã điền thông tin từ AI!');
            } catch (e) {
                console.error("Error parsing AI data", e);
            }
        }
    }, [aiData]);

    useEffect(() => {
        if (isEditMode && id) {
            fetchDetail(id);
        }
    }, [id]);

    const fetchDetail = async (foodId: string) => {
        try {
            setLoading(true);
            const data = await rawFoodService.getById(foodId);
            setFormData({
                code: data.code,
                name: data.name,
                description: data.description || '',
                unit: data.unit,
                energy_kcal: data.energy_kcal,
                protein_g: data.protein_g,
                fat_g: data.fat_g,
                carb_g: data.carb_g,
                fiber_g: data.fiber_g
            });
            if (data.image) {
                setPreviewImage(`${data.image}`);
            }

            // Convert json object to array for form inputs
            if (data.micronutrients) {
                const micros = Object.entries(data.micronutrients).map(([key, value]) => ({
                    key,
                    value: String(value)
                }));
                setMicronutrients(micros);
            }
        } catch (error) {
            console.error('Failed to fetch detail', error);
            toast.error('Không thể tải thông tin chi tiết');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Micro-nutrients handlers
    const addMicronutrient = () => {
        setMicronutrients([...micronutrients, { key: '', value: '' }]);
    };

    const removeMicronutrient = (index: number) => {
        const newMicros = [...micronutrients];
        newMicros.splice(index, 1);
        setMicronutrients(newMicros);
    };

    const handleMicronutrientChange = (index: number, field: 'key' | 'value', value: string) => {
        const newMicros = [...micronutrients];
        newMicros[index][field] = value;
        setMicronutrients(newMicros);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            toast.error('Vui lòng nhập mã số (Code)');
            return;
        }

        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên nguyên liệu');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                submitData.append(key, String(value));
            });

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            // Convert array back to object
            const microObject: Record<string, string> = {};
            micronutrients.forEach(item => {
                if (item.key && item.value) {
                    microObject[item.key] = item.value;
                }
            });
            submitData.append('micronutrients', JSON.stringify(microObject));

            if (isEditMode && id) {
                await rawFoodService.update(id, submitData);
                toast.success('Cập nhật nguyên liệu thành công!');
                addNotification({ message: `Cập nhật nguyên liệu "${formData.name}" thành công`, link: `/raw-foods/${id}` });
            } else {
                const created = await rawFoodService.create(submitData);
                toast.success('Thêm mới nguyên liệu thành công!');
                addNotification({ message: `Thêm nguyên liệu "${formData.name}" thành công`, link: `/raw-foods/${created.id}` });
            }
            navigate('/raw-foods');
        } catch (error: any) {
            console.error('Submit error', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu';

            if (msg.includes('đã tồn tại')) {
                toast.error(msg, { duration: 4000 });
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/raw-foods"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-emerald-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Chỉnh sửa Nguyên liệu' : 'Thêm mới Nguyên liệu'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode ? `Cập nhật thông tin cho mã: ${formData.code}` : 'Điền thông tin để tạo nguyên liệu thô mới'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/raw-foods')}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu lại')}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. LEFT COLUMN: Basic Info & Image */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                            <Info size={20} className="text-emerald-500" />
                            Thông tin cơ bản
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700">Mã số (Code) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="code"
                                    required
                                    value={formData.code}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    placeholder="VD: 1001"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                />
                                <p className="text-xs text-gray-400">Mã định danh duy nhất cho nguyên liệu.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700">Tên nguyên liệu <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="VD: Ức gà"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700">Đơn vị tính</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700">Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả thêm về nguyên liệu..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50 focus:bg-white min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* Image Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                            <ImagePlus size={20} className="text-emerald-500" />
                            Hình ảnh minh họa
                        </h3>

                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="w-full sm:w-1/2">
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-emerald-500 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-3 bg-emerald-50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <ImagePlus className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <p className="mb-1 text-sm text-gray-500 font-medium group-hover:text-emerald-600">Click để tải ảnh lên</p>
                                        <p className="text-xs text-gray-400">PNG, JPG hoặc GIF</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>

                            <div className="w-full sm:w-1/2">
                                {previewImage ? (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-full aspect-video rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center text-emerald-600 gap-3">
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <Carrot size={32} />
                                        </div>
                                        <span className="text-sm font-medium">Xem trước hình ảnh</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT COLUMN: Nutrition Info */}
                <div className="lg:col-span-1 space-y-8 h-fit">
                    {/* Macros Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                            <Activity size={20} className="text-emerald-500" />
                            Dinh dưỡng (100g)
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Calo (Kcal)</label>
                                <div className="relative">
                                    <input
                                        type="number" step="0.1" name="energy_kcal"
                                        value={formData.energy_kcal} onChange={handleChange}
                                        className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none font-semibold text-gray-800"
                                    />
                                    <span className="absolute right-4 top-2.5 text-xs font-bold text-gray-400 mt-1">KCAL</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-red-500 uppercase mb-1.5">Protein</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.1" name="protein_g"
                                            value={formData.protein_g} onChange={handleChange}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-red-100 focus:border-red-500 focus:ring-2 focus:ring-red-50 transition-all outline-none text-sm font-medium bg-red-50/10"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-400">g</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1.5">Fat</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.1" name="fat_g"
                                            value={formData.fat_g} onChange={handleChange}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-amber-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-50 transition-all outline-none text-sm font-medium bg-amber-50/10"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-400">g</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1.5">Carb</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.1" name="carb_g"
                                            value={formData.carb_g} onChange={handleChange}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all outline-none text-sm font-medium bg-blue-50/10"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-400">g</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Fiber</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.1" name="fiber_g"
                                            value={formData.fiber_g} onChange={handleChange}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-all outline-none text-sm font-medium bg-gray-50/30"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-400">g</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Micros Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FlaskConical size={20} className="text-emerald-500" />
                                Vi chất
                            </h3>
                            <button
                                type="button"
                                onClick={addMicronutrient}
                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="Thêm vi chất"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {micronutrients.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Chưa có vi chất nào</p>
                                <button type="button" onClick={addMicronutrient} className="text-xs font-bold text-emerald-600 hover:underline">
                                    + Thêm ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {micronutrients.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center group animate-in slide-in-from-left-2 duration-300">
                                        <div className="flex-1 grid grid-cols-5 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Tên (VD: Vit A)"
                                                value={item.key}
                                                onChange={(e) => handleMicronutrientChange(index, 'key', e.target.value)}
                                                className="col-span-3 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Giá trị"
                                                value={item.value}
                                                onChange={(e) => handleMicronutrientChange(index, 'value', e.target.value)}
                                                className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 outline-none text-right"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMicronutrient(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RawFoodForm;

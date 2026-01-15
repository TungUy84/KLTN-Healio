import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { rawFoodService } from '../../services/rawFoodService';
import { FaArrowLeft, FaSave, FaPlus, FaMinus } from 'react-icons/fa';

interface MicronutrientInput {
    key: string;
    value: string;
}

const RawFoodForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

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
                setPreviewImage(`http://localhost:3000${data.image}`);
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
            alert('Lỗi tải dữ liệu.');
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
                alert('Cập nhật thành công!');
            } else {
                await rawFoodService.create(submitData);
                alert('Thêm mới thành công!');
            }
            navigate('/raw-foods');
        } catch (error: any) {
            console.error('Submit error', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/raw-foods" className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 m-0">{isEditMode ? 'Chỉnh sửa Nguyên liệu' : 'Thêm mới Nguyên liệu'}</h1>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-0">Thông tin cơ bản</h3>
                    <div className="flex flex-col md:flex-row gap-6 mb-4">
                        <div className="flex-1 flex flex-col mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã số (Code) *</label>
                            <input
                                type="text"
                                name="code"
                                required
                                value={formData.code}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                placeholder="VD: 1001"
                                disabled={isEditMode} // Usually code is unique and shouldn't change
                            />
                        </div>
                        <div className="flex-1 flex flex-col mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên nguyên liệu *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-4">
                        <div className="flex-1 flex flex-col mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn vị tính</label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="flex-1 flex flex-col mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hình ảnh</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            {previewImage && (
                                <img src={previewImage} alt="Preview" className="mt-2.5 max-h-24 rounded object-cover border border-gray-200" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[80px]"
                        />
                    </div>

                    {/* Macros */}
                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-6">Chỉ số dinh dưỡng (trên 100g)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Calo (Kcal)</label>
                            <input type="number" step="0.1" name="energy_kcal" value={formData.energy_kcal} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Protein (g)</label>
                            <input type="number" step="0.1" name="protein_g" value={formData.protein_g} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fat (g)</label>
                            <input type="number" step="0.1" name="fat_g" value={formData.fat_g} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Carb (g)</label>
                            <input type="number" step="0.1" name="carb_g" value={formData.carb_g} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fiber (g)</label>
                            <input type="number" step="0.1" name="fiber_g" value={formData.fiber_g} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Micronutrients */}
                    <div className="mt-6 mb-4 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                         <h3 className="text-base font-semibold text-gray-900 m-0 pl-2">Vi chất (Micronutrients)</h3>
                         <button type="button" onClick={addMicronutrient} className="flex items-center gap-1.5 bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-md cursor-pointer text-sm font-medium hover:bg-indigo-50 transition-colors shadow-sm">
                            <FaPlus /> Thêm vi chất
                         </button>
                    </div>
                    
                    {micronutrients.length === 0 && <p className="text-gray-500 text-sm italic mb-4 pl-2">Chưa có vi chất nào.</p>}

                    {micronutrients.map((item, index) => (
                        <div key={index} className="flex gap-3 mb-2.5 items-center">
                            <input
                                type="text"
                                placeholder="Tên vi chất (VD: Vitamin A)"
                                value={item.key}
                                onChange={(e) => handleMicronutrientChange(index, 'key', e.target.value)}
                                className="flex-1 p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            <input
                                type="text"
                                placeholder="Giá trị (VD: 50mcg)"
                                value={item.value}
                                onChange={(e) => handleMicronutrientChange(index, 'value', e.target.value)}
                                className="flex-1 p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            <button type="button" onClick={() => removeMicronutrient(index)} className="flex items-center justify-center w-[38px] h-[38px] bg-red-100 text-red-500 border-none rounded-lg cursor-pointer hover:bg-red-200 transition-colors">
                                <FaMinus />
                            </button>
                        </div>
                    ))}

                    <div className="mt-8 flex justify-end border-t border-gray-200 pt-5">
                        <button type="submit" disabled={loading} className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-semibold text-base hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
                            <FaSave className="mr-2" />
                            {loading ? 'Đang lưu...' : 'Lưu dữ liệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RawFoodForm;

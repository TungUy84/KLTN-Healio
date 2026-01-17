import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { mealService } from '../../services/mealService';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const MealForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    
    // AC2: Meal Categories - Checkbox (multiple selection)
    const [mealCategories, setMealCategories] = useState<string[]>([]);
    const availableCategories = [
        { value: 'breakfast', label: 'Ăn sáng' },
        { value: 'lunch', label: 'Ăn trưa' },
        { value: 'dinner', label: 'Ăn tối' },
        { value: 'snack', label: 'Ăn vặt' }
    ];

    useEffect(() => {
        if (isEditMode && id) {
            fetchDetail(id);
        }
    }, [id]);

    const fetchDetail = async (foodId: string) => {
        try {
            setLoading(true);
            const data = await mealService.getById(foodId);
            setFormData({
                name: data.name,
                description: data.description || ''
            });
            if (data.image) {
                setPreviewImage(`http://localhost:3000${data.image}`);
            }
            setMealCategories(data.meal_categories || []);
            setStatus(data.status || 'active');
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

    // AC2: Handle checkbox change for meal categories
    const handleCategoryChange = (categoryValue: string) => {
        setMealCategories(prev => {
            if (prev.includes(categoryValue)) {
                return prev.filter(cat => cat !== categoryValue);
            } else {
                return [...prev, categoryValue];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description || '');
            submitData.append('meal_categories', JSON.stringify(mealCategories));
            submitData.append('status', status);

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (isEditMode && id) {
                await mealService.update(id, submitData);
                alert('Cập nhật thành công!');
            } else {
                await mealService.create(submitData);
                alert('Thêm mới thành công!');
            }
            navigate('/meals');
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
                <Link to="/meals" className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 m-0">{isEditMode ? 'Chỉnh sửa Món ăn' : 'Thêm mới Món ăn'}</h1>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
                <form onSubmit={handleSubmit}>
                    {/* AC1: Basic Info */}
                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-0">Thông tin cơ bản</h3>
                    
                    <div className="flex flex-col mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên món *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="VD: Cơm tấm sườn bì"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-4">
                        <div className="flex-1 flex flex-col mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh đại diện</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                            {previewImage && (
                                <img src={previewImage} alt="Preview" className="mt-2.5 max-h-48 rounded object-cover border border-gray-200" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả/Cách làm</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[120px]"
                            placeholder="Nhập mô tả hoặc hướng dẫn cách làm món ăn..."
                        />
                    </div>

                    <div className="flex flex-col mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                className={`w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-white cursor-pointer text-left flex items-center justify-between ${
                                    status === 'active' ? 'text-green-700' : 'text-red-700'
                                }`}
                            >
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    status === 'active' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {status === 'active' ? 'Active (Hoạt động)' : 'Inactive (Tạm ngưng)'}
                                </span>
                                <svg className={`w-4 h-4 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {statusDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setStatusDropdownOpen(false)}
                                    />
                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStatus('active');
                                                setStatusDropdownOpen(false);
                                            }}
                                            className="w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        >
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                                Active (Hoạt động)
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStatus('inactive');
                                                setStatusDropdownOpen(false);
                                            }}
                                            className="w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        >
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                                Inactive (Tạm ngưng)
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* AC2: Meal Categories - Checkbox */}
                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-6">Chọn Bữa ăn</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {availableCategories.map((category) => (
                            <label key={category.value} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={mealCategories.includes(category.value)}
                                    onChange={() => handleCategoryChange(category.value)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-700">{category.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end border-t border-gray-200 pt-5">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-semibold text-base hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <FaSave className="mr-2" />
                            {loading ? 'Đang lưu...' : 'Lưu dữ liệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MealForm;

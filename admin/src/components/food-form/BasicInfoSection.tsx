import React from 'react';
import { Sparkles, Image as ImageIcon, ChevronDown } from 'lucide-react';

interface BasicInfoSectionProps {
    formData: {
        name: string;
        serving_unit: string;
        description: string;
    };
    previewImage: string | null;
    status: 'active' | 'inactive';
    statusDropdownOpen: boolean; // Kept for compatibility but unused
    mealCategories: string[];
    onFormDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusToggle: () => void; // Kept for compatibility
    onStatusSelect: (status: 'active' | 'inactive') => void;
    onCategoryChange: (categoryValue: string) => void;
    onGenerateAI?: () => void;
    aiLoading?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    formData,
    previewImage,
    status,
    mealCategories,
    onFormDataChange,
    onFileChange,
    onStatusSelect,
    onCategoryChange,
    onGenerateAI,
    aiLoading
}) => {
    const availableCategories = [
        { value: 'breakfast', label: 'Ăn sáng' },
        { value: 'lunch', label: 'Ăn trưa' },
        { value: 'dinner', label: 'Ăn tối' },
        { value: 'snack', label: 'Ăn vặt' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                    Thông tin cơ bản
                </h3>
                {onGenerateAI && (
                    <button
                        type="button"
                        onClick={onGenerateAI}
                        disabled={aiLoading || !formData.name}
                        className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={16} />
                        {aiLoading ? 'Đang tạo...' : 'Tạo bằng AI'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Image Upload */}
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                    <div className="relative group">
                        <div className={`aspect-square w-full rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 overflow-hidden transition-all hover:border-indigo-400 ${previewImage ? 'border-transparent' : ''}`}>
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <ImageIcon size={24} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Tải ảnh lên</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
                                </div>
                            )}

                            <label className="absolute inset-0 cursor-pointer bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    className="hidden"
                                />
                                {previewImage && (
                                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm font-medium text-xs text-gray-700 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                        Thay đổi ảnh
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Fields */}
                <div className="md:col-span-2 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Tên món ăn <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={onFormDataChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium"
                                placeholder="VD: Phở bò, Pasta..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Đơn vị (VD: Tô, dĩa)</label>
                            <input
                                type="text"
                                name="serving_unit"
                                value={formData.serving_unit}
                                onChange={onFormDataChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                                placeholder="VD: Dĩa"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => onStatusSelect(e.target.value as 'active' | 'inactive')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm appearance-none bg-white cursor-pointer"
                                    style={{
                                        color: status === 'active' ? '#047857' : '#B91C1C',
                                        backgroundColor: status === 'active' ? '#ECFDF5' : '#FEF2F2'
                                    }}
                                >
                                    <option value="active">Active (Hoạt động)</option>
                                    <option value="inactive">Inactive (Tạm ngưng)</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Bữa ăn phù hợp</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {availableCategories.map((category) => {
                                const isSelected = mealCategories.includes(category.value);
                                return (
                                    <label
                                        key={category.value}
                                        className={`cursor-pointer flex items-center justify-center px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${isSelected
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onCategoryChange(category.value)}
                                            className="hidden"
                                        />
                                        {category.label}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Mô tả / Cách làm</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onFormDataChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm min-h-[100px] resize-y"
                            placeholder="Nhập mô tả món ăn hoặc hướng dẫn cách chế biến..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoSection;

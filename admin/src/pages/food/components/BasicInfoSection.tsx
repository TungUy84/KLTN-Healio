import React from 'react';

interface BasicInfoSectionProps {
    formData: {
        name: string;
        serving_unit: string;
        description: string;
    };
    previewImage: string | null;
    status: 'active' | 'inactive';
    statusDropdownOpen: boolean;
    mealCategories: string[];
    onFormDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusToggle: () => void;
    onStatusSelect: (status: 'active' | 'inactive') => void;
    onCategoryChange: (categoryValue: string) => void;
    onGenerateAI?: () => void;
    aiLoading?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    formData,
    previewImage,
    status,
    statusDropdownOpen,
    mealCategories,
    onFormDataChange,
    onFileChange,
    onStatusToggle,
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
        <>
            {/* PB_51: Basic Info */}
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-0">Thông tin cơ bản</h3>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">Tên món *</label>
                        {onGenerateAI && (
                            <button
                                type="button"
                                onClick={onGenerateAI}
                                disabled={aiLoading || !formData.name}
                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {aiLoading ? 'Đang tạo...' : '✨ Tạo bằng AI'}
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={onFormDataChange}
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        placeholder="VD: Cơm tấm sườn bì"
                    />
                </div>
                <div className="w-full md:w-1/3 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn vị (VD: Tô, dĩa)</label>
                    <input
                        type="text"
                        name="serving_unit"
                        value={formData.serving_unit}
                        onChange={onFormDataChange}
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        placeholder="VD: Dĩa"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="flex-1 flex flex-col mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh đại diện</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
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
                    onChange={onFormDataChange}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[120px]"
                    placeholder="Nhập mô tả hoặc hướng dẫn cách làm món ăn..."
                />
            </div>

            <div className="flex flex-col mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={onStatusToggle}
                        className={`w-full p-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-white cursor-pointer text-left flex items-center justify-between ${status === 'active' ? 'text-green-700' : 'text-red-700'
                            }`}
                    >
                        <span className={`px-2 py-1 rounded text-xs font-medium ${status === 'active'
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
                                onClick={onStatusToggle}
                            />
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                <button
                                    type="button"
                                    onClick={() => onStatusSelect('active')}
                                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                        Active (Hoạt động)
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onStatusSelect('inactive')}
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

            {/* PB_51: Meal Categories */}
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 mt-6">Chọn Bữa ăn</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {availableCategories.map((category) => (
                    <label key={category.value} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={mealCategories.includes(category.value)}
                            onChange={() => onCategoryChange(category.value)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{category.label}</span>
                    </label>
                ))}
            </div>
        </>
    );
};

export default BasicInfoSection;

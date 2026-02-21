import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { type DietPreset } from '../../services/dietService';
import toast from 'react-hot-toast';

interface DietModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: DietPreset | null;
}

const DietModal: React.FC<DietModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        carb_ratio: 50,
        protein_ratio: 30,
        fat_ratio: 20
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                code: initialData.code,
                name: initialData.name,
                description: initialData.description || '',
                carb_ratio: initialData.carb_ratio,
                protein_ratio: initialData.protein_ratio,
                fat_ratio: initialData.fat_ratio
            });
        } else {
            setFormData({
                code: '',
                name: '',
                description: '',
                carb_ratio: 50,
                protein_ratio: 30,
                fat_ratio: 20
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const total = Number(formData.carb_ratio) + Number(formData.protein_ratio) + Number(formData.fat_ratio);
    const isValid = total === 100;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            toast.error(`Tổng tỷ lệ Macro phải bằng 100% (Hiện tại: ${total}%)`);
            return;
        }
        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Chỉnh sửa Chế độ ăn' : 'Thêm Chế độ ăn mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã chế độ <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono"
                                placeholder="VD: KETO"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên hiển thị <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="VD: Ketogenic Diet"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả ngắn</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none"
                            placeholder="Mô tả về chế độ ăn này..."
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-800">Tỷ lệ Macro (Tổng: {total}%)</label>
                            {!isValid && <span className="text-xs text-red-500 font-medium">Tổng phải là 100%</span>}
                        </div>

                        {/* Sliders */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <div className="flex justify-between text-xs mb-1 font-medium text-emerald-700">
                                    <span>Carbs (Đường)</span>
                                    <span>{formData.carb_ratio}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.carb_ratio}
                                    onChange={e => setFormData({ ...formData, carb_ratio: Number(e.target.value) })}
                                    className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1 font-medium text-blue-700">
                                    <span>Protein (Đạm)</span>
                                    <span>{formData.protein_ratio}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.protein_ratio}
                                    onChange={e => setFormData({ ...formData, protein_ratio: Number(e.target.value) })}
                                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1 font-medium text-yellow-700">
                                    <span>Fat (Béo)</span>
                                    <span>{formData.fat_ratio}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.fat_ratio}
                                    onChange={e => setFormData({ ...formData, fat_ratio: Number(e.target.value) })}
                                    className="w-full h-2 bg-yellow-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            <Save size={18} />
                            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DietModal;

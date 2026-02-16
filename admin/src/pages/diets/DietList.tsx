import React, { useEffect, useState } from 'react';
import { Trash2, Edit, Plus } from 'lucide-react';
import { dietService, type DietPreset } from '../../services/dietService';
import DietModal from './DietModal';
import toast from 'react-hot-toast';
import { confirmToast } from '../../utils/toastUtils';

const DietList: React.FC = () => {
    const [diets, setDiets] = useState<DietPreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDiet, setSelectedDiet] = useState<DietPreset | null>(null);

    const fetchDiets = async () => {
        try {
            setLoading(true);
            const res = await dietService.getAll();
            if (res && Array.isArray(res)) {
                setDiets(res);
            } else if (res && res.data) {
                setDiets(res.data);
            }
        } catch (error) {
            console.error('Error fetching diets:', error);
            toast.error('Không thể tải danh sách chế độ ăn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiets();
    }, []);

    const handleCreate = () => {
        setSelectedDiet(null);
        setIsModalOpen(true);
    };

    const handleEdit = (diet: DietPreset) => {
        setSelectedDiet(diet);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        confirmToast({
            message: 'Bạn có chắc chắn muốn xóa chế độ ăn này không? Hành động này không thể hoàn tác.',
            type: 'danger',
            confirmText: 'Xóa chế độ',
            onConfirm: async () => {
                try {
                    await dietService.delete(id);
                    toast.success('Xóa thành công');
                    fetchDiets();
                } catch (error) {
                    console.error('Error deleting diet:', error);
                    toast.error('Xóa thất bại');
                }
            }
        });
    };

    const handleSubmit = async (data: any) => {
        if (selectedDiet) {
            await dietService.update(selectedDiet.id, data);
            toast.success('Cập nhật thành công');
        } else {
            await dietService.create(data);
            toast.success('Tạo mới thành công');
        }
        fetchDiets();
    };

    const MacroBar = ({ carb, protein, fat }: { carb: number, protein: number, fat: number }) => (
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full bg-emerald-500" style={{ width: `${carb}%` }} title={`Carbs: ${carb}%`}></div>
            <div className="h-full bg-blue-500" style={{ width: `${protein}%` }} title={`Protein: ${protein}%`}></div>
            <div className="h-full bg-yellow-400" style={{ width: `${fat}%` }} title={`Fat: ${fat}%`}></div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Chế độ ăn</h1>
                    <p className="text-gray-500 mt-1">Định nghĩa các bộ tỷ lệ dinh dưỡng (Macro Presets) cho người dùng.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Thêm Chế độ ăn
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {diets.map(diet => (
                        <div key={diet.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold font-mono tracking-wider">
                                        {diet.code}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(diet)}
                                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(diet.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">{diet.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">
                                    {diet.description || 'Không có mô tả.'}
                                </p>

                                <div className="space-y-3">
                                    <MacroBar carb={diet.carb_ratio} protein={diet.protein_ratio} fat={diet.fat_ratio} />
                                    <div className="flex text-xs font-medium text-gray-500 justify-between">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Carb: {diet.carb_ratio}%</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Pro: {diet.protein_ratio}%</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>Fat: {diet.fat_ratio}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DietModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedDiet}
            />
        </div>
    );
};

export default DietList;

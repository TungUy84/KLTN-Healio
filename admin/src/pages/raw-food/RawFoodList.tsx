import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rawFoodService, type RawFood } from '../../services/rawFoodService';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaFileImport } from 'react-icons/fa';

const RawFoodList: React.FC = () => {
    const [foods, setFoods] = useState<RawFood[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const response = await rawFoodService.getAll(page, LIMIT, search, sort, order);
            setFoods(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching raw foods', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, [page, search, sort, order]); // Re-fetch when page, search, sort or order changes

    const handleSortChange = (newSort: string) => {
        if (sort === newSort) {
            setOrder(order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSort(newSort);
            setOrder('ASC'); // Default to ASC when changing sort field
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on search
        fetchFoods();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này không?')) {
            try {
                await rawFoodService.delete(id);
                fetchFoods();
            } catch (error) {
                console.error('Error deleting raw food', error);
                alert('Không thể xóa nguyên liệu.');
            }
        }
    };

    return (
        <div className="w-full">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quản lý Nguyên liệu</h1>
                    <p className="text-base text-gray-500 dark:text-gray-400">Danh sách nguyên liệu thô, dinh dưỡng trên 100g</p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <Link to="/raw-foods/import" className="flex items-center bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm">
                        <FaFileImport className="mr-2" /> Import CSV
                    </Link>
                    <Link to="/raw-foods/new" className="flex items-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                        <FaPlus className="mr-2" /> Thêm mới
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative max-w-md w-full">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo Tên hoặc Mã số..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 text-sm outline-none transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Sắp xếp theo:</span>
                    <select 
                        value={sort} 
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    >
                        <option value="createdAt">Ngày tạo</option>
                        <option value="name">Tên</option>
                        <option value="code">Mã số</option>
                        <option value="energy_kcal">Năng lượng</option>
                    </select>
                    <button 
                        onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 bg-white hover:bg-gray-50 text-gray-600 dark:text-gray-300 transition-colors font-bold"
                        title={order === 'ASC' ? 'Tăng dần' : 'Giảm dần'}
                    >
                        {order === 'ASC' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSortChange('code')}>Code {sort === 'code' && (order === 'ASC' ? '↑' : '↓')}</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Hình ảnh</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSortChange('name')}>Tên nguyên liệu {sort === 'name' && (order === 'ASC' ? '↑' : '↓')}</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Đơn vị</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSortChange('energy_kcal')}>Năng lượng {sort === 'energy_kcal' && (order === 'ASC' ? '↑' : '↓')}</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Đạm/Béo/Bột (g)</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center p-5 text-gray-500 dark:text-gray-400">Đang tải...</td>
                            </tr>
                        ) : foods.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center p-5 text-gray-500 dark:text-gray-400">Không có dữ liệu.</td>
                            </tr>
                        ) : (
                            foods.map((food, index) => (
                                <tr key={food.id} className={`border-b border-gray-200 dark:border-gray-600 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/70'}`}>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle"><strong>{food.code}</strong></td>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500 overflow-hidden border border-gray-200 dark:border-gray-600">
                                            {food.image ? (
                                                <img src={`http://localhost:3000${food.image}`} alt={food.name} className="w-full h-full object-cover" />
                                            ) : (
                                                'No Image'
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">{food.name}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">{food.unit}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">{food.energy_kcal} (Kcal/100g)</td>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">
                                        <span className="font-bold text-red-500 dark:text-red-400">{food.protein_g}</span> / 
                                        <span className="font-bold text-amber-500 dark:text-amber-400">{food.fat_g}</span> / 
                                        <span className="font-bold text-blue-500 dark:text-blue-400">{food.carb_g}</span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle">
                                        <div className="flex gap-2">
                                            <Link to={`/raw-foods/${food.id}`} className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center" title="Xem chi tiết">
                                                <FaEye />
                                            </Link>
                                            <Link to={`/raw-foods/edit/${food.id}`} className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center" title="Sửa">
                                                <FaEdit />
                                            </Link>
                                            <button onClick={() => handleDelete(food.id)} className="p-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer" title="Xóa">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* Pagination */}
                <div className="flex justify-end items-center p-4 gap-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={`px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`}
                    >
                        Trước
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className={`px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RawFoodList;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mealService, type Meal } from '../../services/mealService';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaFilter } from 'react-icons/fa';

const MealList: React.FC = () => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;
    
    // AC2: Filter states
    const [mealCategoryFilter, setMealCategoryFilter] = useState<string>('');
    const [dietTagFilter, setDietTagFilter] = useState<string>('');
    const [calorieMin, setCalorieMin] = useState<string>('');
    const [calorieMax, setCalorieMax] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const filters = {
                meal_category: mealCategoryFilter || undefined,
                diet_tag: dietTagFilter || undefined,
                calorie_min: calorieMin ? parseFloat(calorieMin) : undefined,
                calorie_max: calorieMax ? parseFloat(calorieMax) : undefined,
                status: statusFilter || undefined
            };
            const response = await mealService.getAll(page, LIMIT, search, sort, order, filters);
            setMeals(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching meals', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, [page, search, sort, order, mealCategoryFilter, dietTagFilter, calorieMin, calorieMax, statusFilter]);

    const handleSortChange = (newSort: string) => {
        if (sort === newSort) {
            setOrder(order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSort(newSort);
            setOrder('ASC');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchMeals();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này không?')) {
            try {
                await mealService.delete(id);
                fetchMeals();
            } catch (error) {
                console.error('Error deleting meal', error);
                alert('Không thể xóa món ăn.');
            }
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'breakfast': 'Sáng',
            'lunch': 'Trưa',
            'dinner': 'Tối',
            'snack': 'Vặt'
        };
        return labels[category] || category;
    };

    const getDietTagLabel = (tag: string) => {
        const labels: Record<string, string> = {
            'keto': 'Keto',
            'low_carb': 'Low Carb',
            'high_protein': 'High Protein',
            'low_fat': 'Low Fat',
            'balanced': 'Cân bằng'
        };
        return labels[tag] || tag;
    };

    const clearFilters = () => {
        setMealCategoryFilter('');
        setDietTagFilter('');
        setCalorieMin('');
        setCalorieMax('');
        setStatusFilter('');
        setPage(1);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Món ăn</h1>
                <Link to="/meals/new" className="flex items-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                    <FaPlus className="mr-2" /> Thêm mới
                </Link>
            </div>

            {/* AC3: Search Bar */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md w-full">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên món..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition-all"
                        />
                    </form>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors font-medium text-sm"
                    >
                        <FaFilter /> {showFilters ? 'Ẩn' : 'Hiện'} Bộ lọc
                    </button>
                    <span className="text-sm text-gray-600 font-medium">Sắp xếp theo:</span>
                    <select 
                        value={sort} 
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    >
                        <option value="createdAt">Ngày tạo</option>
                        <option value="name">Tên</option>
                        <option value="total_calories">Tổng Calo</option>
                    </select>
                    <button 
                        onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
                        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-colors font-bold"
                        title={order === 'ASC' ? 'Tăng dần' : 'Giảm dần'}
                    >
                        {order === 'ASC' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* AC2: Filter Panel */}
            {showFilters && (
                <div className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">Bộ lọc</h3>
                        <button
                            onClick={clearFilters}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Filter by Meal Category */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bữa ăn</label>
                            <select
                                value={mealCategoryFilter}
                                onChange={(e) => {
                                    setMealCategoryFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                <option value="breakfast">Ăn sáng</option>
                                <option value="lunch">Ăn trưa</option>
                                <option value="dinner">Ăn tối</option>
                                <option value="snack">Ăn vặt</option>
                            </select>
                        </div>

                        {/* Filter by Diet Tag */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Chế độ</label>
                            <select
                                value={dietTagFilter}
                                onChange={(e) => {
                                    setDietTagFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                <option value="keto">Keto</option>
                                <option value="low_carb">Low Carb</option>
                                <option value="high_protein">High Protein</option>
                                <option value="low_fat">Low Fat</option>
                                <option value="balanced">Cân bằng</option>
                            </select>
                        </div>

                        {/* Filter by Calorie Range */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Calo tối thiểu</label>
                            <input
                                type="number"
                                placeholder="VD: 0"
                                value={calorieMin}
                                onChange={(e) => {
                                    setCalorieMin(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Calo tối đa</label>
                            <input
                                type="number"
                                placeholder="VD: 300"
                                value={calorieMax}
                                onChange={(e) => {
                                    setCalorieMax(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Filter by Status */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Trạng thái</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Hình ảnh</th>
                            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSortChange('name')}>Tên món {sort === 'name' && (order === 'ASC' ? '↑' : '↓')}</th>
                            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Nhóm bữa ăn</th>
                            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer select-none hover:bg-gray-100 transition-colors" onClick={() => handleSortChange('total_calories')}>Tổng Calo {sort === 'total_calories' && (order === 'ASC' ? '↑' : '↓')}</th>
                            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Tag Chế độ</th>
                            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Trạng thái</th>
                            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center p-5">Đang tải...</td>
                            </tr>
                        ) : meals.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center p-5">Không có dữ liệu.</td>
                            </tr>
                        ) : (
                            meals.map((meal) => (
                                <tr key={meal.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-sm text-gray-700 align-middle">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 overflow-hidden border border-gray-200">
                                            {meal.image ? (
                                                <img src={`http://localhost:3000${meal.image}`} alt={meal.name} className="w-full h-full object-cover" />
                                            ) : (
                                                'No Image'
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700 align-middle font-medium">{meal.name}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700 align-middle">
                                        {meal.meal_categories && meal.meal_categories.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {meal.meal_categories.map((cat, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                        {getCategoryLabel(cat)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Chưa chọn</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700 align-middle font-semibold">
                                        {meal.total_calories ? `${Math.round(meal.total_calories)} kcal` : '0 kcal'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700 align-middle">
                                        {meal.diet_tags && meal.diet_tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {meal.diet_tags.map((tag, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                                                        {getDietTagLabel(tag)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700 align-middle">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            meal.status === 'active' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {meal.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700 align-middle">
                                        <div className="flex gap-2">
                                            <Link to={`/meals/${meal.id}`} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors flex items-center justify-center" title="Xem chi tiết">
                                                <FaEye />
                                            </Link>
                                            <Link to={`/meals/edit/${meal.id}`} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors flex items-center justify-center" title="Sửa">
                                                <FaEdit />
                                            </Link>
                                            <button onClick={() => handleDelete(meal.id)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer" title="Xóa">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* AC4: Pagination */}
                <div className="flex justify-end items-center p-4 gap-3 bg-white border-t border-gray-200">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={`px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                    >
                        Trước
                    </button>
                    <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className={`px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 transition-colors ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealList;

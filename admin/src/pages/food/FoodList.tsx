import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { foodService, type Food, type FoodStats } from '../../services/foodService';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChefHat,
    Utensils,
    Flame,
    Sparkles,
    XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';
import { confirmToast } from '../../utils/toastUtils';
import FoodGeneratorModal from '../../components/FoodGeneratorModal';
import FoodStatsOverview from '../../components/FoodStatsOverview';

const FoodList: React.FC = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [foods, setFoods] = useState<Food[]>([]);
    const [stats, setStats] = useState<FoodStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('created_at');
    const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    // Filters
    const [mealCategoryFilter, setMealCategoryFilter] = useState<string>('');
    const [dietTagFilter, setDietTagFilter] = useState<string>('');
    const [calorieMin, setCalorieMin] = useState<string>('');
    const [calorieMax, setCalorieMax] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [availableDietPresets, setAvailableDietPresets] = useState<{ id: number; code: string; name: string }[]>([]);

    // Modal
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await foodService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchDietPresets = async () => {
        try {
            const presets = await foodService.getDietPresets();
            setAvailableDietPresets(presets);
        } catch (error) {
            console.error('Error fetching diet presets:', error);
        }
    };

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const filters = {
                meal_category: mealCategoryFilter || undefined,
                diet_tag: dietTagFilter || undefined,
                calorie_min: calorieMin ? parseFloat(calorieMin) : undefined,
                calorie_max: calorieMax ? parseFloat(calorieMax) : undefined,
                status: statusFilter || undefined
            };
            const response = await foodService.getAll(page, LIMIT, search, sort, order, filters);
            setFoods(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching foods', error);
            toast.error('Không thể tải danh sách món ăn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchDietPresets();
    }, []);

    useEffect(() => {
        fetchFoods();
    }, [page, search, sort, order, mealCategoryFilter, dietTagFilter, calorieMin, calorieMax, statusFilter]);

    const handleSortChange = (newSort: string) => {
        if (sort === newSort) {
            setOrder(order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSort(newSort);
            setOrder('ASC');
        }
    };

    const handleDelete = (id: number, name: string) => {
        confirmToast({
            message: 'Bạn có chắc muốn xóa món này? Hành động này sẽ ẩn món ăn khỏi ứng dụng.',
            confirmText: 'Xóa món ăn',
            onConfirm: async () => {
                try {
                    await foodService.delete(id);
                    toast.success('Đã xóa món ăn thành công');
                    addNotification({ message: `Đã xóa món ăn "${name}"`, link: '/foods' });
                    fetchFoods();
                    fetchStats();
                } catch (error) {
                    console.error('Error deleting food', error);
                    toast.error('Không thể xóa món ăn.');
                }
            }
        });
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



    const clearFilters = () => {
        setMealCategoryFilter('');
        setDietTagFilter('');
        setCalorieMin('');
        setCalorieMax('');
        setStatusFilter('');
        setPage(1);
        setShowFilters(false);
    };

    const renderSortIcon = (column: string) => {
        if (sort !== column) return <ArrowUpDown size={14} className="text-gray-400" />;
        return order === 'ASC'
            ? <ArrowUp size={14} className="text-emerald-500" />
            : <ArrowDown size={14} className="text-emerald-500" />;
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Thực Đơn</h1>
                    <p className="text-gray-500 mt-1">Quản lý danh sách món ăn và công thức nấu nướng</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors font-medium border border-indigo-100"
                    >
                        <Sparkles size={18} />
                        AI Chef
                    </button>
                    <Link
                        to="/foods/new"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 font-medium"
                    >
                        <Plus size={18} />
                        Thêm món mới
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && <FoodStatsOverview stats={stats} />}

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm món ăn..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 font-medium transition-colors ${showFilters ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={18} />
                            Bộ lọc
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl min-w-[200px]">
                            <span className="text-gray-500 text-sm whitespace-nowrap">Sắp xếp:</span>
                            <select
                                className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer w-full text-sm"
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="created_at">Ngày tạo</option>
                                <option value="name">Tên A-Z</option>
                                <option value="calories">Calories</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bữa ăn</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                value={mealCategoryFilter}
                                onChange={(e) => { setMealCategoryFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">Tất cả</option>
                                <option value="breakfast">Ăn sáng</option>
                                <option value="lunch">Ăn trưa</option>
                                <option value="dinner">Ăn tối</option>
                                <option value="snack">Ăn vặt</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Chế độ</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                value={dietTagFilter}
                                onChange={(e) => { setDietTagFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">Tất cả</option>
                                {availableDietPresets.map(preset => (
                                    <option key={preset.id} value={preset.code}>{preset.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-red-100 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                                <XCircle size={16} />
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wider">
                                <th className="p-4 font-semibold text-center w-20">Ảnh</th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none"
                                    onClick={() => handleSortChange('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Tên Món {renderSortIcon('name')}
                                    </div>
                                </th>
                                <th className="p-4 font-semibold">Phân loại</th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none"
                                    onClick={() => handleSortChange('calories')}
                                >
                                    <div className="flex items-center gap-1">
                                        Dinh dưỡng {renderSortIcon('calories')}
                                    </div>
                                </th>
                                <th className="p-4 font-semibold">Chế độ</th>
                                <th className="p-4 font-semibold text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-10 w-10 bg-gray-100 rounded-lg mx-auto"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-6 bg-gray-100 rounded w-20 mx-auto"></div></td>
                                        <td className="p-4"><div className="h-8 bg-gray-100 rounded w-24 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : foods.length > 0 ? (
                                foods.map((food) => (
                                    <tr key={food.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-4 text-center">
                                            {food.image ? (
                                                <img
                                                    src={`http://localhost:3000${food.image}`}
                                                    alt={food.name}
                                                    className="w-10 h-10 object-cover rounded-lg shadow-sm border border-gray-100 mx-auto"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-400 rounded-lg border border-indigo-100 flex items-center justify-center mx-auto">
                                                    <Utensils size={18} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{food.name}</div>
                                            <div className="text-xs text-gray-500">{food.serving_unit || 'Suất'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {food.meal_categories && food.meal_categories.length > 0 ? (
                                                    food.meal_categories.map((cat, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wide border border-indigo-100">
                                                            {getCategoryLabel(cat)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">--</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Flame size={14} className="text-orange-500" />
                                                <span className="text-sm font-bold text-gray-700">{Math.round(food.calories || 0)} <span className="text-xs font-normal text-gray-500">kcal</span></span>
                                            </div>
                                            <div className="text-xs text-gray-500 flex gap-2">
                                                <span title="Protein">P: <span className="font-medium text-gray-700">{food.protein || 0}</span></span>
                                                <span title="Carb">C: <span className="font-medium text-gray-700">{food.carb || 0}</span></span>
                                                <span title="Fat">F: <span className="font-medium text-gray-700">{food.fat || 0}</span></span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                <div className="flex flex-wrap gap-1">
                                                    {food.dietPresets && food.dietPresets.length > 0 ? (
                                                        food.dietPresets.slice(0, 2).map((preset, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium border border-emerald-100">
                                                                {preset.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">--</span>
                                                    )}
                                                    {food.dietPresets && food.dietPresets.length > 2 && (
                                                        <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] font-medium border border-gray-100">+{food.dietPresets.length - 2}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${food.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {food.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/foods/${food.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link to={`/foods/edit/${food.id}`} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Chỉnh sửa">
                                                    <Edit3 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(food.id, food.name)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <ChefHat size={32} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">Chưa có món ăn nào</p>
                                            <p className="text-sm">Hãy thử thêm món mới hoặc dùng AI để tạo thực đơn!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-600">
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            <FoodGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={() => {
                    fetchFoods();
                    setIsAIModalOpen(false);
                }}
                onEdit={(data) => {
                    setIsAIModalOpen(false);
                    navigate('/foods/new', { state: { aiData: data } });
                }}
            />
        </div>
    );
};

export default FoodList;

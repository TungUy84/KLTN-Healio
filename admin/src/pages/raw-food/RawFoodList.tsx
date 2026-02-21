import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    rawFoodService,
    type RawFood,
    type RawFoodStats
} from '../../services/rawFoodService';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Filter,
    Download,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Zap,
    Dumbbell,
    ImageOff,
    Leaf,
    XCircle,
    Carrot,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmToast } from '../../utils/toastUtils';
import RawFoodGeneratorModal from '../../components/RawFoodGeneratorModal';

const RawFoodList: React.FC = () => {
    const navigate = useNavigate();
    // Data State
    const [foods, setFoods] = useState<RawFood[]>([]);
    const [stats, setStats] = useState<RawFoodStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

    // Advanced Filters
    const [hasImage, setHasImage] = useState<'all' | 'true' | 'false'>('all');
    const [minKcal, setMinKcal] = useState<string>('');
    const [maxKcal, setMaxKcal] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    const LIMIT = 10;

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchFoods();
    }, [page, sort, order, searchTerm, hasImage, minKcal, maxKcal]);

    const fetchStats = async () => {
        try {
            const data = await rawFoodService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const filters = {
                has_image: hasImage === 'all' ? undefined : hasImage === 'true',
                min_kcal: minKcal ? Number(minKcal) : undefined,
                max_kcal: maxKcal ? Number(maxKcal) : undefined
            };

            const response = await rawFoodService.getAll(
                page,
                LIMIT,
                searchTerm,
                sort,
                order,
                filters
            );

            setFoods(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching raw foods', error);
            toast.error('Không thể tải danh sách nguyên liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        const newOrder = sort === field && order === 'DESC' ? 'ASC' : 'DESC';
        setSort(field);
        setOrder(newOrder);
    };

    const handleDelete = (id: number) => {
        confirmToast({
            message: 'Bạn có chắc chắn muốn xóa nguyên liệu này không? Hành động này không thể hoàn tác.',
            confirmText: 'Xóa ngay',
            onConfirm: async () => {
                try {
                    await rawFoodService.delete(id);
                    toast.success("Đã xóa nguyên liệu thành công");
                    fetchFoods();
                    fetchStats(); // Update stats
                } catch (error) {
                    console.error('Error deleting raw food', error);
                    toast.error("Không thể xóa nguyên liệu");
                }
            }
        });
    };

    const clearFilters = () => {
        setHasImage('all');
        setMinKcal('');
        setMaxKcal('');
        setSearchTerm('');
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
                    <h1 className="text-2xl font-bold text-gray-900">Kho Nguyên Liệu</h1>
                    <p className="text-gray-500 mt-1">Quản lý danh sách nguyên liệu thô và giá trị dinh dưỡng</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors font-medium border border-purple-100"
                    >
                        <Sparkles size={18} />
                        Tạo bằng AI
                    </button>
                    <Link
                        to="/raw-foods/import"
                        className="flex items-center gap-2 px-4 py-2 text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors font-medium"
                    >
                        <Download size={18} />
                        Import CSV
                    </Link>
                    <Link
                        to="/raw-foods/new"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 font-medium"
                    >
                        <Plus size={18} />
                        Thêm mới
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Leaf size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng nguyên liệu</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Calo trung bình</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.avgCalories} <span className="text-sm font-normal text-gray-400">kcal</span></h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <Dumbbell size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Giàu Protein (&gt;20g)</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.highProtein}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                            <ImageOff size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Chưa có ảnh</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.missingImage}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên hoặc Mã số..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="createdAt">Ngày tạo</option>
                                <option value="name">Tên A-Z</option>
                                <option value="energy_kcal">Năng lượng (Kcal)</option>
                                <option value="code">Mã số</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái hình ảnh</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                value={hasImage}
                                onChange={(e) => setHasImage(e.target.value as any)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="true">Đang có ảnh</option>
                                <option value="false">Chưa có ảnh (Thiếu)</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Calo từ</label>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    value={minKcal}
                                    onChange={(e) => setMinKcal(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Đến</label>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    value={maxKcal}
                                    onChange={(e) => setMaxKcal(e.target.value)}
                                />
                            </div>
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
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none"
                                    onClick={() => handleSort('code')}
                                >
                                    <div className="flex items-center gap-1">
                                        Code {renderSortIcon('code')}
                                    </div>
                                </th>
                                <th className="p-4 font-semibold text-center">Hình ảnh</th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Tên nguyên liệu {renderSortIcon('name')}
                                    </div>
                                </th>
                                <th className="p-4 font-semibold">Đơn vị</th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none"
                                    onClick={() => handleSort('energy_kcal')}
                                >
                                    <div className="flex items-center gap-1">
                                        Năng lượng {renderSortIcon('energy_kcal')}
                                    </div>
                                </th>
                                <th className="p-4 font-semibold text-center">Macros (P/F/C)</th>
                                <th className="p-4 font-semibold text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-10 w-10 bg-gray-100 rounded-lg mx-auto"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-24 mx-auto"></div></td>
                                        <td className="p-4"><div className="h-8 bg-gray-100 rounded w-20 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : foods.length > 0 ? (
                                foods.map((food) => (
                                    <tr key={food.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-medium">
                                                {food.code}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {food.image ? (
                                                <img
                                                    src={`http://localhost:3000${food.image}`}
                                                    alt={food.name}
                                                    className="w-12 h-12 object-cover rounded-xl shadow-sm border border-gray-100 mx-auto"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm border border-emerald-200 flex items-center justify-center mx-auto">
                                                    <Carrot size={24} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{food.name}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">{food.unit}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${food.energy_kcal > 300 ? 'bg-orange-100 text-orange-700' :
                                                food.energy_kcal < 100 ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {food.energy_kcal} Kcal
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-4 text-xs font-bold">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-gray-400 font-normal mb-0.5" title="Protein">P</span>
                                                    <span className="text-red-500">{food.protein_g}</span>
                                                </div>
                                                <div className="w-px h-6 bg-gray-100"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-gray-400 font-normal mb-0.5" title="Fat">F</span>
                                                    <span className="text-amber-500">{food.fat_g}</span>
                                                </div>
                                                <div className="w-px h-6 bg-gray-100"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-gray-400 font-normal mb-0.5" title="Carbs">C</span>
                                                    <span className="text-blue-500">{food.carb_g}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2 opacity-100 transition-opacity">
                                                <Link to={`/raw-foods/${food.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                    <Eye size={18} />
                                                </Link>
                                                <Link to={`/raw-foods/edit/${food.id}`} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(food.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                                                <Search size={32} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">Không tìm thấy nguyên liệu</p>
                                            <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc thêm nguyên liệu mới</p>
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                            .map((p, index, array) => (
                                <React.Fragment key={p}>
                                    {index > 0 && array[index - 1] !== p - 1 && (
                                        <span className="px-2 text-gray-400">...</span>
                                    )}
                                    <button
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${page === p
                                            ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                </React.Fragment>
                            ))
                        }
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

            <RawFoodGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={() => {
                    fetchFoods();
                    fetchStats();
                    setIsAIModalOpen(false);
                }}
                onEdit={(data) => {
                    setIsAIModalOpen(false);
                    navigate(`/raw-foods/new?aiData=${encodeURIComponent(JSON.stringify(data))}`);
                }}
            />
        </div>
    );
};

export default RawFoodList;

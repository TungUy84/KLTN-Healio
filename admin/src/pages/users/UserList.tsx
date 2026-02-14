import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminUserService, type AdminUser } from '../../services/adminUserService';
import {
    Search,
    Eye,
    Shield,
    User,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Check,
    Lock,
    XCircle,
    Activity,
    Utensils,
    Target,
    UserX
} from 'lucide-react';
import UserStatsOverview from '../../components/UserStatsOverview';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'user' | 'admin' | ''>('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'banned' | 'pending' | ''>('');
    const [sort, setSort] = useState('created_at');
    const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const LIMIT = 20;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminUserService.list({
                page,
                limit: LIMIT,
                search: search || undefined,
                role: roleFilter || undefined,
                status: statusFilter || undefined,
                sort,
                order,
            });
            setUsers(res.data);
            setTotalPages(res.pagination.totalPages);
        } catch (e) {
            console.error('Error fetching users', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, roleFilter, statusFilter, sort, order]);

    const handleSort = (field: string) => {
        if (sort === field) {
            setOrder(order === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSort(field);
            setOrder('DESC');
        }
    };

    const renderSortIcon = (field: string) => {
        if (sort !== field) return <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-50 transition-opacity" />;
        return order === 'ASC'
            ? <ArrowUp size={14} className="text-emerald-500" />
            : <ArrowDown size={14} className="text-emerald-500" />;
    };

    // Helper to format date safely
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) return '—';
            return date.toLocaleDateString('vi-VN');
        } catch {
            return '—';
        }
    };

    const roleLabel = (r: string) => (r === 'admin' ? 'Quản trị viên' : 'Người dùng');

    const statusConfig = (s: string) => {
        if (s === 'active') return { label: 'Active', color: 'bg-green-100 text-green-700', icon: Check };
        if (s === 'banned') return { label: 'Banned', color: 'bg-red-100 text-red-700', icon: Lock };
        return { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: MoreHorizontal };
    };

    const clearFilters = () => {
        setRoleFilter('');
        setStatusFilter('');
        setPage(1);
        setShowFilters(false);
        setSearch('');
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài khoản</h1>
                    <p className="text-gray-500 mt-1">Xem và quản lý tất cả người dùng trong hệ thống.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <UserStatsOverview />

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 font-medium transition-colors ${showFilters ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Filter size={18} />
                            Bộ lọc
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl min-w-[200px]">
                            <span className="text-gray-500 text-sm whitespace-nowrap">Sắp xếp:</span>
                            <select
                                className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer w-full text-sm outline-none"
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="created_at">Ngày tham gia</option>
                                <option value="full_name">Tên A-Z</option>
                                <option value="role">Vai trò</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value as any); setPage(1); }}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="user">Người dùng</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Hoạt động</option>
                                <option value="banned">Đã khóa</option>
                                <option value="pending">Chờ xác thực</option>
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
                                <th
                                    className="p-4 font-semibold text-center w-20 cursor-pointer hover:text-emerald-600 transition-colors select-none whitespace-nowrap"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center justify-center gap-1">ID {renderSortIcon('id')}</div>
                                </th>
                                <th className="p-4 font-semibold whitespace-nowrap">Người dùng</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Mục tiêu</th>
                                <th className="p-4 font-semibold text-center whitespace-nowrap">Chế độ ăn</th>
                                <th className="p-4 font-semibold text-center whitespace-nowrap">Vận động</th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none text-center whitespace-nowrap"
                                    onClick={() => handleSort('role')}
                                >
                                    <div className="flex items-center justify-center gap-1">Vai trò {renderSortIcon('role')}</div>
                                </th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none text-center whitespace-nowrap"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center justify-center gap-1">Trạng thái {renderSortIcon('status')}</div>
                                </th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-emerald-600 transition-colors select-none text-center whitespace-nowrap"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center justify-center gap-1">Ngày tham gia {renderSortIcon('created_at')}</div>
                                </th>
                                <th className="p-4 font-semibold text-center whitespace-nowrap">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-6 w-10 bg-gray-100 rounded mx-auto"></div></td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                                    <div className="h-3 w-48 bg-gray-100 rounded"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="p-4"><div className="h-6 w-6 bg-gray-100 rounded-full mx-auto"></div></td>
                                        <td className="p-4"><div className="h-6 w-24 bg-gray-100 rounded-full"></div></td>
                                        <td className="p-4"><div className="h-6 w-20 bg-gray-100 rounded-full mx-auto"></div></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="p-4"><div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <UserX size={32} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">Không tìm thấy người dùng</p>
                                            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const statusStyle = statusConfig(u.status);

                                    const getGoalLabel = (type: string | null) => {
                                        const map: Record<string, string> = {
                                            'lose_weight': 'Giảm cân',
                                            'gain_muscle': 'Tăng cơ',
                                            'maintain': 'Duy trì',
                                            'improve_health': 'Sức khỏe'
                                        };
                                        return type ? (map[type] || type) : '—';
                                    };

                                    const getActivityLabel = (level: string | null) => {
                                        const map: Record<string, string> = {
                                            'sedentary': 'Ít vận động',
                                            'lightly_active': 'Nhẹ nhàng',
                                            'moderately_active': 'Vừa phải',
                                            'very_active': 'Năng động',
                                            'extra_active': 'Rất năng động'
                                        };
                                        return level ? (map[level] || level) : '—';
                                    };

                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-4 text-center text-gray-500 font-mono text-sm whitespace-nowrap">#{u.id}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative shrink-0">
                                                        {u.avatar ? (
                                                            <img
                                                                src={u.avatar.startsWith('http') ? u.avatar : `http://localhost:3000${u.avatar}`}
                                                                alt=""
                                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm border border-gray-100"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm border border-gray-100">
                                                                {(u.full_name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${u.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    </div>
                                                    <div className="min-w-[150px]">
                                                        <div className="font-semibold text-gray-900 whitespace-nowrap">{u.full_name}</div>
                                                        <div className="text-xs text-gray-500 whitespace-nowrap">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {u.goal_type ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100 whitespace-nowrap">
                                                        <Target size={12} />
                                                        {getGoalLabel(u.goal_type)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                {u.diet_mode ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 whitespace-nowrap">
                                                        <Utensils size={12} />
                                                        {u.diet_mode}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                {u.activity_level ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 whitespace-nowrap">
                                                        <Activity size={12} />
                                                        {getActivityLabel(u.activity_level)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                    {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                                    {roleLabel(u.role)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle.color}`}>
                                                    {statusStyle.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-600 whitespace-nowrap">
                                                {formatDate(u.created_at)}
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <Link
                                                    to={`/users/${u.id}`}
                                                    className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/30">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-600 flex items-center">
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;

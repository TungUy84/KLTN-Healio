import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminUserService, type AdminUser } from '../../services/adminUserService';
import { FaSearch, FaEye, FaUser, FaUserShield } from 'react-icons/fa';

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
    const LIMIT = 20; // PB_57: Phân trang 20 dòng/trang

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

    const roleLabel = (r: string) => (r === 'admin' ? 'Admin' : 'User');
    const statusLabel = (s: string) => {
        if (s === 'active') return 'Hoạt động';
        if (s === 'banned') return 'Đã khóa';
        return 'Chờ kích hoạt';
    };
    const statusClass = (s: string) => {
        if (s === 'active') return 'bg-green-100 text-green-700';
        if (s === 'banned') return 'bg-red-100 text-red-700';
        return 'bg-amber-100 text-amber-700';
    };
    const goalLabel = (g: string | null) => {
        if (!g) return '—';
        const m: Record<string, string> = {
            lose_weight: 'Giảm cân',
            maintain: 'Duy trì',
            gain_weight: 'Tăng cân',
        };
        return m[g] || g;
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quản lý Tài khoản</h1>
                <p className="text-base text-gray-500 dark:text-gray-400">Danh sách user và admin, vai trò và trạng thái</p>
            </div>

            <div className="flex flex-wrap gap-4 items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Tìm theo email hoặc tên..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value as 'user' | 'admin' | '');
                        setPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm bg-white cursor-pointer"
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value as 'active' | 'banned' | 'pending' | '');
                        setPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm bg-white cursor-pointer"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="banned">Đã khóa</option>
                    <option value="pending">Chờ kích hoạt</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Sắp xếp:</span>
                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm bg-white cursor-pointer"
                >
                    <option value="created_at">Ngày tạo</option>
                    <option value="full_name">Tên</option>
                    <option value="email">Email</option>
                </select>
                <button
                    type="button"
                    onClick={() => setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'))}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 bg-white hover:bg-gray-50 text-gray-600 dark:text-gray-300 font-bold"
                >
                    {order === 'ASC' ? '↑' : '↓'}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">ID</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Avatar</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Tên</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Email</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Vai trò</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Mục tiêu</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Trạng thái</th>
                            <th className="bg-gray-50 dark:bg-gray-700/80 px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center p-8 text-gray-500 dark:text-gray-400">Đang tải...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center p-8 text-gray-500 dark:text-gray-400">Không có tài khoản.</td>
                            </tr>
                        ) : (
                            users.map((u, index) => (
                                <tr key={u.id} className={`border-b border-gray-200 dark:border-gray-600 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/70'}`}>
                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{u.id}</td>
                                    <td className="px-4 py-4">
                                        {u.avatar ? (
                                            <img
                                                src={u.avatar.startsWith('http') ? u.avatar : `http://localhost:3000${u.avatar}`}
                                                alt=""
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                                                {(u.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">{u.full_name}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>
                                            {u.role === 'admin' ? <FaUserShield /> : <FaUser />}
                                            {roleLabel(u.role)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{goalLabel(u.goal_type)}</td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : u.status === 'banned' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'}`}>
                                            {statusLabel(u.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Link
                                            to={`/users/${u.id}`}
                                            className="inline-flex items-center gap-1 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <FaEye /> Chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="flex justify-end items-center p-4 gap-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className={`px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`}
                    >
                        Trước
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className={`px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'}`}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserList;

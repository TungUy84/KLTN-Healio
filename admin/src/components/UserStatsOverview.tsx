import React, { useEffect, useState } from 'react';
import { adminUserService, type AdminUserStats } from '../services/adminUserService';
import { Users, UserPlus, UserX, Clock, Shield } from 'lucide-react';

const UserStatsOverview: React.FC = () => {
    const [stats, setStats] = useState<AdminUserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminUserService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch user stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Styles borrowed from FoodStatsOverview for consistency
    const cardBaseClass = "relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl shadow-sm border h-full transition-transform hover:-translate-y-1";
    const bgDecorClass = "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50";
    const titleClass = "font-bold mb-4 flex items-center gap-2 relative z-10 text-base text-gray-900";

    const StatItem = ({
        icon: Icon,
        value,
        label,
        color,
        bgClass
    }: {
        icon: any,
        value: string | number,
        label: string,
        color: string,
        bgClass: string
    }) => (
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl ${bgClass} ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
                <h4 className={`text-2xl font-bold ${color}`}>
                    {loading ? '...' : value}
                </h4>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Total & Active */}
            <div className={`bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 border-indigo-100 ${cardBaseClass}`}>
                <div className={`bg-indigo-200/40 ${bgDecorClass}`}></div>
                <h3 className={titleClass}>
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Tổng quan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatItem
                        icon={Users}
                        value={stats?.total.toLocaleString() ?? 0}
                        label="Tổng số"
                        color="text-indigo-700"
                        bgClass="bg-indigo-100"
                    />
                    <StatItem
                        icon={Shield}
                        value={stats?.roles.admin.toLocaleString() ?? 0}
                        label="Quản trị viên"
                        color="text-blue-700"
                        bgClass="bg-blue-100"
                    />
                </div>
            </div>

            {/* Column 2: Growth */}
            <div className={`bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-100 ${cardBaseClass}`}>
                <div className={`bg-emerald-200/40 ${bgDecorClass}`}></div>
                <h3 className={titleClass}>
                    <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                    Tăng trưởng tuần này
                </h3>
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-full bg-emerald-100 text-emerald-600">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-emerald-700">
                            +{stats?.new_this_week.toLocaleString() ?? 0}
                        </div>
                        <p className="text-emerald-600 text-sm font-medium">Người dùng mới</p>
                    </div>
                </div>
            </div>

            {/* Column 3: Attention Needed */}
            <div className={`bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-100 ${cardBaseClass}`}>
                <div className={`bg-amber-200/40 ${bgDecorClass}`}></div>
                <h3 className={titleClass}>
                    <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                    Cần chú ý
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatItem
                        icon={Clock}
                        value={stats?.status.pending.toLocaleString() ?? 0}
                        label="Chờ xác thực"
                        color="text-amber-700"
                        bgClass="bg-amber-100"
                    />
                    <StatItem
                        icon={UserX}
                        value={stats?.status.banned.toLocaleString() ?? 0}
                        label="Đã khóa"
                        color="text-red-700"
                        bgClass="bg-red-100"
                    />
                </div>
            </div>
        </div>
    );
};

export default UserStatsOverview;

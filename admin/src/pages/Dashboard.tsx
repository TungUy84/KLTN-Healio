import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { dashboardService } from '../services/dashboardService';
import {
    FaUsers,
    FaUserShield,
    FaLeaf,
    FaUtensils,
    FaPlus,
    FaArrowRight
} from 'react-icons/fa';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// Types
interface Stats {
    users: number;
    admins: number;
    ingredients: number;
    foods: number;
}

interface Activity {
    id: number;
    user: string;
    action: string;
    time: string;
    avatar: string | null;
}

interface FoodStat {
    name: string;
    count: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [topFoods, setTopFoods] = useState<FoodStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activitiesData, foodsData] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getRecentActivities(),
                    dashboardService.getTopFoods()
                ]);
                setStats(statsData);
                setActivities(activitiesData);
                setTopFoods(foodsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-200">Đang tải dữ liệu...</div>;

    const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tổng quan</h1>
                <p className="text-base text-gray-500 dark:text-gray-200">Chào mừng trở lại, Administrator!</p>
            </div>

            {/* PB_40: Overview Stats Cards - Colorlib style */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-8">
                <StatsCard
                    title="Tổng Users"
                    value={stats?.users || 0}
                    icon={<FaUsers />}
                    theme="orange"
                    onClick={() => navigate('/users')}
                />
                <StatsCard
                    title="Tổng Admin"
                    value={stats?.admins || 0}
                    icon={<FaUserShield />}
                    theme="pink"
                    onClick={() => navigate('/users')}
                />
                <StatsCard
                    title="Tổng Nguyên liệu"
                    value={stats?.ingredients || 0}
                    icon={<FaLeaf />}
                    theme="green"
                    onClick={() => navigate('/raw-foods')}
                />
                <StatsCard
                    title="Tổng Món ăn"
                    value={stats?.foods || 0}
                    icon={<FaUtensils />}
                    theme="blue"
                    onClick={() => navigate('/foods')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Charts & Shortcuts */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* PB_43: Popular Foods Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Món ăn phổ biến (Top 5)</h3>
                            <button className="bg-none border-none text-indigo-600 dark:text-indigo-300 text-sm font-medium cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-200">Xem chi tiết</button>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topFoods} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#4B5563' : '#E5E7EB'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#D1D5DB' : '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#D1D5DB' : '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: isDark ? '#374151' : '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backgroundColor: isDark ? '#1F2937' : '#fff', color: isDark ? '#E5E7EB' : '#111' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                        {topFoods.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* PB_42: Shortcuts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center cursor-pointer shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.99]"
                            onClick={() => navigate('/raw-foods/new')}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <FaPlus />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-0.5 mt-0">Thêm Nguyên liệu</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-200 m-0">Tạo nguyên liệu thô mới</p>
                            </div>
                            <span className="text-gray-400 dark:text-gray-300 text-sm"><FaArrowRight /></span>
                        </div>

                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center cursor-pointer shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.99]"
                            onClick={() => navigate('/foods/new')}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                <FaUtensils />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-0.5 mt-0">Tạo Món ăn</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-200 m-0">Công thức món ăn mới</p>
                            </div>
                            <span className="text-gray-400 dark:text-gray-300 text-sm"><FaArrowRight /></span>
                        </div>
                    </div>

                </div>

                {/* Right Column: Recent Activity */}
                <div className="lg:col-span-1">
                    {/* PB_41: Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hoạt động gần nhất</h3>
                        <div className="flex flex-col gap-5">
                            {activities.map((activity) => {
                                const firstLetter = activity.user?.charAt(0)?.toUpperCase() || 'A';
                                return (
                                    <div key={activity.id} className="flex items-start">
                                        <div className="w-9 h-9 mr-3 flex-shrink-0">
                                            {activity.avatar ? (
                                                <img src={activity.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {firstLetter}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-200 m-0 mb-1">
                                                <span className="font-semibold text-gray-900 dark:text-white">{activity.user}</span> {activity.action}
                                            </p>
                                            <span className="text-xs text-gray-400 dark:text-gray-300 block">{activity.time}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="w-full mt-6 py-2 text-sm text-indigo-600 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors font-medium border-none cursor-pointer">
                            Xem tất cả hoạt động
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-Component for Stats Card - Colorlib style (colored bg, white text, mini sparkline)
type CardTheme = 'orange' | 'green' | 'pink' | 'blue';

const themeClasses: Record<CardTheme, { bg: string; bar: string }> = {
    orange: { bg: 'bg-orange-500', bar: 'bg-orange-400' },
    green: { bg: 'bg-emerald-500', bar: 'bg-emerald-400' },
    pink: { bg: 'bg-rose-500', bar: 'bg-rose-400' },
    blue: { bg: 'bg-blue-500', bar: 'bg-blue-400' },
};

const sparkData = [4, 6, 5, 8, 6, 9, 7, 5, 8, 6];
const maxSpark = Math.max(...sparkData);

const StatsCard = ({ title, value, icon, theme, onClick }: { title: string; value: number; icon: React.ReactNode; theme: CardTheme; onClick?: () => void }) => {
    const c = themeClasses[theme];
    return (
        <div
            className={`dashboard-stat-card ${c.bg} text-white rounded-2xl p-6 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.99]' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-bold opacity-95 m-0">{title}</p>
                <span className="text-2xl opacity-90">{icon}</span>
            </div>
            <h3 className="text-2xl font-bold m-0 mb-3">{value.toLocaleString()}</h3>
            <div className="flex items-end gap-0.5 h-8">
                {sparkData.map((v, i) => (
                    <div
                        key={i}
                        className={`flex-1 min-w-[4px] rounded-t ${c.bar}`}
                        style={{ height: `${(v / maxSpark) * 100}%`, opacity: 0.8 }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

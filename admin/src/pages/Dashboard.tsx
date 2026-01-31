import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan</h1>
                <p className="text-base text-gray-500">Chào mừng trở lại, Administrator!</p>
            </div>

            {/* PB_40: Overview Stats Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-8">
                <StatsCard
                    title="Tổng Users"
                    value={stats?.users || 0}
                    icon={<FaUsers />}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                    onClick={() => navigate('/users')}
                />
                <StatsCard
                    title="Tổng Admin"
                    value={stats?.admins || 0}
                    icon={<FaUserShield />}
                    color="text-violet-600"
                    bg="bg-violet-50"
                    onClick={() => navigate('/users')}
                />
                <StatsCard
                    title="Tổng Nguyên liệu"
                    value={stats?.ingredients || 0}
                    icon={<FaLeaf />}
                    color="text-emerald-500"
                    bg="bg-emerald-50"
                    onClick={() => navigate('/raw-foods')}
                />
                <StatsCard
                    title="Tổng Món ăn"
                    value={stats?.foods || 0}
                    icon={<FaUtensils />}
                    color="text-amber-500"
                    bg="bg-amber-50"
                    onClick={() => navigate('/foods')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Charts & Shortcuts */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* PB_43: Popular Foods Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Món ăn phổ biến (Top 5)</h3>
                            <button className="bg-none border-none text-indigo-600 text-sm font-medium cursor-pointer hover:text-indigo-800">Xem chi tiết</button>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topFoods} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
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
                            className="bg-white rounded-2xl p-5 flex items-center cursor-pointer shadow-sm hover:shadow-md transition-all"
                            onClick={() => navigate('/raw-foods/new')}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-4 bg-green-100 text-green-600">
                                <FaPlus />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[15px] font-semibold text-gray-900 mb-0.5 mt-0">Thêm Nguyên liệu</h4>
                                <p className="text-xs text-gray-500 m-0">Tạo nguyên liệu thô mới</p>
                            </div>
                            <span className="text-gray-400 text-sm"><FaArrowRight /></span>
                        </div>

                        <div
                            className="bg-white rounded-2xl p-5 flex items-center cursor-pointer shadow-sm hover:shadow-md transition-all"
                            onClick={() => navigate('/foods/new')}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-4 bg-orange-100 text-orange-600">
                                <FaUtensils />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[15px] font-semibold text-gray-900 mb-0.5 mt-0">Tạo Món ăn</h4>
                                <p className="text-xs text-gray-500 m-0">Công thức món ăn mới</p>
                            </div>
                            <span className="text-gray-400 text-sm"><FaArrowRight /></span>
                        </div>
                    </div>

                </div>

                {/* Right Column: Recent Activity */}
                <div className="lg:col-span-1">
                    {/* PB_41: Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần nhất</h3>
                        <div className="flex flex-col gap-5">
                            {activities.map((activity) => {
                                const firstLetter = activity.user?.charAt(0)?.toUpperCase() || 'A';
                                return (
                                    <div key={activity.id} className="flex items-start">
                                        <div className="w-9 h-9 mr-3 flex-shrink-0">
                                            {activity.avatar ? (
                                                <img src={activity.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {firstLetter}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 m-0 mb-1">
                                                <span className="font-semibold text-gray-900">{activity.user}</span> {activity.action}
                                            </p>
                                            <span className="text-xs text-gray-400 block">{activity.time}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="w-full mt-6 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors font-medium border-none cursor-pointer">
                            Xem tất cả hoạt động
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-Component for Stats Card
const StatsCard = ({ title, value, icon, color, bg, onClick }: any) => (
    <div
        className={`bg-white rounded-2xl p-6 flex items-center shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
        onClick={onClick}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${bg} ${color}`}>
            {icon}
        </div>
        <div className="flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-1 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 m-0">{value.toLocaleString()}</h3>
        </div>
    </div>
);

export default Dashboard;

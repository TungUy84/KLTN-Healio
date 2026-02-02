import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import {
    Users,
    Utensils,
    Leaf,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MoreHorizontal,
    Flame,
    Salad,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from 'recharts';


// Helper component for Food Image with Fallback
const FoodImage = ({ src, alt }: { src?: string; alt: string }) => {
    const [error, setError] = useState(false);

    if (src && !error) {
        return (
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
            <Salad size={24} />
        </div>
    );
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    // ... (rest of component)

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null); // Replace 'any' with your interface
    const [activities, setActivities] = useState<any[]>([]);
    const [topFoods, setTopFoods] = useState<any[]>([]);
    const [activityStats, setActivityStats] = useState<any[]>([]);
    const [macroStats, setMacroStats] = useState<any[]>([]);
    const [activeMacroIndex, setActiveMacroIndex] = useState<number | null>(null); // State to track hover on PieChart

    useEffect(() => {
        // Giả lập loading dữ liệu
        const fetchData = async () => {
            try {
                const [statsData, actData, foodData, chartData, macroData] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getRecentActivities(),
                    dashboardService.getTopFoods(),
                    dashboardService.getActivityStats(),
                    dashboardService.getMacroStats()
                ]);
                setStats(statsData);
                setActivities(actData);
                setTopFoods(foodData);
                setActivityStats(chartData);
                setMacroStats(macroData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">

            {/* 1. HEADER CHÀO MỪNG (Gọn gàng & Hiện đại) */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tổng quan Dashboard</h1>
                </div>
            </div>

            {/* 2. STATS CARDS (KPIs) - Phong cách Clean */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Users */}
                <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/users')}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        {stats?.usersGrowth !== undefined && (
                            <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stats.usersGrowth >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {stats.usersGrowth >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {Math.abs(stats.usersGrowth)}%
                            </span>
                        )}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-gray-900">{stats?.users?.toLocaleString() || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Người dùng hoạt động</p>
                    </div>
                </div>

                {/* Card 2: Foods */}
                <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/foods')}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Utensils size={24} />
                        </div>
                        {stats?.foodsGrowth !== undefined && (
                            <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stats.foodsGrowth >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {stats.foodsGrowth >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {Math.abs(stats.foodsGrowth)}%
                            </span>
                        )}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-gray-900">{stats?.foods?.toLocaleString() || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Công thức món ăn</p>
                    </div>
                </div>

                {/* Card 3: Calories Logged Today */}
                <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Flame size={24} />
                        </div>
                        <span className="flex items-center text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                            Hôm nay
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-gray-900">{stats?.caloriesToday?.toLocaleString() || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Kcal đã log hôm nay</p>
                    </div>
                </div>

                {/* Card 4: System Health / Raw Material */}
                <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1" onClick={() => navigate('/raw-foods')}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Leaf size={24} />
                        </div>
                        <span className="text-xs font-medium text-gray-400">Total</span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-gray-900">{stats?.ingredients?.toLocaleString() || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium">Nguyên liệu</p>
                    </div>
                </div>
            </div>

            {/* 3. CHART SECTION (Biểu đồ phân tích từ dữ liệu thật) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart: User Activity (Real Data - AreaChart) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Hoạt động User</h3>
                            <p className="text-sm text-gray-400">Số lượng nhật ký ăn uống được tạo (7 ngày qua)</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-xs text-gray-500">Logs</span>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={activityStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="logs" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorLogs)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Chart: Macro Distribution (Real Data) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Phân bổ Dinh dưỡng</h3>
                    <p className="text-sm text-gray-400 mb-6">Tỷ lệ Macro trung bình các món ăn</p>

                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={macroStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onMouseEnter={(_, index) => setActiveMacroIndex(index)}
                                    onMouseLeave={() => setActiveMacroIndex(null)}
                                >
                                    {macroStats.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke={activeMacroIndex === index ? '#fff' : 'none'} strokeWidth={2} className="transition-all duration-300 outline-none" style={{ filter: activeMacroIndex === index ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))' : 'none', transform: activeMacroIndex === index ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center' }} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                            {activeMacroIndex !== null && macroStats[activeMacroIndex] ? (
                                <>
                                    <span className="text-3xl font-bold text-gray-800 transition-all">{macroStats[activeMacroIndex].value}%</span>
                                    <span className="text-xs font-medium text-gray-400 mt-1 transition-all">{macroStats[activeMacroIndex].name}</span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-gray-800 transition-all">100%</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-4">
                        {macroStats.map((item: any) => (
                            <div key={item.name} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-xs font-medium text-gray-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. BOTTOM SECTION: TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top Trending Foods */}
                <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Món ăn phổ biến</h3>
                        <button className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">Xem tất cả</button>
                    </div>
                    <div className="space-y-4">
                        {topFoods.length > 0 ? topFoods.slice(0, 4).map((food, index) => (
                            <div
                                key={index}
                                onClick={() => food.id && navigate(`/foods/${food.id}`)}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                        <FoodImage src={food.image} alt={food.name} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">{food.name}</h4>
                                        <p className="text-xs text-gray-500">{Math.round(food.calories || 0)} kcal</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{food.count} logs</span>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm text-center py-4">Chưa có dữ liệu món ăn phổ biến</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h3>
                        <MoreHorizontal className="text-gray-400 cursor-pointer" />
                    </div>
                    <div className="space-y-6 relative pl-2">
                        {/* Timeline Line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-100"></div>

                        {activities.length > 0 ? activities.slice(0, 4).map((act) => (
                            <div key={act.id} className="relative flex gap-4 items-start">
                                <div className="z-10 w-7 h-7 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shrink-0">
                                    {/* Mini Icon inside dot */}
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800">
                                        <span className="font-bold">{act.user}</span> {act.action.toLowerCase()}
                                    </p>
                                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        <Clock size={10} /> {act.time}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm text-center py-4">Chưa có hoạt động nào</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
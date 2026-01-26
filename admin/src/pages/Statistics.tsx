import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';
import { FaUserPlus, FaUtensils, FaChartPie, FaDownload, FaLeaf } from 'react-icons/fa';

const Statistics = () => {
    const [growthData, setGrowthData] = useState([]);
    const [trendingFoods, setTrendingFoods] = useState([]);
    const [demographics, setDemographics] = useState({ goals: [], gender: [] });
    const [dietStats, setDietStats] = useState([]);
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        fetchAllData();
    }, [timeRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [growth, trending, demo, diets] = await Promise.all([
                api.get(`/stats/growth?range=${timeRange}`).then((res: any) => res.data),
                api.get(`/stats/trending-foods?days=${timeRange === '7d' ? 7 : 30}`).then((res: any) => res.data),
                api.get('/stats/demographics').then((res: any) => res.data),
                api.get('/stats/diets').then((res: any) => res.data)
            ]);

            setGrowthData(growth);
            setTrendingFoods(trending);
            setDemographics(demo);
            setDietStats(diets);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            // Need to handle blob response
            const response = await api.get('/stats/export', { responseType: 'blob' });

            // Create Blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Healio_Report.xlsx'); // or any other extension
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export Failed", error);
            alert("Xuất báo cáo thất bại");
        }
    };

    if (loading) return <div className="p-8">Đang tải dữ liệu...</div>;

    // Process Pie Data
    const goalData = demographics.goals.map((g: any) => ({ name: g.goal_type, value: parseInt(g.count) }));
    const genderData = demographics.gender.map((g: any) => ({ name: g.gender === 'male' ? 'Nam' : 'Nữ', value: parseInt(g.count) }));

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartPie className="text-blue-600" />
                        Thống kê & Báo cáo
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Tổng quan về người dùng, xu hướng và dinh dưỡng</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="7d">7 ngày qua</option>
                        <option value="30d">30 ngày qua</option>
                        <option value="month">Tháng này</option>
                        <option value="year">Năm nay</option>
                    </select>

                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all"
                    >
                        <FaDownload /> Xuất Báo Cáo
                    </button>
                </div>
            </div>

            {/* 1. User Growth (Line Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaUserPlus className="text-indigo-500" /> Tăng trưởng người dùng
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="User mới"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Demographics (Pie Charts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Goal Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bổ Mục tiêu</h3>
                    <div className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={goalData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {goalData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gender Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Phân bổ Giới tính</h3>
                    <div className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label
                                >
                                    {genderData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#EC4899'][index % 2]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Fallback if no data */}
                    {genderData.length === 0 && <p className="text-center text-gray-400">Chưa có dữ liệu</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 3. Trending Foods (Table) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaUtensils className="text-orange-500" /> Xu hướng Món ăn
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                                    <th className="pb-3 pl-2">Tên món</th>
                                    <th className="pb-3 text-right">Số lần chọn</th>
                                    <th className="pb-3 text-right">Tổng Calo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {trendingFoods.map((item: any, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pl-2 flex items-center gap-3">
                                            <span className="text-gray-400 font-bold w-4">{idx + 1}</span>
                                            {item.image ? (
                                                <img
                                                    src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.image}`}
                                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500">
                                                    <FaUtensils size={14} />
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                                        </td>
                                        <td className="py-3 text-right font-bold text-gray-700">{item.count}</td>
                                        <td className="py-3 text-right text-sm text-gray-500">{parseInt(item.total_calories).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Diet Stats (Bar Chart) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaLeaf className="text-green-500" /> Chế độ Dinh dưỡng
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={dietStats}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12, fill: '#4B5563' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;

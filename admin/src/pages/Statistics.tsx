
import React, { useEffect, useState } from 'react';
import { Calendar, Download, PieChart as PieChartIcon, Activity, User, Utensils } from 'lucide-react';
import { statsService } from '../services/statsService';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Import New Sections
import SectionSystem from '../components/stats/SectionSystem';
import SectionNutrition from '../components/stats/SectionNutrition';
import SectionGoals from '../components/stats/SectionGoals';
import SectionAdvanced from '../components/stats/SectionAdvanced';

const Statistics: React.FC = () => {
    // State for all data
    const [systemData, setSystemData] = useState<any>({});
    const [nutritionData, setNutritionData] = useState<any>({});
    const [goalData, setGoalData] = useState<any>({});
    const [insightsData, setInsightsData] = useState<any>({});
    const [foodData, setFoodData] = useState<any>({});
    const [peakData, setPeakData] = useState<any>([]);

    // Legacy state for compatibility or specific reused charts
    const [growthData, setGrowthData] = useState([]);

    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);

    const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'];

    useEffect(() => {
        fetchAllData();
    }, [timeRange]);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // Parallel Requests
            const [
                growthRes,
                systemRes,
                nutritionRes,
                goalRes,
                insightsRes,
                foodRes,
                peakRes
            ] = await Promise.all([
                statsService.getUserGrowth(timeRange),
                statsService.getSystemStats(),
                statsService.getNutritionStats(),
                statsService.getGoalStats(),
                statsService.getUserInsights(),
                statsService.getFoodStats(),
                statsService.getActivityPeak()
            ]);

            setGrowthData(growthRes);
            setSystemData(systemRes || {});
            setNutritionData(nutritionRes || {});
            setGoalData(goalRes || {});
            setInsightsData(insightsRes || {});
            setFoodData(foodRes || {});
            setPeakData(peakRes || []);

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // toast.error('Lỗi tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            toast.loading('Đang xuất báo cáo...');
            await statsService.exportReport();
            toast.dismiss();
            toast.success('Xuất báo cáo thành công!');
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error('Có lỗi khi xuất file');
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl shadow-lg shadow-black/5 border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <PieChartIcon className="text-emerald-600" />
                        Thống kê & Báo cáo
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng quan toàn diện hệ thống (V3 Mega Dashboard)</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            className="appearance-none border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none pr-10 cursor-pointer hover:bg-gray-100 transition-colors"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="7d">7 ngày qua</option>
                            <option value="30d">30 ngày qua</option>
                            <option value="month">Tháng này</option>
                            <option value="year">Năm nay</option>
                        </select>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    <button
                        onClick={handleExport}
                        className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-md shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                    >
                        <Download size={18} /> Xuất Báo Cáo
                    </button>
                </div>
            </div>

            {/* I. SYSTEM OVERVIEW */}
            <SectionSystem data={systemData} growthData={growthData} />

            {/* II. NUTRITION BEHAVIOR */}
            <SectionNutrition data={nutritionData} />

            {/* III. GOALS & EFFECTIVENESS */}
            <SectionGoals data={goalData} />

            {/* IV. USER INSIGHTS */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">IV. USER INSIGHTS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 13. User Segmentation */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <User size={18} className="text-indigo-500" /> Phân khúc người dùng (BMI)
                        </h3>
                        <div className="h-[250px] flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={insightsData?.bmiDist || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                                        {insightsData?.bmiDist?.map((_: any, index: number) => (
                                            <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 15. Retention Rate */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-purple-500" /> Tỷ lệ giữ chân người dùng
                        </h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={insightsData?.retention || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={11} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* V. FOOD STATS */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-l-4 border-emerald-500 pl-3">V. THỐNG KÊ THỰC PHẨM</h2>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
                        <Utensils size={18} className="text-emerald-500" /> Top Thực phẩm phổ biến
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="pb-3 pl-4">#</th>
                                    <th className="pb-3">Tên thực phẩm</th>
                                    <th className="pb-3 text-right">Số lần dùng</th>
                                    <th className="pb-3 text-right">Tổng Calo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {foodData?.topFoods?.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-3 pl-4 w-12">
                                            <div className="bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="block font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{item.name}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {item.count}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-sm font-medium text-gray-500">
                                            {parseInt(item.total_calories || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* VI. ADVANCED */}
            <SectionAdvanced peakData={peakData} />
        </div>
    );
};

export default Statistics;


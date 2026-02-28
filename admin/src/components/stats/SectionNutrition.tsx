import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Flame } from 'lucide-react';

const SectionNutrition = ({ data }: any) => {

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-orange-500 pl-3">II. HÀNH VI ĂN UỐNG</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 4. Calories Trend */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Flame size={18} className="text-orange-500" /> Xu hướng Calories (14 ngày)
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.calTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="target" stackId="1" stroke="#9CA3AF" fill="none" strokeDasharray="5 5" name="Target TB" />
                                <Area type="monotone" dataKey="actual" stackId="2" stroke="#F97316" fill="#F97316" fillOpacity={0.2} name="Thực tế" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Macro Ratio */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">Tỷ lệ Macro trung bình</h3>
                    <div className="h-[250px] flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data?.macroDist || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={2} label={({ name, value }) => `${name} ${value}%`}>
                                    {data?.macroDist?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#3B82F6' : '#F59E0B'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SectionNutrition;

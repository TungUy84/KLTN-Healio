import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

const SectionGoals = ({ data }: any) => {

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-500 pl-3">III. MỤC TIÊU & HIỆU QUẢ</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 9. Goal Success */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" /> Tiến độ Mục tiêu
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data?.weightSuccess || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                                    <Cell fill="#3B82F6" />
                                    <Cell fill="#E5E7EB" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 11. Compliance */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Target size={18} className="text-red-500" /> Mức độ tuân thủ Calories
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.compliance || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
                                    {data?.compliance?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionGoals;

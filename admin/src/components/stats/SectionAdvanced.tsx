
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

const SectionAdvanced = ({ peakData }: any) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-purple-500 pl-3">VI. NÂNG CAO (Advanced)</h2>

            <div className="grid grid-cols-1 gap-6">
                {/* 19. Activity Peak (Already have, reusing logic) */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-purple-500" /> Heatmap Hoạt động (Giờ cao điểm)
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Phân tích thời gian người dùng tương tác nhiều nhất trong ngày</p>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakData || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="hour" fontSize={10} interval={1} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: '#F3E8FF' }} contentStyle={{ borderRadius: 12 }} />
                                <Bar dataKey="count" fill="#A855F7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionAdvanced;

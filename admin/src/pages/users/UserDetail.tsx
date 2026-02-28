import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminUserService, type ComprehensiveUserDetail } from '../../services/adminUserService';
import {
    Lock, Unlock, User,
    Utensils, Shield,
    Weight,
    ArrowLeft, Heart, Flame,
    CheckCircle, RotateCcw, UserCog,
    Copy, Calendar, Sun, Moon, Coffee,
    ChevronLeft, ChevronRight as ChevronRightIcon,
    AlertTriangle,
    Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmToast } from '../../utils/toastUtils';
import { useNotifications } from '../../context/NotificationContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// Recharts mình khai báo ở đây để dễ quản lý
const CHART_CONFIG = {
    emerald: '#10b981', // emerald-500
    blue: '#3b82f6',    // blue-500
    amber: '#f59e0b',   // amber-500
    red: '#ef4444',     // red-500
    slate: '#94a3b8',   // slate-400
    bg: '#f8fafc'       // slate-50
};

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { addNotification } = useNotifications();
    const [data, setData] = useState<ComprehensiveUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [viewDate, setViewDate] = useState<Date>(new Date());
    const [activeMacroIndex, setActiveMacroIndex] = useState<number | null>(null);

    // New Password Modal State
    const [newPassword, setNewPassword] = useState<string | null>(null);

    // Auto-select latest date
    useEffect(() => {
        if (data?.daily_diary && data.daily_diary.length > 0) {
            // Find the latest date in the diary
            const latestDate = data.daily_diary.reduce((latest, current) => {
                return new Date(current.date) > new Date(latest) ? current.date : latest;
            }, data.daily_diary[0].date);

            setSelectedDate(latestDate);
            setViewDate(new Date(latestDate));
        }
    }, [data]);

    const fetchDetail = async (uid: string) => {
        try {
            setLoading(true);
            const res = await adminUserService.getComprehensiveUserDetail(uid);
            setData(res);
        } catch (e) {
            console.error(e);
            toast.error('Không thể lấy thông tin chi tiết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail(id);
    }, [id]);

    const userDisplayName = data ? (data.user.full_name || data.user.email) : '';

    // --- ACTIONS ---
    const handleBan = () => {
        if (!data) return;
        confirmToast({
            message: 'Khóa tài khoản này? Người dùng sẽ không thể đăng nhập.',
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await adminUserService.ban(data.user.id);
                    toast.success('Đã khóa tài khoản');
                    addNotification({ message: `Đã khóa tài khoản "${userDisplayName}"`, link: `/users/${id}` });
                    fetchDetail(id!);
                } catch (e) { toast.error('Lỗi khi khóa tài khoản'); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleUnban = () => {
        if (!data) return;
        confirmToast({
            message: 'Mở khóa tài khoản này?',
            type: 'info',
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await adminUserService.unban(data.user.id);
                    toast.success('Đã mở khóa tài khoản');
                    addNotification({ message: `Đã mở khóa tài khoản "${userDisplayName}"`, link: `/users/${id}` });
                    fetchDetail(id!);
                } catch (e) { toast.error('Lỗi khi mở khóa'); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleResetPassword = () => {
        if (!data) return;
        confirmToast({
            message: 'Đặt lại mật khẩu? Mật khẩu cũ sẽ bị vô hiệu hóa.',
            type: 'warning',
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    const res = await adminUserService.resetPassword(data.user.id);
                    setNewPassword(res.new_password);
                    toast.success('Đặt lại mật khẩu thành công');
                    addNotification({ message: `Đặt lại mật khẩu thành công cho "${userDisplayName}"`, link: `/users/${id}` });
                } catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi khi đặt lại mật khẩu'); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleChangeRole = () => {
        if (!data) return;
        const newRole = data.user.role === 'admin' ? 'user' : 'admin';
        confirmToast({
            message: `Đổi vai trò thành "${newRole.toUpperCase()}"?`,
            type: 'warning',
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await adminUserService.changeRole(data.user.id, newRole);
                    toast.success(`Đã đổi vai trò thành ${newRole}`);
                    addNotification({ message: `Đã đổi vai trò "${userDisplayName}" thành ${newRole}`, link: `/users/${id}` });
                    fetchDetail(id!);
                } catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi khi đổi vai trò'); }
                finally { setActionLoading(false); }
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-emerald-100 rounded-full animate-spin border-t-emerald-500"></div>
            </div>
        </div>
    );

    if (!data) return (
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <User size={40} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy dữ liệu</h3>
            <p className="text-slate-500 mb-6 text-sm">Tài khoản này không tồn tại hoặc đã bị xóa.</p>
            <Link to="/users" className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                Quay lại danh sách
            </Link>
        </div>
    );

    const { user, otp_info, weight_analysis, eating_behavior, top_foods, daily_diary } = data;
    const p = user.profile;
    const n = user.nutrition;
    const selectedDayData = daily_diary?.find(d => d.date === selectedDate);

    // --- HELPER FUNCTIONS ---
    const calculateBMI = (height: number, weight: number) => {
        if (!height || !weight) return { value: 0, status: 'N/A', textClass: 'text-slate-400', bgClass: 'bg-slate-100' };
        const h = height / 100;
        const bmi = parseFloat((weight / (h * h)).toFixed(1));

        if (bmi < 18.5) return { value: bmi, status: 'Thiếu cân', textClass: 'text-blue-600', bgClass: 'bg-blue-50' };
        if (bmi < 24.9) return { value: bmi, status: 'Bình thường', textClass: 'text-emerald-600', bgClass: 'bg-emerald-50' };
        if (bmi < 29.9) return { value: bmi, status: 'Thừa cân', textClass: 'text-orange-600', bgClass: 'bg-orange-50' };
        return { value: bmi, status: 'Béo phì', textClass: 'text-red-600', bgClass: 'bg-red-50' };
    };

    const calculateBMR = (gender: string, weight: number, height: number, age: number) => {
        if (!weight || !height || !age) return 0;
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === 'male') bmr += 5;
        else bmr -= 161;
        return Math.round(bmr);
    };

    const getAge = (dob: string) => dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 0;
    const userAge = p?.dob ? getAge(p.dob) : 0;
    const bmiInfo = p && p.height && p.current_weight ? calculateBMI(p.height, p.current_weight) : { value: 0, status: 'N/A', textClass: 'text-slate-400', bgClass: 'bg-slate-100' };
    const bmrValue = p && p.height && p.current_weight && userAge ? calculateBMR(p.gender || 'male', p.current_weight, p.height, userAge) : 0;

    // --- SHARED STYLES ---
    const cardClass = "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300";
    const sectionHeaderClass = "p-5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wide";
    const statBoxClass = "bg-slate-50 p-3 rounded-xl text-center border border-slate-100";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1";
    const valueClass = "text-xl font-bold text-slate-900";

    // Chart Data
    const macroData = n?.diet_preset ? [
        { name: 'Tinh bột', value: n.diet_preset.carb_ratio, color: '#3B82F6' },
        { name: 'Đạm', value: n.diet_preset.protein_ratio, color: '#10B981' },
        { name: 'Béo', value: n.diet_preset.fat_ratio, color: '#F59E0B' },
    ] : [];

    const mealData = [
        { name: 'Sáng', value: eating_behavior.meal_percentages.breakfast },
        { name: 'Trưa', value: eating_behavior.meal_percentages.lunch },
        { name: 'Tối', value: eating_behavior.meal_percentages.dinner },
        { name: 'Phụ', value: eating_behavior.meal_percentages.snack },
    ].filter(i => i.value > 0);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20 font-sans text-slate-800 animate-in fade-in duration-500">

            {/* 1. HEADER CARD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 relative transition-all">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <Link to="/users" className="p-2.5 bg-slate-50 hover:bg-emerald-50 rounded-xl text-slate-500 hover:text-emerald-600 transition-colors border border-slate-200 hover:border-emerald-200">
                        <ArrowLeft size={20} />
                    </Link>

                    <div className="relative group">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border-2 border-white ring-2 ring-slate-100 group-hover:ring-emerald-200 transition-all">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.full_name}&background=10B981&color=fff`}
                                className="w-full h-full object-cover"
                                alt="avatar"
                            />
                        </div>
                        <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full border-2 border-white text-[10px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                            {user.status === 'active' ? <><CheckCircle size={8} /> Active</> : <><Lock size={8} /> Banned</>}
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{user.full_name}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                <User size={12} /> {user.email}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    {user.status === 'banned' ? (
                        <button onClick={handleUnban} disabled={actionLoading} className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
                            <Unlock size={16} /> Mở khóa
                        </button>
                    ) : (
                        <button onClick={handleBan} disabled={actionLoading} className="flex-1 md:flex-none px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                            <Lock size={16} /> Khóa
                        </button>
                    )}

                    <button onClick={handleResetPassword} disabled={actionLoading} className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 shadow-sm group">
                        <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Reset Pass
                    </button>

                    <button onClick={handleChangeRole} disabled={actionLoading} className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-purple-600 rounded-xl text-sm font-bold hover:bg-purple-50 hover:border-purple-200 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <UserCog size={16} /> Role
                    </button>
                </div>
            </div>

            {/* 2. MAIN GRID (3 CỘT) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Col 1: Body Stats */}
                <div className={cardClass}>
                    <div className={sectionHeaderClass}>
                        <Activity size={18} className="text-emerald-500" /> Chỉ số cơ thể
                    </div>

                    <div className="p-5">
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className={statBoxClass}>
                                <div className={labelClass}>Chiều cao</div>
                                <div className={valueClass}>{p?.height || '--'} <span className="text-sm font-normal text-slate-500">cm</span></div>
                            </div>
                            <div className={statBoxClass}>
                                <div className={labelClass}>Cân nặng</div>
                                <div className={valueClass}>{p?.current_weight || '--'} <span className="text-sm font-normal text-slate-500">kg</span></div>
                            </div>
                            <div className={statBoxClass}>
                                <div className={labelClass}>Tuổi</div>
                                <div className={valueClass}>{userAge}</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex justify-between items-center">
                            <div>
                                <div className={labelClass}>Chỉ số BMI</div>
                                <div className={`text-3xl font-black ${bmiInfo.textClass} mt-1`}>{bmiInfo.value}</div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide ${bmiInfo.bgClass} ${bmiInfo.textClass}`}>
                                {bmiInfo.status}
                            </span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase">BMR (Cơ bản)</span>
                            <div className="text-lg font-black text-slate-700">{bmrValue.toLocaleString()} <span className="text-xs font-normal text-slate-400">kcal</span></div>
                        </div>

                        {(p?.allergies?.length || 0) > 0 && (
                            <div className="mt-5 pt-4 border-t border-slate-100">
                                <div className={labelClass}>Dị ứng / Kiêng kỵ</div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {p?.allergies?.map(a => (
                                        <span key={a} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1 capitalize">
                                            <AlertTriangle size={10} /> {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Col 2: Nutrition Targets */}
                <div className={cardClass}>
                    <div className={sectionHeaderClass}>
                        <Flame size={18} className="text-orange-500" /> Mục tiêu Dinh dưỡng
                    </div>

                    <div className="p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <div>
                                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mb-1">Target Calo</div>
                                <div className="text-3xl font-black text-orange-600">{n?.target_calories?.toLocaleString()}</div>
                                <div className="text-[10px] font-medium text-orange-400/80 mt-1">TDEE: {n?.tdee?.toLocaleString()} kcal</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Chế độ ăn</div>
                                <div className="text-sm font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 inline-block">
                                    {n?.diet_preset?.name || 'Custom'}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative min-h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={macroData}
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                        onMouseEnter={(_, index) => setActiveMacroIndex(index)}
                                        onMouseLeave={() => setActiveMacroIndex(null)}
                                    >
                                        {macroData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke={activeMacroIndex === index ? '#fff' : 'none'}
                                                strokeWidth={2}
                                                style={{
                                                    filter: activeMacroIndex === index ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))' : 'none',
                                                    transform: activeMacroIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                    transformOrigin: 'center'
                                                }}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                                {activeMacroIndex !== null && macroData[activeMacroIndex] ? (
                                    <>
                                        <div className="text-2xl font-black text-slate-800 animate-in fade-in zoom-in duration-200">{macroData[activeMacroIndex].value}%</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{macroData[activeMacroIndex].name}</div>
                                    </>
                                ) : (
                                    <div className="text-[10px] font-bold text-slate-400">MACROS</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-2">
                            {macroData.map((m, i) => (
                                <div key={m.name} className={`flex items-center gap-1.5 transition-opacity duration-300 ${activeMacroIndex !== null && activeMacroIndex !== i ? 'opacity-30' : 'opacity-100'}`}>
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></div>
                                    <span className="text-xs font-bold text-slate-600">{m.name} ({m.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Col 3: System Info */}
                <div className={cardClass}>
                    <div className={sectionHeaderClass}>
                        <Shield size={18} className="text-blue-500" /> Thông tin Hệ thống
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-white hover:shadow-sm transition-all">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ngày tham gia</span>
                            <span className="text-sm font-bold text-slate-900">{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-white hover:shadow-sm transition-all">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cập nhật cuối</span>
                            <span className="text-sm font-bold text-slate-900">{new Date(user.updated_at).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Reset Pass</div>
                                <div className="text-2xl font-black text-blue-600">{otp_info.reset_count || 0}</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">OTP Gần nhất</div>
                                <div className="text-sm font-bold text-purple-700 mt-2">{otp_info.latest ? otp_info.latest.type : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. CHART & LISTS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Weight Chart (2 Cột) */}
                <div className={`lg:col-span-2 ${cardClass}`}>
                    <div className={sectionHeaderClass}>
                        <Weight size={18} className="text-emerald-500" /> Biểu đồ Cân nặng
                    </div>
                    <div className="p-5 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weight_analysis.history}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_CONFIG.emerald} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={CHART_CONFIG.emerald} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(d) => new Date(d).getDate().toString()}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: CHART_CONFIG.slate, fontSize: 11, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: CHART_CONFIG.slate, fontSize: 11, fontWeight: 500 }}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }}
                                    itemStyle={{ color: CHART_CONFIG.emerald, fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="weight"
                                    stroke={CHART_CONFIG.emerald}
                                    strokeWidth={3}
                                    fill="url(#colorWeight)"
                                    dot={{ r: 4, fill: CHART_CONFIG.emerald, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Eating Habits */}
                <div className={cardClass}>
                    <div className={sectionHeaderClass}>
                        <Utensils size={18} className="text-emerald-500" /> Thói quen
                    </div>
                    <div className="p-5 h-full flex flex-col">
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className={statBoxClass}>
                                <div className={labelClass}>Số ngày Log</div>
                                <div className={valueClass}>{eating_behavior.total_days_logged}</div>
                            </div>
                            <div className={statBoxClass}>
                                <div className={labelClass}>TB Calo/Ngày</div>
                                <div className="text-xl font-black text-emerald-600">{Math.round(eating_behavior.avg_calories)}</div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className={`${labelClass} mb-4 text-center`}>Phân bổ bữa ăn (%)</div>
                            <div className="h-[150px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mealData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barSize={20}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 11, fontWeight: 600, fill: CHART_CONFIG.slate }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: CHART_CONFIG.bg }} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill={CHART_CONFIG.emerald} radius={[0, 6, 6, 0] as [number, number, number, number]} background={{ fill: '#f1f5f9' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Foods */}
                <div className={cardClass}>
                    <div className={sectionHeaderClass}>
                        <Heart size={18} className="text-red-500" /> Món yêu thích
                    </div>
                    <div className="p-5 h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                            {top_foods.length > 0 ? top_foods.slice(0, 5).map((f, i) => (
                                <div key={i} className="flex gap-3 items-center group p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-default border border-transparent hover:border-slate-100">
                                    <div className="relative">
                                        <img src={f.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-100" alt="" />
                                        <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{f.name}</div>
                                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">{Math.round(f.calories)} kcal</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <Heart size={32} className="opacity-20 mb-2" />
                                    <div className="text-xs font-medium">Chưa có món yêu thích</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. DAILY DIARY & CALENDAR */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
                <div className="p-4 flex items-center justify-between gap-4 bg-white border-b border-slate-50 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Utensils size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Nhật ký ăn uống</h2>
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 min-h-[300px] rounded-b-3xl">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* HERO CARD: Summary (Always Visible) */}
                        <div className="relative z-30 rounded-2xl bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200/50 p-4 sm:px-6 sm:py-3 group transition-all duration-300 hover:shadow-xl hover:shadow-emerald-200/60 hover:-translate-y-0.5">
                            {/* Decor Container */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-900/20 rounded-full blur-2xl -ml-6 -mb-6"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                            </div>

                            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="text-center sm:text-left flex items-center gap-4">
                                    <div className="flex flex-col items-center sm:items-start">
                                        <div className="flex items-center gap-1.5 text-emerald-100 font-bold text-[10px] uppercase tracking-widest opacity-80 mb-0.5">
                                            <Calendar size={12} />
                                            <span>Tổng kết ngày</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-xl sm:text-2xl font-black capitalize leading-none drop-shadow-sm tracking-tight text-white">
                                                {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long' })}
                                            </h3>
                                            <span className="text-sm font-bold text-emerald-100 opacity-90">
                                                {new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-stretch gap-3">
                                    <div className="relative z-50">
                                        <button
                                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                            className="h-full flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl backdrop-blur-md transition-all text-white shadow-inner group/btn"
                                        >
                                            <Calendar size={16} className="text-emerald-100 group-hover/btn:scale-110 transition-transform opacity-90" />
                                            <div className="text-right">
                                                <div className="text-[9px] text-emerald-200 font-bold uppercase tracking-widest mb-0.5 opacity-90">Ngày xem</div>
                                                <div className="text-xs font-bold flex items-center gap-1 leading-none">
                                                    {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chọn ngày'}
                                                    <ChevronRightIcon size={12} className={`text-emerald-200/70 transition-transform duration-300 ml-0.5 ${isCalendarOpen ? 'rotate-90' : ''}`} />
                                                </div>
                                            </div>
                                        </button>

                                        {/* Calendar Popover */}
                                        {isCalendarOpen && (
                                            <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 w-[280px] animate-in fade-in zoom-in-95 duration-200 text-slate-800">
                                                <div className="flex justify-between items-center mb-3">
                                                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={14} /></button>
                                                    <div className="font-bold text-xs text-slate-900 capitalize">Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}</div>
                                                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronRightIcon size={14} /></button>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 mb-2">
                                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d} className="h-6 flex items-center justify-center text-[9px] font-bold text-slate-400">{d}</div>)}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">
                                                    {(() => {
                                                        const year = viewDate.getFullYear();
                                                        const month = viewDate.getMonth();
                                                        const firstDay = new Date(year, month, 1);
                                                        const lastDay = new Date(year, month + 1, 0);
                                                        const daysInMonth = lastDay.getDate();
                                                        const startDayOfWeek = firstDay.getDay();
                                                        const days = [];
                                                        for (let i = 0; i < startDayOfWeek; i++) days.push(<div key={`empty-${i}`} className="h-6"></div>);
                                                        for (let d = 1; d <= daysInMonth; d++) {
                                                            const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                                            const hasLog = daily_diary?.some(item => item.date === currentDateStr);
                                                            const isSelected = selectedDate === currentDateStr;
                                                            days.push(
                                                                <button
                                                                    key={d}
                                                                    onClick={() => { setSelectedDate(currentDateStr); setIsCalendarOpen(false); }}
                                                                    className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center relative transition-all text-[10px] font-bold ${isSelected ? 'bg-emerald-500 text-white shadow-md' : hasLog ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'hover:bg-slate-50 text-slate-700'}`}
                                                                >
                                                                    {d}
                                                                    {hasLog && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></span>}
                                                                </button>
                                                            );
                                                        }
                                                        return days;
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/10 px-4 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-inner group-hover:bg-white/15 transition-colors h-full">
                                        <div className="text-right">
                                            <div className="text-[9px] text-emerald-200 font-bold uppercase tracking-widest mb-0.5 opacity-90">Calories</div>
                                            <div className="text-lg sm:text-xl font-black tabular-nums tracking-tight leading-none text-white">
                                                {selectedDayData ? Math.round(selectedDayData.total_calories) : 0}
                                                <span className="text-xs font-bold text-emerald-200 ml-1 opacity-80">/ {n?.target_calories ? n.target_calories.toLocaleString() : '---'}</span>
                                            </div>
                                        </div>
                                        <div className="h-6 w-px bg-white/20"></div>
                                        <div className="text-[10px] font-bold text-emerald-100 bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
                                            kcal
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MEALS GRID or EMPTY STATE */}
                        {selectedDayData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealType => {
                                    const meal = selectedDayData.meals[mealType];
                                    const hasItems = meal && meal.items.length > 0;

                                    let icon = <Sun size={18} className="text-orange-500" />;
                                    let title = 'Bữa sáng';

                                    if (mealType === 'lunch') { icon = <Sun size={18} className="text-yellow-500" />; title = 'Bữa trưa'; }
                                    else if (mealType === 'dinner') { icon = <Moon size={18} className="text-indigo-500" />; title = 'Bữa tối'; }
                                    else if (mealType === 'snack') { icon = <Coffee size={18} className="text-pink-500" />; title = 'Bữa phụ'; }

                                    return (
                                        <div key={mealType} className={`group relative bg-white rounded-3xl p-5 transition-all duration-300 flex flex-col h-full ${hasItems ? 'shadow-sm border border-transparent hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1' : 'opacity-60 border border-dashed border-slate-200 bg-slate-50/30 hover:opacity-80'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-2xl transition-colors ${hasItems ? 'bg-slate-50 group-hover:bg-white group-hover:shadow-sm' : 'bg-transparent'}`}>
                                                        {icon}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-slate-800 uppercase tracking-wider">{title}</div>
                                                        {hasItems && <div className="text-[10px] font-medium text-slate-400 mt-0.5">{meal.items.length} món</div>}
                                                    </div>
                                                </div>
                                                {hasItems && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg group-hover:bg-emerald-100 transition-colors">{Math.round(meal.calories)} kcal</span>}
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                {hasItems ? meal.items.map((item, i) => (
                                                    <div key={i} className="flex gap-3 items-center group/item p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                                                        <img src={item.image} className="w-10 h-10 rounded-xl object-cover bg-white shadow-sm ring-1 ring-slate-100" alt="" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-bold text-slate-700 truncate group-hover/item:text-emerald-600 transition-colors">{item.name}</div>
                                                            <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                                {item.amount} {item.unit} <span className="text-slate-300 mx-0.5">•</span> <span className="text-slate-500">{Math.round(item.calories)} kcal</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                                                        <span className="w-12 h-1 bg-slate-100 rounded-full mb-2"></span>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Trống</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 animate-pulse border-4 border-slate-50">
                                    <Utensils size={28} className="text-slate-300" />
                                </div>
                                <h3 className="text-base font-bold text-slate-700">Chưa có dữ liệu</h3>
                                <p className="text-slate-400 text-xs max-w-xs mx-auto mt-1 leading-relaxed">Người dùng chưa ghi nhận nhật ký ăn uống cho ngày này.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal đặt lại mật khẩu */}
            {newPassword && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 transform scale-100 transition-all">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
                                <CheckCircle size={32} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Đổi mật khẩu thành công!</h3>
                            <p className="text-sm text-slate-500 mb-6">Mật khẩu mới đã được tạo tự động.</p>

                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl mb-6 border border-slate-200 group relative">
                                <code className="flex-1 font-mono text-lg font-bold text-slate-800 text-center tracking-wider">{newPassword}</code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(newPassword);
                                        toast.success('Đã sao chép');
                                    }}
                                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm border border-transparent hover:border-slate-200"
                                    title="Sao chép"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>

                            <button
                                onClick={() => setNewPassword(null)}
                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetail;
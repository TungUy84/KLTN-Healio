import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminUserService, type ComprehensiveUserDetail } from '../../services/adminUserService';
import {
    Lock, Unlock, User, Mail,
    Utensils, Shield,
    ChevronRight, Key, Weight,
    ArrowLeft, Heart, Flame,
    CheckCircle, RotateCcw, UserCog,
    PieChart as PieChartIcon, Copy, Target, Calendar, Sun, Moon, Coffee,
    ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmToast } from '../../utils/toastUtils';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<ComprehensiveUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());


    // New Password Modal State
    const [newPassword, setNewPassword] = useState<string | null>(null);

    // Auto-select latest date
    // This effect must be at the top level, before any conditional returns
    useEffect(() => {
        if (data?.daily_diary && data.daily_diary.length > 0 && !selectedDate) {
            setSelectedDate(data.daily_diary[0].date);
            setViewDate(new Date(data.daily_diary[0].date));
        }
    }, [data, selectedDate]);

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

    const handleBan = () => {
        if (!data) return;
        confirmToast({
            message: 'Khóa tài khoản này? Người dùng sẽ không thể đăng nhập.',
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    await adminUserService.ban(data.user.id);
                    toast.success('Đã khóa tài khoản');
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
                    fetchDetail(id!);
                } catch (e) { toast.error('Lỗi khi mở khóa'); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleResetPassword = () => {
        if (!data) return;
        confirmToast({
            message: 'Đặt lại mật khẩu cho người dùng này? Mật khẩu cũ sẽ bị vô hiệu hóa.',
            type: 'warning',
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    const res = await adminUserService.resetPassword(data.user.id);
                    setNewPassword(res.new_password);
                    toast.success('Đặt lại mật khẩu thành công');
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
                    fetchDetail(id!);
                } catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi khi đổi vai trò'); }
                finally { setActionLoading(false); }
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-100 rounded-full animate-spin border-t-emerald-500"></div>
            </div>
        </div>
    );

    if (!data) return (
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy dữ liệu</h3>
            <p className="text-gray-500 mb-6">Tài khoản này không tồn tại hoặc đã bị xóa.</p>
            <Link to="/users" className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                Quay lại danh sách
            </Link>
        </div>
    );

    const { user, otp_info, weight_analysis, eating_behavior, top_foods, daily_diary } = data;
    const p = user.profile;
    const n = user.nutrition;

    // Auto-select latest date


    const selectedDayData = daily_diary ? daily_diary.find(d => d.date === selectedDate) : null;


    // ... (Calculations remain same) ...
    const calculateBMI = (height: number, weight: number) => {
        if (!height || !weight) return { value: 0, status: 'N/A', color: 'text-gray-400' };
        const h = height / 100;
        const bmi = parseFloat((weight / (h * h)).toFixed(1));
        let status = '';
        let color = '';

        if (bmi < 18.5) { status = 'Thiếu cân'; color = 'text-blue-500'; }
        else if (bmi < 24.9) { status = 'Bình thường'; color = 'text-emerald-500'; }
        else if (bmi < 29.9) { status = 'Thừa cân'; color = 'text-orange-500'; }
        else { status = 'Béo phì'; color = 'text-red-500'; }

        return { value: bmi, status, color };
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
    const bmiInfo = p && p.height && p.current_weight ? calculateBMI(p.height, p.current_weight) : { value: 0, status: 'N/A', color: 'text-gray-400' };
    const bmrValue = p && p.height && p.current_weight && userAge ? calculateBMR(p.gender || 'male', p.current_weight, p.height, userAge) : 0;

    // Shared Styles
    const cardClass = "bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-md h-full";
    const sectionTitleClass = "font-bold text-lg text-gray-900 flex items-center gap-2 mb-4";

    // Pie Chart Data
    const macroData = n?.diet_preset ? [
        { name: 'Tinh bột', value: n.diet_preset.carb_ratio },
        { name: 'Đạm', value: n.diet_preset.protein_ratio },
        { name: 'Béo', value: n.diet_preset.fat_ratio },
    ] : [];

    const mealData = [
        { name: 'Sáng', value: eating_behavior.meal_percentages.breakfast },
        { name: 'Trưa', value: eating_behavior.meal_percentages.lunch },
        { name: 'Tối', value: eating_behavior.meal_percentages.dinner },
        { name: 'Phụ', value: eating_behavior.meal_percentages.snack },
    ].filter(i => i.value > 0);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* New Password Modal */}
            {newPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu thành công</h3>
                            <p className="text-gray-500 mb-6">Vui lòng sao chép mật khẩu mới này và gửi cho người dùng.</p>

                            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-xl mb-6 border border-gray-200">
                                <code className="flex-1 font-mono text-lg font-bold text-gray-800 text-center tracking-wider">{newPassword}</code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(newPassword);
                                        toast.success('Đã sao chép');
                                    }}
                                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>

                            <button
                                onClick={() => setNewPassword(null)}
                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header & Navigation */}
            <div className="flex items-center gap-4">
                <Link to="/users" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h1>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>Quản lý tài khoản</span>
                        <ChevronRight size={14} />
                        <span className="text-emerald-600 font-medium">#{user.id}</span>
                    </div>
                </div>
            </div>

            {/* 1. HERO PROFILE CARD */}
            <div className={`relative overflow-hidden rounded-3xl p-8 border border-emerald-100/50 shadow-xl shadow-emerald-900/5 ${user.status === 'banned' ? 'bg-gradient-to-br from-gray-50 to-red-50' : 'bg-gradient-to-br from-emerald-50 via-white to-teal-50'}`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-30 group-hover:opacity-50 blur transition-all duration-500"></div>
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.full_name}&background=10B981&color=fff`}
                            className="relative w-32 h-32 rounded-full object-cover border-[6px] border-white shadow-2xl"
                            alt="avatar"
                        />
                        <div className={`absolute bottom-2 right-2 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                            {user.status === 'active' ? <CheckCircle size={12} className="text-white" /> : <Lock size={12} className="text-white" />}
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{user.full_name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                                {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                            </span>
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                <Key size={12} /> {user.auth_provider === 'local' ? 'Email' : 'Google'}
                            </span>
                            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                <Mail size={12} /> {user.email}
                            </span>
                        </div>
                        <div className="flex gap-2 justify-center md:justify-start">
                            {user.status === 'banned' ? (
                                <button onClick={handleUnban} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow hover:bg-emerald-700 transition-all flex items-center gap-2">
                                    <Unlock size={16} /> Mở khóa
                                </button>
                            ) : (
                                <button onClick={handleBan} disabled={actionLoading} className="px-4 py-2 bg-white text-red-600 border border-gray-200 rounded-lg font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-2 shadow-sm">
                                    <Lock size={16} /> Khóa
                                </button>
                            )}
                            <button onClick={handleResetPassword} disabled={actionLoading} className="px-4 py-2 bg-white text-blue-600 border border-gray-200 rounded-lg font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm">
                                <RotateCcw size={16} /> Đặt lại MK
                            </button>
                            <button onClick={handleChangeRole} disabled={actionLoading} className="px-4 py-2 bg-white text-purple-600 border border-gray-200 rounded-lg font-bold hover:bg-purple-50 transition-all flex items-center gap-2 shadow-sm">
                                <UserCog size={16} /> Đổi vai trò
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PROFILE & NUTRITION ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Summary */}
                <div className="lg:col-span-6 xl:col-span-5">
                    <div className={cardClass}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className={sectionTitleClass}><User size={20} className="text-emerald-600" /> Hồ sơ cá nhân & Thể trạng</h3>
                            {p && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold uppercase">{p.activity_level === 'sedentary' ? 'Ít vận động' : p.activity_level === 'light' ? 'Nhẹ nhàng' : p.activity_level === 'moderate' ? 'Vừa phải' : p.activity_level === 'active' ? 'Năng động' : 'Rất năng động'}</span>}
                        </div>
                        <div className="p-6">
                            {p ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Chiều cao</div>
                                            <div className="text-2xl font-black text-gray-900">{p.height} <span className="text-sm font-normal text-gray-500">cm</span></div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Cân nặng</div>
                                            <div className="text-2xl font-black text-gray-900">{p.current_weight} <span className="text-sm font-normal text-gray-500">kg</span></div>
                                        </div>
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <div className="text-xs text-blue-500 uppercase font-bold mb-1">Chỉ số BMI</div>
                                            <div className="flex items-end gap-2">
                                                <div className={`text-2xl font-black ${bmiInfo.color}`}>{bmiInfo.value}</div>
                                                <div className={`text-xs font-bold px-2 py-1 rounded bg-white ${bmiInfo.color} mb-1`}>{bmiInfo.status}</div>
                                            </div>
                                        </div>
                                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                            <div className="text-xs text-orange-500 uppercase font-bold mb-1">BMR</div>
                                            <div className="text-2xl font-black text-orange-600">{bmrValue.toLocaleString()} <span className="text-sm font-normal">kcal</span></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                                        <span className="text-gray-500 text-sm">Giới tính / Tuổi</span>
                                        <span className="font-bold text-gray-900">{p.gender === 'male' ? 'Nam' : 'Nữ'} • {userAge} tuổi</span>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Mục tiêu</div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100 capitalize flex items-center gap-1">
                                                <Target size={12} />
                                                {p.goal_type === 'lose_weight' ? 'Giảm cân' : p.goal_type === 'gain_muscle' ? 'Tăng cơ' : p.goal_type === 'improve_health' ? 'Sức khỏe' : 'Duy trì'}
                                            </span>
                                            {p.goal_weight && <span className="text-sm font-medium text-gray-600">→ {p.goal_weight} kg</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Dị ứng</div>
                                        <div className="flex flex-wrap gap-2">
                                            {p.allergies?.length ? p.allergies.map(a => (
                                                <span key={a} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-100 capitalize">{a}</span>
                                            )) : <span className="text-gray-400 italic text-sm">Không có</span>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">Chưa cập nhật hồ sơ</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Nutrition Targets */}
                <div className="lg:col-span-6 xl:col-span-7">
                    <div className={`${cardClass} flex flex-col`}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className={sectionTitleClass}><Flame size={20} className="text-orange-500" /> Mục tiêu dinh dưỡng</h3>
                            {n?.diet_preset && <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold">{n.diet_preset.name}</span>}
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                    <div className="relative z-10">
                                        <div className="text-orange-100 text-xs uppercase font-bold mb-1">Mục tiêu Calo / Ngày</div>
                                        <div className="text-4xl font-black mb-2">{n?.target_calories.toLocaleString()}</div>
                                        <div className="flex items-center gap-2 text-orange-200 text-sm">
                                            <span>TDEE: {n?.tdee.toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{n?.target_calories && n.tdee ? Math.round((n.target_calories / n.tdee) * 100) : 0}% nhu cầu</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-3">Mô tả chế độ</div>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">"{n?.diet_preset?.description || 'Chế độ tùy chỉnh'}"</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-48 h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={macroData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {macroData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value}%`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-sm font-bold text-gray-400">MACROS</span>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-4 mt-4 w-full">
                                    {macroData.map((entry, index) => (
                                        <div key={index} className="text-center">
                                            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[index] }}></div>
                                            <div className="text-xs font-bold text-gray-500">{entry.name}</div>
                                            <div className="text-sm font-black text-gray-900">{entry.value}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. WEIGHT PROGRESS */}
            <div className={cardClass}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className={sectionTitleClass}><Weight size={20} className="text-indigo-600" /> Tiến trình cân nặng</h3>
                    <div className="flex gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-400 uppercase font-bold">Ban đầu</div>
                            <div className="font-bold text-gray-900">{weight_analysis.start} kg</div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-400 uppercase font-bold">Hiện tại</div>
                            <div className="font-bold text-gray-900">{weight_analysis.current} kg</div>
                        </div>
                        <div className={`px-4 py-1 rounded-xl flex flex-col items-end justify-center ${weight_analysis.change <= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <span className="text-xs font-bold uppercase">Thay đổi</span>
                            <span className="font-black text-lg">{weight_analysis.change > 0 ? '+' : ''}{weight_analysis.change} kg</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weight_analysis.history}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate().toString()} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={30} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} fill="url(#colorWeight)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4. EATING BEHAVIOR & MEAL BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Eating Overview */}
                <div className={cardClass}>
                    <div className="p-6 border-b border-gray-100">
                        <h3 className={sectionTitleClass}><Utensils size={20} className="text-blue-600" /> Tổng quan ăn uống (30 ngày)</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Tổng ngày log</div>
                            <div className="text-3xl font-black text-gray-900">{eating_behavior.total_days_logged}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Trung bình Calo</div>
                            <div className="text-3xl font-black text-gray-900">{eating_behavior.avg_calories}</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl col-span-2">
                            <div className="text-xs text-blue-500 uppercase font-bold mb-1">Trung bình Đạm</div>
                            <div className="text-3xl font-black text-blue-600">{eating_behavior.avg_protein}g</div>
                        </div>
                    </div>
                </div>

                {/* Meal Breakdown */}
                <div className={cardClass}>
                    <div className="p-6 border-b border-gray-100">
                        <h3 className={sectionTitleClass}><PieChartIcon size={20} className="text-teal-600" /> Phân bổ năng lượng</h3>
                    </div>
                    <div className="p-6 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mealData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                                <Bar dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 5. FAVORITES & SYSTEM INFO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Favorites */}
                <div className={cardClass}>
                    <div className="p-6 border-b border-gray-100">
                        <h3 className={sectionTitleClass}><Heart size={20} className="text-rose-500" /> Món ăn yêu thích</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {top_foods.length > 0 ? top_foods.map((food, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                                <img src={food.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt="" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{food.name}</h4>
                                    <div className="text-xs text-gray-500">{Math.round(food.calories)} kcal</div>
                                </div>
                            </div>
                        )) : <div className="col-span-2 text-center text-gray-400 italic">Chưa có dữ liệu</div>}
                    </div>
                </div>

                {/* System Info */}
                <div className={cardClass}>
                    <div className="p-6 border-b border-gray-100">
                        <h3 className={sectionTitleClass}><Shield size={20} className="text-gray-700" /> Thông tin Hệ thống</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium">OTP Gần nhất</span>
                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                                    {otp_info.latest ? `${otp_info.latest.type} (${new Date(otp_info.latest.created_at).toLocaleString('vi-VN')})` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium">Số lần Reset Pass</span>
                                <span className="font-bold text-gray-900">{otp_info.reset_count}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium">Ngày tạo TK</span>
                                <span className="font-mono text-gray-900">{new Date(user.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium">Cập nhật lần cuối</span>
                                <span className="font-mono text-gray-900">{new Date(user.updated_at).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. DAILY DIARY (Unified Card Design) */}
            <div className={cardClass}>
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 z-20 relative">
                    <h3 className={sectionTitleClass}>
                        <Utensils size={20} className="text-emerald-600" />
                        Nhật ký ăn uống
                    </h3>

                    {/* Date Selector & Calendar Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm group"
                        >
                            <Calendar size={18} className="text-gray-500 group-hover:text-emerald-600" />
                            <div className="text-left">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đang xem</div>
                                <div className="font-bold text-gray-900 text-sm">
                                    {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN', {
                                        weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
                                    }) : 'Chọn ngày'}
                                </div>
                            </div>
                            <ChevronRightIcon size={16} className={`text-gray-400 transition-transform ${isCalendarOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Calendar Popover */}
                        {isCalendarOpen && (
                            <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 w-[320px] animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="font-bold text-gray-900 capitalize">
                                        Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}
                                    </div>
                                    <button
                                        onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                    >
                                        <ChevronRightIcon size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                        <div key={d} className="h-8 flex items-center justify-center text-xs font-bold text-gray-400">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {(() => {
                                        const year = viewDate.getFullYear();
                                        const month = viewDate.getMonth();
                                        const firstDay = new Date(year, month, 1);
                                        const lastDay = new Date(year, month + 1, 0);
                                        const daysInMonth = lastDay.getDate();
                                        const startDayOfWeek = firstDay.getDay(); // 0 is Sunday

                                        const days = [];
                                        // Empty slots for previous month
                                        for (let i = 0; i < startDayOfWeek; i++) {
                                            days.push(<div key={`empty-${i}`} className="h-8"></div>);
                                        }

                                        // Days
                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                            const hasLog = daily_diary?.some(item => item.date === currentDateStr);
                                            const isSelected = selectedDate === currentDateStr;

                                            days.push(
                                                <button
                                                    key={d}
                                                    onClick={() => {
                                                        setSelectedDate(currentDateStr);
                                                        setIsCalendarOpen(false);
                                                    }}
                                                    className={`h-9 w-9 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all ${isSelected
                                                        ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200'
                                                        : 'hover:bg-emerald-50 text-gray-700 font-medium'
                                                        }`}
                                                >
                                                    <span className="text-xs">{d}</span>
                                                    {hasLog && !isSelected && (
                                                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></span>
                                                    )}
                                                </button>
                                            );
                                        }
                                        return days;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {selectedDayData ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Daily Summary */}
                            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 border border-gray-200">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-lg uppercase">
                                            {new Date(selectedDayData.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">Tổng kết dinh dưỡng ngày</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 sm:mt-0">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 font-bold uppercase">Tổng Nạp</div>
                                        <div className="text-xl font-black text-gray-900">{Math.round(selectedDayData.total_calories)}</div>
                                    </div>
                                    <div className="h-8 w-px bg-gray-300"></div>
                                    <div className="text-right">
                                        <div className="text-xs text-emerald-600 font-bold uppercase">Mục tiêu</div>
                                        <div className="text-xl font-black text-emerald-600">{n?.target_calories ? n.target_calories : '---'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Meals Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealType => {
                                    const meal = selectedDayData.meals[mealType];
                                    const hasItems = meal && meal.items.length > 0;

                                    let icon = <Sun size={18} className="text-orange-500" />;
                                    let title = 'Buổi Sáng';
                                    let themeColor = 'orange';

                                    if (mealType === 'lunch') {
                                        icon = <Sun size={18} className="text-yellow-500" />;
                                        title = 'Buổi Trưa';
                                        themeColor = 'yellow';
                                    } else if (mealType === 'dinner') {
                                        icon = <Moon size={18} className="text-indigo-500" />;
                                        title = 'Buổi Tối';
                                        themeColor = 'indigo';
                                    } else {
                                        icon = <Coffee size={18} className="text-pink-500" />;
                                        title = 'Ăn Nhẹ';
                                        themeColor = 'pink';
                                    }

                                    const borderColor = hasItems
                                        ? (themeColor === 'orange' ? 'border-orange-100' : themeColor === 'yellow' ? 'border-yellow-100' : themeColor === 'indigo' ? 'border-indigo-100' : 'border-pink-100')
                                        : 'border-gray-100';
                                    const headerBg = hasItems
                                        ? (themeColor === 'orange' ? 'bg-orange-50' : themeColor === 'yellow' ? 'bg-yellow-50' : themeColor === 'indigo' ? 'bg-indigo-50' : 'bg-pink-50')
                                        : 'bg-gray-50/50';
                                    const textColor = hasItems
                                        ? (themeColor === 'orange' ? 'text-orange-700' : themeColor === 'yellow' ? 'text-yellow-700' : themeColor === 'indigo' ? 'text-indigo-700' : 'text-pink-700')
                                        : 'text-gray-400';

                                    return (
                                        <div key={mealType} className={`flex flex-col h-full rounded-2xl border ${borderColor} ${hasItems ? 'bg-white' : 'bg-gray-50/30'} overflow-hidden transition-all duration-300`}>
                                            <div className={`p-3 ${headerBg} flex justify-between items-center border-b ${borderColor}`}>
                                                <div className={`flex items-center gap-2 font-bold text-sm ${textColor}`}>
                                                    {icon} {title}
                                                </div>
                                                {hasItems && (
                                                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100 text-gray-600">
                                                        {Math.round(meal.calories)} kcal
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-3 space-y-2 flex-1">
                                                {hasItems ? meal.items.map((item, i) => (
                                                    <div key={i} className="flex gap-3 items-center group p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <div className="relative overflow-hidden rounded-lg w-10 h-10 flex-shrink-0 border border-gray-100">
                                                            <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">{item.name}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {item.amount} {item.unit} • <span className="font-medium text-gray-700">{Math.round(item.calories)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-6">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                                                            <Utensils size={14} className="opacity-50" />
                                                        </div>
                                                        <span className="text-[10px] uppercase font-bold tracking-wide">Trống</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                                <Utensils size={20} className="opacity-50 text-gray-500" />
                            </div>
                            <p className="text-sm font-medium">Chưa có dữ liệu nhật ký cho ngày này</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
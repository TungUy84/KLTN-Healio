import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminUserService, type AdminUserDetail } from '../../services/adminUserService';
import { FaArrowLeft, FaLock, FaUnlock } from 'react-icons/fa';

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetail = async (uid: string) => {
        try {
            setLoading(true);
            const data = await adminUserService.getById(uid);
            setUser(data);
        } catch (e) {
            console.error('Failed to fetch user detail', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail(id);
    }, [id]);

    const handleBan = async () => {
        if (!user) return;

        // PB_60: Popup cảnh báo đỏ cho Admin
        if (user.role === 'admin') {
            const confirmed = window.confirm(
                '⚠️ CẢNH BÁO NGHIÊM TRỌNG ⚠️\n\n' +
                'Bạn đang cố gắng khóa tài khoản Admin!\n' +
                'Hành động này có thể gây ảnh hưởng nghiêm trọng đến hệ thống.\n\n' +
                'Bạn có chắc chắn muốn tiếp tục?'
            );
            if (!confirmed) return;
            // Backend sẽ chặn, nhưng vẫn hiện popup cảnh báo
            alert('Không được khóa tài khoản Admin. Hành động đã bị từ chối.');
            return;
        }

        if (!window.confirm('Bạn có chắc muốn khóa tài khoản này?')) return;
        try {
            setActionLoading(true);
            await adminUserService.ban(user.id);
            fetchDetail(id!);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Không thể khóa tài khoản.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async () => {
        if (!user) return;
        if (!window.confirm('Bạn có chắc muốn mở khóa tài khoản này?')) return;
        try {
            setActionLoading(true);
            await adminUserService.unban(user.id);
            fetchDetail(id!);
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Không thể mở khóa.');
        } finally {
            setActionLoading(false);
        }
    };

    const genderLabel = (g: string | null) => (g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : '—');
    const activityLabel = (a: string | null) => {
        const m: Record<string, string> = {
            sedentary: 'Ít vận động',
            light: 'Nhẹ',
            moderate: 'Vừa phải',
            active: 'Năng động',
            very_active: 'Rất năng động',
        };
        return a ? m[a] || a : '—';
    };
    const goalLabel = (g: string | null) => {
        const m: Record<string, string> = {
            lose_weight: 'Giảm cân',
            maintain: 'Duy trì',
            gain_weight: 'Tăng cân',
        };
        return g ? m[g] || g : '—';
    };

    // Helper: Calculate age from DOB
    const calculateAge = (dob: string | null): number | null => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Helper: Calculate BMI and get label
    const calculateBMI = (height: number | null, weight: number | null): { value: number | null; label: string; color: string } => {
        if (!height || !weight) return { value: null, label: '—', color: 'text-gray-500' };
        const heightM = height / 100;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        let label = '';
        let color = '';
        if (bmi < 18.5) {
            label = 'Gầy';
            color = 'text-blue-600';
        } else if (bmi < 23) {
            label = 'Bình thường';
            color = 'text-green-600';
        } else if (bmi < 25) {
            label = 'Thừa cân';
            color = 'text-yellow-600';
        } else {
            label = 'Béo phì';
            color = 'text-red-600';
        }
        return { value: bmi, label, color };
    };

    // Helper: Calculate BMR (Mifflin-St Jeor)
    const calculateBMR = (gender: string | null, weight: number | null, height: number | null, age: number | null): number | null => {
        if (!gender || !weight || !height || age === null) return null;
        let bmr = 10 * weight + 6.25 * height - 5 * age;
        bmr += gender === 'male' ? 5 : -161;
        return Math.round(bmr);
    };

    // Helper: Calculate journey path
    const calculateJourney = (currentWeight: number | null, goalWeight: number | null, goalType: string | null): string => {
        if (!currentWeight || !goalWeight || !goalType) return '—';
        const diff = goalWeight - currentWeight;
        if (Math.abs(diff) < 0.1) return 'Đã đạt mục tiêu';
        if (goalType === 'lose_weight') {
            return `Cần giảm ${Math.abs(diff).toFixed(1)} kg`;
        } else if (goalType === 'gain_weight') {
            return `Cần tăng ${diff.toFixed(1)} kg`;
        }
        return 'Duy trì cân nặng';
    };

    if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>;
    if (!user) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Không tìm thấy tài khoản.</div>;

    const p = user.profile;
    const n = user.nutrition;
    const diet = n?.diet_preset;
    const isBanned = user.status === 'banned';

    // Calculate metrics
    const age = calculateAge(p?.dob ?? null);
    const bmiData = calculateBMI(p?.height ?? null, p?.current_weight ?? null);
    const bmr = calculateBMR(p?.gender ?? null, p?.current_weight ?? null, p?.height ?? null, age);
    const journey = calculateJourney(p?.current_weight ?? null, p?.goal_weight ?? null, p?.goal_type ?? null);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/users" className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        <FaArrowLeft />
                    </Link>
                    {user.avatar ? (
                        <img
                            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000${user.avatar}`}
                            alt=""
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xl border-2 border-indigo-200 dark:border-indigo-700">
                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 m-0">{user.full_name}</h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 m-0">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin' ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${isBanned ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'}`}>
                        {isBanned ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                    {isBanned ? (
                        <button
                            onClick={handleUnban}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 disabled:opacity-50"
                        >
                            <FaUnlock /> Mở khóa
                        </button>
                    ) : (
                        <button
                            onClick={handleBan}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 disabled:opacity-50"
                        >
                            <FaLock /> Khóa tài khoản
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PB_58: Identity & body metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-4 m-0">Thông tin định danh & chỉ số cơ thể</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">ID</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{user.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{user.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Giới tính</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{genderLabel(p?.gender ?? null)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Ngày sinh</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                                {p?.dob ? `${p.dob} (${age !== null ? age + ' tuổi' : '—'})` : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Chiều cao (cm)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{p?.height ?? '—'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Cân nặng hiện tại (kg)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{p?.current_weight ?? '—'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">BMI</span>
                            <span className={`font-medium ${bmiData.color}`}>
                                {bmiData.value !== null ? `${bmiData.value} (${bmiData.label})` : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Mức vận động</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{activityLabel(p?.activity_level ?? null)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Mục tiêu</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{goalLabel(p?.goal_type ?? null)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Cân nặng mục tiêu (kg)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{p?.goal_weight ?? '—'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Lộ trình</span>
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{journey}</span>
                        </div>
                    </div>
                </div>

                {/* PB_59: Diet & nutrition, allergies */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-200 mb-4 m-0">Chế độ ăn & dinh dưỡng</h3>
                    <div className="space-y-4">
                        {n ? (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Mức vận động</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{activityLabel(p?.activity_level ?? null)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">BMR</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{bmr ? `${bmr} kcal/ngày` : '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">TDEE</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{n.tdee} kcal/ngày</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Calo mục tiêu/ngày</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{n.target_calories} kcal</span>
                                </div>
                                {diet ? (
                                    <>
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chế độ ăn (Diet Mode)</p>
                                            <p className="text-sm text-gray-900 dark:text-gray-200 m-0">{diet.name}</p>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chế độ dinh dưỡng</p>
                                            <p className="text-sm text-gray-900 dark:text-gray-200 m-0">
                                                Carb: {diet.carb_ratio}% / Đạm: {diet.protein_ratio}% / Béo: {diet.fat_ratio}%
                                            </p>
                                            {diet.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 m-0">{diet.description}</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">Chưa chọn chế độ ăn</p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Chưa hoàn thành onboarding</p>
                        )}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Dị ứng & Kiêng kỵ</p>
                            {user.allergies ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.allergies.split(',').map((allergy, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                                            {allergy.trim()}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400 m-0">Chưa có dữ liệu (từ Onboarding)</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;

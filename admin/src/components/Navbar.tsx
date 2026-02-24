import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    Bell,
    Menu,
    LogOut,
    User,
    Settings,
    X,
    Lock,
    Mail,
    Shield,
    Camera,
    Edit2,
    Check,
    Loader2
} from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface NavbarProps {
    onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Modal States
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        id: null,
        name: "Quản trị viên",
        email: "admin@healio.com",
        role: "Super Admin",
        avatar: ""
    });
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // Edit Name State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);

    // Avatar Upload State
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Fetch Profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoadingProfile(true);
                const data = await authService.getProfile();
                setProfile({
                    id: data.id,
                    name: data.full_name || "Quản trị viên",
                    email: data.email,
                    role: data.role === 'admin' ? "Admin" : "User",
                    avatar: data.avatar || ""
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    // Handlers
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingAvatar(true);
            const res = await authService.uploadAvatar(file);
            setProfile(prev => ({ ...prev, avatar: res.avatar }));
            toast.success("Cập nhật ảnh đại diện thành công!");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Lỗi khi upload ảnh!");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleStartEditName = () => {
        setEditNameValue(profile.name);
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        if (!editNameValue.trim()) return;
        try {
            setIsSavingName(true);
            await authService.updateProfile({ full_name: editNameValue });
            setProfile(prev => ({ ...prev, name: editNameValue }));
            setIsEditingName(false);
        } catch (error) {
            console.error("Update name failed", error);
            toast.error("Lỗi khi cập nhật tên!");
        } finally {
            setIsSavingName(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }
        try {
            setIsChangingPassword(true);
            await authService.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Đổi mật khẩu thành công!");
            setShowSettingsModal(false);
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error("Change password failed", error);
            const msg = error.response?.data?.message || "Lỗi khi đổi mật khẩu!";
            toast.error(msg);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const renderAvatar = (wClass = "w-10 h-10", textClass = "text-base") => {
        if (profile.avatar) {
            return <img src={profile.avatar} alt="Avatar" className={`w-full h-full object-cover`} />;
        }
        return <span className={textClass}>A</span>;
    };

    return (
        <>
            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm transition-all duration-300">
                {/* 1. LEFT: Toggle & Title */}
                <div className="flex items-center gap-4">
                    <button onClick={onToggleSidebar} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <Menu size={20} />
                    </button>
                </div>

                {/* 2. CENTER: Search Bar */}
                <div className={`
                    flex items-center flex-1 max-w-xl bg-gray-50 rounded-full px-4 py-2 mx-6 transition-all duration-300 border
                    ${isSearchFocused ? 'border-emerald-300 bg-white shadow-sm ring-2 ring-emerald-50' : 'border-transparent'}
                `}>
                    <Search size={20} className={`mr-3 ${isSearchFocused ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 font-medium"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>

                {/* 3. RIGHT: Actions & Profile */}
                <div className="flex items-center gap-6">

                    {/* Notifications */}
                    <button className="text-gray-400 hover:text-emerald-500 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200"></div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <div className="text-right hidden md:block">
                                <span className="block text-sm font-bold text-gray-700">{profile.name}</span>
                                <span className="block text-[11px] text-gray-400 font-medium">{profile.role}</span>
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                                    {renderAvatar()}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-40 transform origin-top-right transition-all">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-bold text-gray-800">{profile.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setShowSettingsModal(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                    >
                                        <User size={16} /> Hồ sơ
                                    </button>
                                    <div className="my-1 border-t border-gray-50"></div>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            authService.logout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* --- UNIFIED SETTINGS MODAL --- */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Settings className="text-emerald-600" size={24} />
                                Cài đặt hệ thống
                            </h3>
                            <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body - Split View */}
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                                {/* 1. LEFT COLUMN: PROFILE CARD */}
                                <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center h-fit">

                                    {/* Editable Avatar */}
                                    <div className="relative group cursor-pointer mb-4" onClick={handleAvatarClick}>
                                        <div className="w-32 h-32 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden relative">
                                            {renderAvatar("w-32 h-32", "text-4xl")}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isUploadingAvatar ? (
                                                    <Loader2 className="animate-spin text-white" size={24} />
                                                ) : (
                                                    <Camera className="text-white" size={24} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    {/* Editable Name */}
                                    <div className="flex items-center justify-center gap-2 mb-1 w-full relative">
                                        {isEditingName ? (
                                            <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                                <input
                                                    type="text"
                                                    value={editNameValue}
                                                    onChange={(e) => setEditNameValue(e.target.value)}
                                                    className="w-full max-w-[180px] text-center border-b-2 border-emerald-500 focus:outline-none text-xl font-bold text-gray-900 bg-transparent py-0.5"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleSaveName}
                                                    disabled={isSavingName}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                                                >
                                                    {isSavingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingName(false)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <h2
                                                className="text-2xl font-bold text-gray-900 flex items-center gap-2 hover:text-emerald-600 cursor-pointer transition-colors group"
                                                onClick={handleStartEditName}
                                                title="Click để sửa tên"
                                            >
                                                {profile.name}
                                                <Edit2 size={14} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                                            </h2>
                                        )}
                                    </div>

                                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-full mb-6">
                                        {profile.role}
                                    </span>

                                    <div className="w-full space-y-4 text-left">
                                        <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-colors">
                                            <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                                                <p className="text-sm font-semibold text-gray-800 break-all">{profile.email}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-colors">
                                            <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trạng thái</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    <p className="text-sm font-semibold text-gray-800">Đang hoạt động</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. RIGHT COLUMN: CHANGE PASSWORD FORM */}
                                <div className="md:col-span-7 bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                                    <div className="mb-6 pb-4 border-b border-gray-50">
                                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Lock size={20} className="text-emerald-500" />
                                            Đổi mật khẩu
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">Vui lòng không chia sẻ mật khẩu của bạn.</p>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50 focus:bg-white"
                                                value={passwordForm.oldPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
                                                <input
                                                    type="password"
                                                    required
                                                    placeholder="••••••••"
                                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50 focus:bg-white"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nhập lại mật khẩu</label>
                                                <input
                                                    type="password"
                                                    required
                                                    placeholder="••••••••"
                                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50 focus:bg-white"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isChangingPassword}
                                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5 flex items-center gap-2"
                                            >
                                                {isChangingPassword ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" /> Đang lưu...
                                                    </>
                                                ) : "Lưu thay đổi"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

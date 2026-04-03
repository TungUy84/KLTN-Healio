import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import logo from '../assets/logohealio.png';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F8FAFC] font-sans overflow-hidden relative">

            {/* 1. BACKGROUND DECORATION (Linear Style) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Circle Top Right */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
                {/* Circle Bottom Left */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
                {/* Grid Pattern (Tạo vân lưới mờ) */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }}></div>
            </div>

            {/* 2. LEFT SIDE: BRANDING & INFO */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 lg:px-24">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100 mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">Admin Portal   </span>
                    </div>
                    <h1 className="text-5xl font-bold text-slate-800 leading-tight mb-4">
                        Quản trị hệ thống <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                            Healio
                        </span>
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
                        Chào mừng quản trị viên. Hãy đăng nhập để quản lý và theo dõi các chỉ số sức khỏe của hệ thống.
                    </p>
                </div>
            </div>

            {/* 3. RIGHT SIDE: LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[420px] bg-white p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative">
                    {/* Logo Floating */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-50 p-2">
                        <img src={logo} alt="Healio" className="w-full h-full object-contain" />
                    </div>

                    <div className="text-center mt-8 mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Đăng nhập</h2>
                        <p className="text-slate-400 text-sm mt-1">Nhập thông tin xác thực của bạn</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Email Admin</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="admin@healio.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Mật khẩu</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all" />
                                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Ghi nhớ tôi</span>
                            </label>
                            <a href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all">
                                Quên mật khẩu?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Truy cập hệ thống
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">© 2026 Healio System. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
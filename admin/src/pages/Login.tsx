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
        <div className="min-h-screen flex bg-white font-sans">
            {/* LEFT SIDE: BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#059669] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

                <div className="relative z-10 text-center px-10">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-2xl">
                        <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Healio Admin</h1>
                    <p className="text-emerald-100 text-lg max-w-md mx-auto leading-relaxed">
                        Hệ thống quản trị dinh dưỡng thông minh & cá nhân hóa cho người Việt.
                    </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900">Chào mừng trở lại! 👋</h2>
                        <p className="text-gray-500 mt-2 text-sm">Vui lòng đăng nhập để truy cập hệ thống quản trị.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="admin@healio.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Mật khẩu</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                                Quên mật khẩu?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Đăng nhập
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
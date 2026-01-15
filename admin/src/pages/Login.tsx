import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Đăng nhập thất bại';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 to-violet-600 font-sans p-5">
            {/* Header / Branding */}
            <div className="text-center mb-8 text-white">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <span className="text-indigo-600 font-bold text-2xl">H</span>
                </div>
                <h1 className="text-2xl font-bold mb-1">Healio Admin</h1>
                <p className="text-sm opacity-90 font-normal m-0">Hệ thống quản lý dinh dưỡng & sức khỏe</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-10 box-border">
                <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
                <p className="text-center text-sm text-gray-500 mb-8">Đăng nhập để truy cập trang quản trị</p>

                {error && (
                    <div className="bg-red-50 text-red-800 p-3 rounded-md mb-5 text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Email hoặc tên đăng nhập</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="Email hoặc tên đăng nhập"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                        <div className="relative flex items-center">
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 bg-none border-none cursor-pointer flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center text-gray-600 cursor-pointer">
                            <input type="checkbox" className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            Ghi nhớ đăng nhập
                        </label>
                        <a href="#" className="text-indigo-600 no-underline font-medium hover:text-indigo-800">Quên mật khẩu?</a>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full p-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer mt-2.5 shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 hover:-translate-y-px ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-6 text-white/70 text-xs text-center">
                <p>© 2026 Healio App. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Login;

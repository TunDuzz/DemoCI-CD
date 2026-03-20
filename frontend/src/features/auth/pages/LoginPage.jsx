import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import useAuthStore from '@/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authService.login(email, password);
            const userState = {
                email: data.email,
                displayName: data.displayName,
                avatarUrl: data.avatarUrl
            };
            login(userState, data.token, data.refreshToken);

            // Handle redirection based on role
            const decoded = jwtDecode(data.token);
            const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            const data = err.response?.data;
            let errMsg = data?.message || data?.title || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.';
            if (data?.errors) {
                const valErrs = Object.values(data.errors).flat();
                if (valErrs.length > 0) errMsg = valErrs[0];
            }
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[100dvh] flex items-center justify-center overflow-auto font-inter py-6 sm:py-12">
            {/* Cinematic Background */}
            <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/posters.jpg')" }}>
                <div className="absolute inset-0 bg-[#060814]/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#060814]/60 via-[#060814]/30 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-[400px] px-4">
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center gap-2.5 group mb-3">
                        <div className="bg-primary-yellow text-black p-2 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            <PlayCircle size={32} strokeWidth={2.5} />
                        </div>
                        <span className="font-heading font-bold text-2xl tracking-tight text-white">
                            Cine<span className="text-white/40 font-light">Stream</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold font-heading text-white">Chào mừng trở lại</h1>
                </div>

                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-yellow/20 rounded-full blur-[80px]"></div>
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-2.5 pl-11 pr-12 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-white/10 bg-black/40 text-primary-yellow focus:ring-primary-yellow focus:ring-offset-0" />
                                <span className="text-white/60">Ghi nhớ</span>
                            </label>
                            <a href="#" className="text-primary-yellow hover:text-yellow-400 transition-colors">Quên mật khẩu?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-yellow text-black font-semibold py-3 rounded-2xl hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center text-sm mt-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Đăng Nhập"}
                        </button>

                        <p className="text-center text-white/60 text-sm mt-4">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-primary-yellow hover:text-yellow-400 font-medium transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

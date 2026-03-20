import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Mail, Lock, User, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import useAuthStore from '@/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';

// Returns { score: 0-4, label, color, width }
function getPasswordStrength(pw) {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score, label: 'Yếu', color: 'bg-red-500', textColor: 'text-red-400', width: 'w-1/4' };
    if (score === 2) return { score, label: 'Trung bình', color: 'bg-orange-400', textColor: 'text-orange-400', width: 'w-2/4' };
    if (score === 3) return { score, label: 'Mạnh', color: 'bg-yellow-400', textColor: 'text-yellow-400', width: 'w-3/4' };
    return { score, label: 'Rất mạnh', color: 'bg-green-500', textColor: 'text-green-400', width: 'w-full' };
}

export default function RegisterPage() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuthStore();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);

        try {
            const data = await authService.register(email, password, displayName);
            const userState = {
                email: data.email,
                displayName: data.displayName,
                avatarUrl: data.avatarUrl
            };

            // Auto-login using the token from registration
            login(userState, data.token, data.refreshToken);

            // Handle redirection based on role
            const decoded = jwtDecode(data.token);
            const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => {
                if (role === 'Admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }, 1500);
        } catch (err) {
            const data = err.response?.data;
            let errMsg = data?.message || data?.title || 'Đăng ký thất bại. Vui lòng thử lại.';
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
        <div className="relative min-h-[100dvh] flex items-center justify-center overflow-auto font-inter py-4 sm:py-8">
            {/* Cinematic Background */}
            <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/posters.jpg')" }}>
                <div className="absolute inset-0 bg-[#060814]/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#060814]/60 via-[#060814]/20 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-[400px] px-4">
                <div className="text-center mb-4">
                    <Link to="/" className="inline-flex items-center gap-2.5 group mb-2">
                        <div className="bg-primary-yellow text-black p-2 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            <PlayCircle size={32} strokeWidth={2.5} />
                        </div>
                        <span className="font-heading font-bold text-2xl tracking-tight text-white">
                            Cine<span className="text-white/40 font-light">Stream</span>
                        </span>
                    </Link>
                    <h1 className="text-xl font-bold font-heading text-white tracking-wide">Tạo tài khoản</h1>
                </div>

                <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary-yellow/20 rounded-full blur-[80px]"></div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-2.5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm px-4 py-3 rounded-xl">
                                {success}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Tên hiển thị</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Tên của bạn"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

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
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (!passwordTouched && e.target.value.length > 0) setPasswordTouched(true);
                                    }}
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Reserved space for Password Strength Indicator to prevent layout jump */}
                            <div className={`transition-all duration-300 overflow-hidden ${(passwordTouched && password.length > 0) ? 'max-h-[60px] opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                                {(() => {
                                    const strength = getPasswordStrength(password);
                                    if (!strength) return null;
                                    return (
                                        <div className="space-y-1.5">
                                            {/* Discrete blocks centered */}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1 w-full max-w-[180px]">
                                                    {[1, 2, 3, 4].map((block) => (
                                                        <div
                                                            key={block}
                                                            className={`h-1 flex-1 rounded-full ${block <= strength.score ? strength.color : 'bg-white/10'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Criteria hints - compact grid */}
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1">
                                                {[
                                                    { ok: password.length >= 8, label: 'Tối thiểu 8 ký tự' },
                                                    { ok: /[A-Z]/.test(password) && /[a-z]/.test(password), label: 'Chữ hoa & thường' },
                                                    { ok: /[0-9]/.test(password), label: 'Có chứa số' },
                                                    { ok: /[^A-Za-z0-9]/.test(password), label: 'Ký tự đặc biệt' },
                                                ].map(({ ok, label }) => (
                                                    <div key={label} className={`flex items-center gap-1.5 text-[10.5px] leading-tight transition-colors ${ok ? 'text-green-400' : 'text-white/20'}`}>
                                                        <span className="shrink-0">{ok ? '✓' : '○'}</span>
                                                        <span className="truncate">{label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success !== ''}
                            className="w-full mt-2 bg-white text-black font-semibold py-3 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Đăng Ký"}
                        </button>

                        <p className="text-center text-white/60 text-sm mt-4">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-primary-yellow hover:text-yellow-400 font-medium transition-colors">
                                Đăng nhập
                            </Link>
                        </p>
                    </form>
                </div>
            </div >
        </div >
    );
}

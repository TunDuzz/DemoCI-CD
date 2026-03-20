import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Key, Save, User as UserIcon } from 'lucide-react';
import adminService from '../services/adminService';
import useAuthStore from '@/store/useAuthStore';

const EditUserModal = ({ user, adminCount, onClose, onUpdate }) => {
    const [role, setRole] = useState(user.role);
    const [email, setEmail] = useState(user.email);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const currentUser = useAuthStore(state => state.user);

    const handleUpdateUser = async () => {
        try {
            setLoading(true);
            await adminService.updateUser(user.id, { email, displayName, avatarUrl });
            onUpdate();
            alert('Cập nhật thông tin thành công');
        } catch (error) {
            alert('Lỗi khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async () => {
        const newRole = parseInt(role);

        // Check for last admin protection
        if (user.role === 1 && newRole !== 1 && adminCount <= 1) {
            alert('Không thể hạ quyền Admin duy nhất trong hệ thống!');
            return;
        }

        try {
            setLoading(true);
            await adminService.updateUserRole(user.id, newRole);
            onUpdate();
            alert('Cập nhật vai trò thành công');
        } catch (error) {
            const message = error.response?.data?.message || 'Lỗi khi cập nhật vai trò';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword) return alert('Vui lòng nhập mật khẩu mới');
        try {
            setLoading(true);
            await adminService.changePassword(user.id, newPassword);
            setNewPassword('');
            alert('Đổi mật khẩu thành công');
        } catch (error) {
            alert('Lỗi khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[1.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in scale-in-95 duration-200">
                {/* Header - Compact */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                            <UserIcon size={16} />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Quản lý User</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Compact Form */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên hiển thị</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Avatar URL</label>
                            <input
                                type="text"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <button
                            onClick={handleUpdateUser}
                            disabled={loading}
                            className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={14} /> Cập nhật Profile
                        </button>
                    </div>

                    <div className="h-[1px] bg-slate-100"></div>

                    {/* Role & Pass - Double Column */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vai trò</span>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100"
                            >
                                <option value={0}>Thành viên</option>
                                <option value={1}>Admin</option>
                            </select>
                            <button
                                onClick={handleUpdateRole}
                                disabled={loading}
                                className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Lưu Quyền
                            </button>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu mới</span>
                            <input
                                type="password"
                                placeholder="..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <button
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="w-full py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all"
                            >
                                Đổi Pass
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-3 text-center border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">UID: {user.id}</p>
                </div>
            </div>
        </div>,
        document.body
    );
};


export default EditUserModal;

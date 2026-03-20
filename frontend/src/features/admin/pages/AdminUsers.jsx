import React, { useEffect, useState } from 'react';
import {
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Shield,
    User,
    Mail,
    Calendar,
    Filter,
    Key
} from 'lucide-react';
import adminService from '../services/adminService';
import EditUserModal from '../components/EditUserModal';
import useAuthStore from '@/store/useAuthStore';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const currentUser = useAuthStore(state => state.user);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getUsers();
            setUsers(response);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id) => {
        if (id === currentUser?.id) {
            alert('Bạn không thể tự xóa chính mình!');
            return;
        }

        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await adminService.deleteUser(id);
                fetchUsers();
            } catch (error) {
                const message = error.response?.data?.message || 'Lỗi khi xóa người dùng';
                alert(message);
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const adminCount = users.filter(u => u.role === 1).length;

    const RoleBadge = ({ role }) => {
        const isAdmin = role === 1;
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                }`}>
                <Shield size={12} fill={isAdmin ? 'currentColor' : 'none'} />
                {isAdmin ? 'Quản trị' : 'Thành viên'}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Người dùng</h1>
                    <p className="text-slate-500 font-medium">Quản lý danh sách thành viên và phân quyền hệ thống.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-50/50 shadow-sm transition-all outline-none w-80"
                        />
                    </div>
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-indigo-600 shadow-sm transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Người dùng</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ngày tham gia</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-8 py-20 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                                </td>
                            </tr>
                        ) : filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-transparent group-hover:ring-indigo-50 transition-all">
                                            {u.avatarUrl ? (
                                                <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-black text-lg">
                                                    {u.displayName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight mb-1">{u.displayName}</p>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Mail size={12} />
                                                <span className="text-xs font-medium">{u.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <RoleBadge role={u.role} />
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar size={14} />
                                        <span className="text-xs font-bold">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 transition-opacity">
                                        <button
                                            onClick={() => setEditingUser(u)}
                                            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            title="Sửa"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            disabled={u.id === currentUser?.id}
                                            className={`p-2.5 rounded-xl transition-all shadow-sm ${u.id === currentUser?.id
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                                                }`}
                                            title={u.id === currentUser?.id ? "Bạn không thể xóa chính mình" : "Xóa"}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    adminCount={adminCount}
                    onClose={() => setEditingUser(null)}
                    onUpdate={fetchUsers}
                />
            )}
        </div>
    );
};

export default AdminUsers;

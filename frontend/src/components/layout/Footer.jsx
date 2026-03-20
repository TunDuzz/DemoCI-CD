import { PlayCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-white/10 bg-black/40 pt-16 pb-8 px-6">
            <div className="max-w-[1800px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-primary-yellow text-black p-1.5 rounded-full">
                            <PlayCircle size={24} strokeWidth={2.5} />
                        </div>
                        <span className="font-heading font-bold text-2xl tracking-tight text-white">
                            Cine<span className="text-gray-400 font-light">Stream</span>
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Nền tảng xem phim trực tuyến chất lượng cao, cập nhật nhanh nhất các bộ phim bom tấn, phim truyền hình đặc sắc.
                    </p>
                </div>

                <div>
                    <h4 className="font-heading font-semibold text-lg mb-4 text-white">Dịch vụ</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-primary-yellow transition">Phim mới</a></li>
                        <li><a href="#" className="hover:text-primary-yellow transition">Phim chiếu rạp</a></li>
                        <li><a href="#" className="hover:text-primary-yellow transition">Phim bộ</a></li>
                        <li><a href="#" className="hover:text-primary-yellow transition">Phim lẻ</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-heading font-semibold text-lg mb-4 text-white">Hỗ trợ</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-primary-yellow transition">FAQ</a></li>
                        <li><a href="#" className="hover:text-primary-yellow transition">Liên hệ</a></li>
                        <li><a href="#" className="hover:text-primary-yellow transition">Điều khoản sử dụng</a></li>
                        <li><a href="#" className="hover:text-primary-yellow transition">Chính sách bảo mật</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-heading font-semibold text-lg mb-4 text-white">Theo dõi</h4>
                    <p className="text-sm text-gray-400 mb-4">Nhận thông báo về các bộ phim mới nhất.</p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Email của bạn"
                            className="bg-white/5 border border-white/10 rounded-l-lg py-2 pl-4 pr-2 text-sm focus:outline-none w-full"
                        />
                        <button className="bg-primary-yellow text-black font-medium px-4 py-2 rounded-r-lg hover:bg-primary-yellow-hover">
                            Đăng ký
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Cinestream (Cinestream). All rights reserved.
            </div>
        </footer>
    );
}

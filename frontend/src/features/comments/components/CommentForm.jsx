import React, { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { useCommentStore } from '../store/useCommentStore';
import useAuthStore from '../../../store/useAuthStore';

export const CommentForm = ({ movieId, parentId = null, onCancel = null, onSuccess = null, initialContent = '', isInternalEdit = false, editCommentId = null }) => {
    const [content, setContent] = useState(initialContent);
    const [isSpoiler, setIsSpoiler] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addComment = useCommentStore(state => state.addComment);
    const updateComment = useCommentStore(state => state.updateComment);
    const user = useAuthStore(state => state.user);

    const maxLength = 1000;
    const remainingChars = maxLength - content.length;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Vui lòng đăng nhập để bình luận!');
            return;
        }

        if (!content.trim() || remainingChars < 0) return;

        setIsSubmitting(true);
        try {
            let success = false;
            if (editCommentId) {
                success = await updateComment(editCommentId, content, isSpoiler);
            } else {
                success = await addComment(movieId, content, parentId, isSpoiler);
            }

            if (success) {
                if (!editCommentId) {
                    setContent('');
                    setIsSpoiler(false); // Reset spoiler status only for new comments
                }
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={parentId ? "Viết phản hồi của bạn..." : "Bạn nghĩ gì về phim này?"}
                    className="w-full min-h-[100px] p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-y transition-all"
                    maxLength={maxLength + 50} // Allow a bit more so user sees negative but valid limits it inside handle
                />
                <div className={`absolute bottom-3 right-3 text-xs font-medium ${remainingChars < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                    {content.length} / {maxLength}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`flex items-center justify-center w-5 h-5 rounded border ${isSpoiler ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-zinc-700 group-hover:border-amber-500/50 transition-colors'}`}>
                        {isSpoiler && <AlertTriangle size={12} />}
                    </div>
                    <input
                        type="checkbox"
                        checked={isSpoiler}
                        onChange={(e) => setIsSpoiler(e.target.checked)}
                        className="hidden"
                    />
                    <span className="text-sm font-medium text-zinc-400 select-none group-hover:text-zinc-300 transition-colors">
                        Bình luận chứa spoiler (tiết lộ nội dung)
                    </span>
                </label>

                <div className="flex gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                        >
                            Hủy
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!content.trim() || remainingChars < 0 || isSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_20px_rgba(225,29,72,0.5)] active:scale-95"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        <span>Gửi</span>
                    </button>
                </div>
            </div>
        </form>
    );
};

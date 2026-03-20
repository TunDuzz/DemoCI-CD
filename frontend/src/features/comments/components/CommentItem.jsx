import React, { useState } from 'react';
import { MessageCircle, MoreVertical, Flag, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { CommentReactions } from './CommentReactions';
import { CommentForm } from './CommentForm';
import { useCommentStore } from '../store/useCommentStore';
import useAuthStore from '../../../store/useAuthStore';

export const CommentItem = ({ comment, movieId, isReply = false }) => {
    const [isRevealed, setIsRevealed] = useState(!comment.isSpoiler);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Just a placeholder for edit
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { repliesCache, repliesLoading, fetchReplies, repliesHasMore, deleteComment, updateComment } = useCommentStore();
    const [showReplies, setShowReplies] = useState(false);

    const replies = repliesCache[comment.id] || [];
    const isLoadingReplies = repliesLoading[comment.id] || false;
    const hasMoreReplies = repliesHasMore[comment.id] || false;

    const user = useAuthStore(state => state.user);
    const isOwner = user && (user.id === comment.userId || user.Id === comment.userId);

    const handleToggleReplies = () => {
        if (!showReplies && replies.length === 0) {
            fetchReplies(movieId, comment.id);
        }
        setShowReplies(!showReplies);
    };

    const handleLoadMoreReplies = () => {
        const lastCursorId = replies.length > 0 ? replies[replies.length - 1].id : null;
        fetchReplies(movieId, comment.id, lastCursorId);
    };

    const handleReplySuccess = () => {
        setIsReplying(false);
        if (!showReplies) handleToggleReplies();
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            const success = await deleteComment(comment.id, comment.parentId);
            if (success) {
                setIsMenuOpen(false);
            } else {
                alert('Xóa bình luận thất bại. Vui lòng thử lại!');
            }
        }
    };

    return (
        <div className={`flex gap-4 ${isReply ? 'mt-4' : 'mt-6'}`}>
            <img
                src={comment.avatarUrl || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`}
                alt={comment.userName}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800"
            />

            <div className="flex-1 w-full max-w-full min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200 text-sm tracking-wide">
                            {comment.userName}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-full hover:bg-zinc-800"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                                {isOwner && (
                                    <>
                                        <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
                                            <Edit2 size={14} /> Chỉnh sửa
                                        </button>
                                        <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-zinc-800 flex items-center gap-2">
                                            <Trash2 size={14} /> Xóa
                                        </button>
                                    </>
                                )}
                                <button className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
                                    <Flag size={14} /> Báo cáo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-2">
                    {isEditing ? (
                        <div className="mt-2">
                            <CommentForm
                                movieId={movieId}
                                parentId={comment.parentId}
                                initialContent={comment.content}
                                isInternalEdit={true}
                                onCancel={() => setIsEditing(false)}
                                onSuccess={() => setIsEditing(false)}
                                editCommentId={comment.id}
                            />
                        </div>
                    ) : comment.isSpoiler && !isRevealed ? (
                        <div
                            onClick={() => setIsRevealed(true)}
                            className="w-full py-4 bg-zinc-900 border border-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 flex items-center justify-center group"
                        >
                            <div className="flex flex-col items-center gap-1.5 opacity-80 group-hover:opacity-100">
                                <AlertTriangle size={20} className="text-amber-500" />
                                <span className="text-sm font-semibold text-amber-500/90">Bình luận có thể chứa nội dung tiết lộ cốt truyện. Nhấn để xem.</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {comment.content}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <CommentReactions comment={comment} movieId={movieId} parentId={comment.parentId} />

                    <button
                        onClick={() => {
                            if (!user) {
                                alert('Vui lòng đăng nhập để phản hồi bình luận!');
                                return;
                            }
                            setIsReplying(!isReplying);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md"
                    >
                        <MessageCircle size={14} />
                        <span>Phản hồi</span>
                    </button>
                </div>

                {isReplying && (
                    <div className="mt-4 pl-4 border-l-2 border-zinc-800/50">
                        <CommentForm
                            movieId={movieId}
                            parentId={comment.id}
                            initialContent={`@${comment.userName} `}
                            onCancel={() => setIsReplying(false)}
                            onSuccess={handleReplySuccess}
                        />
                    </div>
                )}

                {/* Replies trigger */}
                {comment.replyCount > 0 && (
                    <button
                        onClick={handleToggleReplies}
                        className="flex items-center gap-2 mt-3 text-sm font-semibold text-blue-500 hover:text-blue-400"
                    >
                        <div className="w-6 h-[1px] bg-blue-500/50" />
                        {showReplies ? 'Ẩn câu trả lời' : `Hiển thị ${comment.replyCount} câu trả lời`}
                    </button>
                )}

                {/* Nested Replies Rendering */}
                {showReplies && (
                    <div className="pl-4 sm:pl-8 mt-2 relative border-l border-zinc-800/80 ml-2">
                        {replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                movieId={movieId}
                                isReply={true}
                            />
                        ))}

                        {isLoadingReplies && (
                            <div className="py-4 flex justify-center">
                                <div className="w-5 h-5 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
                            </div>
                        )}

                        {hasMoreReplies && !isLoadingReplies && (
                            <button
                                onClick={handleLoadMoreReplies}
                                className="mt-4 text-sm font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-2"
                            >
                                <MoreVertical size={14} className="rotate-90" /> Tải thêm phản hồi
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

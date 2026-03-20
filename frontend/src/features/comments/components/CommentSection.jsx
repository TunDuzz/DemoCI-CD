import React, { useEffect, useState } from 'react';
import { useCommentStore } from '../store/useCommentStore';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

export const CommentSection = ({ movieId }) => {
    const { comments, loading, error, hasMore, fetchComments } = useCommentStore();
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        // Only fetch if we haven't loaded them this session, or refetch ideally
        fetchComments(movieId, sortBy, null);
    }, [movieId, sortBy]); // Removed fetchComments from deps as it might cause loops if not memoized

    const handleLoadMore = () => {
        const lastCursorId = comments.length > 0 ? comments[comments.length - 1].id : null;
        fetchComments(movieId, sortBy, lastCursorId);
    };

    return (
        <section className="w-full max-w-4xl mx-auto py-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-sans tracking-tight">
                    Bình luận {comments.length > 0 && <span className="text-zinc-500 text-lg font-normal ml-2">({comments.length}+)</span>}
                </h2>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-400">Sắp xếp theo:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="popular">Nổi bật</option>
                    </select>
                </div>
            </div>

            <div className="mb-10 p-1">
                <CommentForm movieId={movieId} />
            </div>

            <div className="space-y-6">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} movieId={movieId} />
                ))}

                {comments.length === 0 && !loading && (
                    <div className="py-12 text-center text-zinc-500 flex flex-col items-center">
                        <MessageCircle size={48} className="mb-4 opacity-20" />
                        <p className="font-medium text-lg">Chưa có bình luận nào</p>
                        <p className="text-sm mt-1">Hãy là người đầu tiên chia sẻ cảm nghĩ về bộ phim này.</p>
                    </div>
                )}

                {loading && (
                    <div className="py-8 flex justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
                    </div>
                )}

                {hasMore && !loading && comments.length > 0 && (
                    <div className="pt-6 pb-2 text-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-sm font-semibold text-zinc-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            Tải thêm bình luận
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

// Imported here just for the empty state icon
import { MessageCircle } from 'lucide-react';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useCommentStore } from '../store/useCommentStore';
import useAuthStore from '../../../store/useAuthStore';

export const CommentReactions = ({ comment, movieId, parentId = null }) => {
    const updateReactionLocally = useCommentStore(state => state.updateCommentReactionLocally);
    const reactToComment = useCommentStore(state => state.reactToComment);
    const user = useAuthStore(state => state.user);

    const handleReact = async (isLike) => {
        if (!user) {
            alert('Vui lòng đăng nhập để thực hiện!');
            return;
        }

        // Optimistic update
        updateReactionLocally(comment.id, isLike, parentId);

        try {
            const success = await reactToComment(comment.id, isLike, parentId);
            if (!success) {
                // Rollback if needed - for now just log
                console.error('Reaction failed on server');
            }
        } catch (error) {
            console.error('Reaction error:', error);
        }
    };

    const isLiked = comment.currentUserReaction === true;
    const isDisliked = comment.currentUserReaction === false;

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => handleReact(true)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold ${isLiked
                    ? 'text-rose-500 bg-rose-500/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
            >
                <ThumbsUp size={14} className={isLiked ? 'fill-rose-500' : ''} />
                <span>{comment.likeCount > 0 ? comment.likeCount : 'Thích'}</span>
            </button>
            <button
                onClick={() => handleReact(false)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold ${isDisliked
                    ? 'text-blue-500 bg-blue-500/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
            >
                <ThumbsDown size={14} className={isDisliked ? 'fill-blue-500' : ''} />
                <span>{comment.dislikeCount > 0 ? comment.dislikeCount : ''}</span>
            </button>
        </div>
    );
};

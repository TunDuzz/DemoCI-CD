import { create } from 'zustand';
import { commentApi } from '../api/commentApi';

export const useCommentStore = create((set, get) => ({
    comments: [],
    loading: false,
    error: null,
    hasMore: true,

    // Use an object to store replies cache mapping parentId -> replies array
    repliesCache: {},
    repliesLoading: {},
    repliesHasMore: {},

    // Fetch initial or load more main comments
    fetchComments: async (movieId, sortBy = 'newest', cursorId = null) => {
        set({ loading: true, error: null });
        try {
            const response = await commentApi.getComments(movieId, sortBy, cursorId);
            const newComments = response.data;

            set((state) => ({
                comments: cursorId ? [...state.comments, ...newComments] : newComments,
                hasMore: newComments.length === 20, // Assuming pageSize is 20
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchReplies: async (movieId, parentId, cursorId = null) => {
        set((state) => ({
            repliesLoading: { ...state.repliesLoading, [parentId]: true }
        }));
        try {
            const response = await commentApi.getReplies(movieId, parentId, cursorId);
            const newReplies = response.data;

            set((state) => {
                const existing = state.repliesCache[parentId] || [];
                return {
                    repliesCache: {
                        ...state.repliesCache,
                        [parentId]: cursorId ? [...existing, ...newReplies] : newReplies
                    },
                    repliesHasMore: {
                        ...state.repliesHasMore,
                        [parentId]: newReplies.length === 20
                    },
                    repliesLoading: { ...state.repliesLoading, [parentId]: false }
                };
            });
        } catch (error) {
            set((state) => ({
                repliesLoading: { ...state.repliesLoading, [parentId]: false }
            }));
        }
    },

    addComment: async (movieId, content, parentId = null, isSpoiler = false) => {
        try {
            const response = await commentApi.createComment(movieId, content, parentId, isSpoiler);
            const newComment = response.data;

            set((state) => {
                const newState = { ...state };

                if (parentId) {
                    // 1. Update replyCount on the parent (could be in top-level comments or in repliesCache)
                    newState.comments = state.comments.map(c =>
                        c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c
                    );

                    // Search in ALL cached replies for the parent to update its count
                    const newRepliesCache = { ...state.repliesCache };
                    Object.keys(newRepliesCache).forEach(key => {
                        newRepliesCache[key] = newRepliesCache[key].map(r =>
                            r.id === parentId ? { ...r, replyCount: r.replyCount + 1 } : r
                        );
                    });

                    // 2. Add the new comment to the repliesCache of its parent
                    const existingReplies = newRepliesCache[parentId] || [];
                    newRepliesCache[parentId] = [newComment, ...existingReplies];

                    newState.repliesCache = newRepliesCache;
                } else {
                    newState.comments = [newComment, ...state.comments];
                }

                return newState;
            });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    updateComment: async (commentId, content, isSpoiler = false) => {
        try {
            const response = await commentApi.updateComment(commentId, content, isSpoiler);
            // axiosClient interceptor returns response.data directly
            if (response.success) {
                set((state) => {
                    const updateLogic = (c) => c.id === commentId ? { ...c, content, isSpoiler } : c;

                    // Update in top-level
                    const updatedComments = state.comments.map(updateLogic);

                    // Update in replies cache
                    const newRepliesCache = {};
                    Object.keys(state.repliesCache).forEach(key => {
                        newRepliesCache[key] = state.repliesCache[key].map(updateLogic);
                    });

                    return {
                        comments: updatedComments,
                        repliesCache: newRepliesCache
                    };
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to update comment:", error);
            return false;
        }
    },

    deleteComment: async (commentId, parentId = null) => {
        try {
            const response = await commentApi.deleteComment(commentId);
            if (response.success) {
                get().deleteCommentLocally(commentId, parentId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to delete comment:", error);
            return false;
        }
    },

    deleteCommentLocally: (commentId, parentId = null) => {
        set((state) => {
            const newState = { ...state };

            // 1. Update replyCount on the parent if it exists
            if (parentId) {
                newState.comments = state.comments.map(c =>
                    c.id === parentId ? { ...c, replyCount: Math.max(0, c.replyCount - 1) } : c
                );

                const newRepliesCache = { ...state.repliesCache };
                Object.keys(newRepliesCache).forEach(key => {
                    newRepliesCache[key] = newRepliesCache[key].map(r =>
                        r.id === parentId ? { ...r, replyCount: Math.max(0, r.replyCount - 1) } : r
                    );
                });

                // 2. Remove the comment from its specifically tracked parent's list
                if (newRepliesCache[parentId]) {
                    newRepliesCache[parentId] = newRepliesCache[parentId].filter(c => c.id !== commentId);
                }

                newState.repliesCache = newRepliesCache;
            } else {
                // Top-level delete
                newState.comments = state.comments.filter(c => c.id !== commentId);
            }

            return newState;
        });
    },

    updateCommentReactionLocally: (commentId, isLike, parentId = null) => {
        const updateLogic = (c) => {
            if (c.id !== commentId) return c;

            let { likeCount, dislikeCount, currentUserReaction } = c;

            if (currentUserReaction === isLike) {
                // Toggle off
                if (isLike === true) likeCount = Math.max(0, likeCount - 1);
                if (isLike === false) dislikeCount = Math.max(0, dislikeCount - 1);
                currentUserReaction = null;
            } else {
                // Switch or new
                if (currentUserReaction === true) likeCount = Math.max(0, likeCount - 1);
                if (currentUserReaction === false) dislikeCount = Math.max(0, dislikeCount - 1);

                if (isLike === true) likeCount++;
                if (isLike === false) dislikeCount++;
                currentUserReaction = isLike;
            }

            return { ...c, likeCount, dislikeCount, currentUserReaction };
        };

        set((state) => {
            // Update top-level comments
            const updatedComments = state.comments.map(updateLogic);

            // Update ALL replies in cache
            const newRepliesCache = {};
            Object.keys(state.repliesCache).forEach(key => {
                newRepliesCache[key] = state.repliesCache[key].map(updateLogic);
            });

            return {
                comments: updatedComments,
                repliesCache: newRepliesCache
            };
        });
    },

    reactToComment: async (commentId, isLike, parentId = null) => {
        try {
            const response = await commentApi.reactToComment(commentId, isLike);
            return response.success;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}));

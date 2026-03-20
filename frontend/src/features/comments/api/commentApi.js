import axiosClient from '../../../utils/axiosClient';

export const commentApi = {
    getComments: async (movieId, sortBy = 'newest', cursorId = null, pageSize = 20) => {
        const params = new URLSearchParams({ sortBy, pageSize: pageSize.toString() });
        if (cursorId) params.append('cursorId', cursorId);

        return axiosClient.get(`/movies/${movieId}/comments?${params.toString()}`);
    },

    getReplies: async (movieId, parentId, cursorId = null, pageSize = 20) => {
        const params = new URLSearchParams({ pageSize: pageSize.toString() });
        if (cursorId) params.append('cursorId', cursorId);

        return axiosClient.get(`/movies/${movieId}/comments/${parentId}/replies?${params.toString()}`);
    },

    createComment: async (movieId, content, parentId = null, isSpoiler = false) => {
        return axiosClient.post(`/movies/${movieId}/comments`, {
            content,
            parentId,
            isSpoiler
        });
    },

    updateComment: async (commentId, content, isSpoiler = false) => {
        return axiosClient.put(`/comments/${commentId}`, {
            content,
            isSpoiler
        });
    },

    deleteComment: async (commentId) => {
        return axiosClient.delete(`/comments/${commentId}`);
    },

    reactToComment: async (commentId, isLike) => {
        return axiosClient.post(`/comments/${commentId}/react`, {
            isLike
        });
    }
};

export const ratingApi = {
    getMovieRatingStats: async (movieId) => {
        return axiosClient.get(`/movies/${movieId}/ratings`);
    },

    createOrUpdateRating: async (movieId, score) => {
        return axiosClient.post(`/movies/${movieId}/ratings`, { score });
    }
};

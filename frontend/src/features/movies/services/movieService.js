import axiosClient from '../../../utils/axiosClient';

export const movieService = {
    getLatestMovies: async (page = 1) => {
        return await axiosClient.get(`Movies/latest?page=${page}`);
    },

    getMovieDetail: async (slug) => {
        return await axiosClient.get(`Movies/detail/${slug}`);
    },

    getMoviesByType: async (type, page = 1, filters = {}) => {
        const { category, country, year } = filters;
        let url = `Movies/type/${type}?page=${page}`;
        if (category) url += `&category=${category}`;
        if (country) url += `&country=${country}`;
        if (year) url += `&year=${year}`;
        return await axiosClient.get(url);
    },

    searchMovies: async (keyword, page = 1, filters = {}) => {
        const { category, country, year, type } = filters;
        let url = `Movies/search?keyword=${encodeURIComponent(keyword)}&page=${page}`;
        if (category) url += `&category=${category}`;
        if (country) url += `&country=${country}`;
        if (year) url += `&year=${year}`;
        if (type) url += `&type=${type}`;
        return await axiosClient.get(url);
    },

    getMoviesByCategory: async (slug, page = 1, filters = {}) => {
        const { country, year } = filters;
        let url = `Movies/category/${slug}?page=${page}`;
        if (country) url += `&country=${country}`;
        if (year) url += `&year=${year}`;
        return await axiosClient.get(url);
    },

    getMoviesByCountry: async (slug, page = 1, filters = {}) => {
        const { category, year } = filters;
        let url = `Movies/country/${slug}?page=${page}`;
        if (category) url += `&category=${category}`;
        if (year) url += `&year=${year}`;
        return await axiosClient.get(url);
    },

    getCategories: async () => {
        return await axiosClient.get('Movies/categories');
    },

    getCountries: async () => {
        return await axiosClient.get('Movies/countries');
    },

    getSetting: async (key) => {
        try {
            return await axiosClient.get(`Settings/${key}`);
        } catch (error) {
            console.error(`Error fetching setting ${key}:`, error);
            return null;
        }
    },

    getCredits: async (tmdbId, mediaType = 'movie') => {
        try {
            return await axiosClient.get(`Movies/credits/${tmdbId}?mediaType=${mediaType}`);
        } catch (error) {
            console.error(`Error fetching TMDB credits:`, error);
            return null;
        }
    },
};

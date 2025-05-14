import axios from 'axios';

const API_URL = "http://localhost:4000/api";

const expressApi = axios.create({
  baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

expressApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const login = async (credential: string, password: string) => {
    try {
        const response = await expressApi.post(`/auth/login`, { credential, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (username: string, email: string, password: string) => {
    try {
        const response = await expressApi.post(`/auth/register"`, { username, email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await expressApi.get(`/auth/profile`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUsers = async () => {
    try {
        const response = await expressApi.get(`/users`);
        return response.data.users;
    } catch (error) {
        throw error;
    }
};

export const createUser = async (userData: { username: string; email: string; password: string; role: string }) => {
    try {
        const response = await expressApi.post(`/users`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId: string) => {
    try {
        const response = await expressApi.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUserRole = async (id: string, role: string)=> {
    try {
        const response = await expressApi.patch(`/users/${id}/role`, { role });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default expressApi;

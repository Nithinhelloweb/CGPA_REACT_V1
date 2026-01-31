import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getSubjects = async (semester, department, batch, regulation = null) => {
    try {
        const params = { semester, department, batch };
        if (regulation) params.regulation = regulation;

        const response = await api.get('/api/subjects', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
};

export const getAvailableBatches = async (department = null, semester = null) => {
    try {
        const params = {};
        if (department) params.department = department;
        if (semester) params.semester = semester;

        const response = await api.get('/api/batches', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching batches:', error);
        throw error;
    }
};

export const submitCGPA = async (data) => {
    try {
        const response = await api.post('/submit-cgpa', data);
        return response.data;
    } catch (error) {
        console.error('Error submitting CGPA:', error);
        throw error;
    }
};

export const getRegulations = async () => {
    try {
        const response = await api.get('/api/regulations');
        return response.data;
    } catch (error) {
        console.error('Error fetching regulations:', error);
        throw error;
    }
};

export const getActiveRegulations = async () => {
    try {
        const response = await api.get('/api/regulations/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active regulations:', error);
        throw error;
    }
};

export const getRegulationForBatch = async (batch) => {
    try {
        const response = await api.get(`/api/regulations/for-batch/${batch}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching regulation for batch:', error);
        throw error;
    }
};

export default api;

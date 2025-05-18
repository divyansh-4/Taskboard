import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchTasks = async () => {
    try {
        return await axios.get(`${API_URL}/tasks`);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

export const updateTasks = async (tasks) => {
    try {
        return await axios.post(`${API_URL}/tasks`, tasks);
    } catch (error) {
        console.error('Error updating tasks:', error);
        throw error;
    }
};
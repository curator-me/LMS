import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const authApi = {
  signup: (data) => api.post('/user/signup', data),
  login: (data) => api.post('/user/login', data),
  setupBank: (email, accountNumber, secret) => api.post('/user/setup-bank', { email, accountNumber, secret }),
  getBalance: (accountNumber) => api.get(`/user/balance/${accountNumber}`),
};

export const courseApi = {
  list: () => api.get('/course'),
  get: (id) => api.get(`/course/${id}`),
  upload: (data) => api.post('/course/upload', data),

  buy: (data) => api.post('/course/buy', data),
  complete: (enrollmentId) => api.post('/course/complete', { enrollmentId }),
  myCourses: (userId) => api.get(`/course/my/${userId}`),
  getEnrollment: (userId, courseId) => api.get(`/course/enrollment/${userId}/${courseId}`),
  finishMaterial: (enrollmentId, materialId) => api.post('/course/finish-material', { enrollmentId, materialId }),
};


export default api;

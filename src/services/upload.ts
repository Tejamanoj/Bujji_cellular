import api from './api';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    // Production:
    // const formData = new FormData();
    // formData.append('file', file);
    // const res = await api.post('/upload', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    // return res.data.url;
    
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network latency
    
    // Create a local object URL or mock a public photo path
    return URL.createObjectURL(file);
  },
};

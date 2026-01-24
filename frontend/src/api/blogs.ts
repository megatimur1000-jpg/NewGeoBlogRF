import apiClient from './apiClient';
import { Blog } from '../types/blog';

// Получить все блоги
export const getBlogs = async (): Promise<Blog[]> => {
  const response = await apiClient.get('/blogs');
  return response.data;
};

// Получить блог по ID
export const getBlogById = async (id: string): Promise<Blog> => {
  const response = await apiClient.get(`/blogs/${id}`);
  return response.data;
};

// Создать новый блог
export const createBlog = async (blogData: Partial<Blog>): Promise<Blog> => {
  const response = await apiClient.post('/blogs', blogData);
  return response.data;
};

// Обновить блог
export const updateBlog = async (id: string, blogData: Partial<Blog>): Promise<Blog> => {
  const response = await apiClient.put(`/blogs/${id}`, blogData);
  return response.data;
};

// === API для черновиков ===

// Получить черновики пользователя
export const getUserDrafts = async (): Promise<Blog[]> => {
  const response = await apiClient.get('/blogs/user/drafts');
  return response.data;
};

// Сохранить черновик
export const saveDraft = async (draftData: {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image_url?: string;
  tags?: string[];
  related_route_id?: string;
  related_markers?: string[];
  constructor_data?: any;
}): Promise<Blog> => {
  const response = await apiClient.post('/blogs/drafts', draftData);
  return response.data;
};

// Обновить черновик
export const updateDraft = async (id: string, draftData: {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image_url?: string;
  tags?: string[];
  related_route_id?: string;
  related_markers?: string[];
  constructor_data?: any;
}): Promise<Blog> => {
  const response = await apiClient.put(`/blogs/drafts/${id}`, draftData);
  return response.data;
};

// Удалить блог
export const deleteBlog = async (id: string): Promise<void> => {
  await apiClient.delete(`/blogs/${id}`);
};

// Получить блоги текущего пользователя
export const getUserBlogs = async (): Promise<Blog[]> => {
  const response = await apiClient.get('/blogs/user/blogs');
  return response.data;
};

// Лайкнуть блог
export const likeBlog = async (id: string): Promise<void> => {
  await apiClient.post(`/blogs/${id}/like`);
};

// Убрать лайк с блога
export const unlikeBlog = async (id: string): Promise<void> => {
  await apiClient.delete(`/blogs/${id}/like`);
};





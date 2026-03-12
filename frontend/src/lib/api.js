import {
  loginUser as loginUserService,
  logoutUser as logoutUserService,
  registerUser as registerUserService,
  getCurrentUser,
  updateCurrentUser as updateCurrentUserService,
} from '@/services/auth.service';
import {
  createPost as createPostService,
  getPosts as getPostsService,
  getPostById as getPostByIdService,
} from '@/services/post.service';
import {
  getAdminUsers as getAdminUsersService,
  getAdminPosts as getAdminPostsService,
  getAdminAnalytics as getAdminAnalyticsService,
  updateAdminUser as updateAdminUserService,
  updateAdminPost as updateAdminPostService,
  deleteAdminUser as deleteAdminUserService,
  deleteAdminPost as deleteAdminPostService,
} from '@/services/admin.service';

function parseParams(params = '') {
  if (!params) return {};
  const sp = new URLSearchParams(params);
  return Object.fromEntries(sp.entries());
}

export async function registerUser(payload) {
  return registerUserService(payload);
}

export async function loginUser(payload) {
  return loginUserService(payload);
}

export async function logoutUser() {
  return logoutUserService();
}

export async function getProfile() {
  return getCurrentUser();
}

export async function updateProfile(payload) {
  return updateCurrentUserService(payload);
}

export async function createPost(payload) {
  return createPostService(payload);
}

export async function getPosts(params = '') {
  return getPostsService(parseParams(params));
}

export async function getPostById(id) {
  return getPostByIdService(id);
}

export async function getAdminUsers(params = '') {
  return getAdminUsersService(parseParams(params));
}

export async function getAdminPosts(params = '') {
  return getAdminPostsService(parseParams(params));
}

export async function getAdminAnalytics() {
  return getAdminAnalyticsService();
}

export async function updateAdminUser(id, payload) {
  return updateAdminUserService(id, payload);
}

export async function updateAdminPost(id, payload) {
  return updateAdminPostService(id, payload);
}

export async function deleteAdminUser(id) {
  return deleteAdminUserService(id);
}

export async function deleteAdminPost(id) {
  return deleteAdminPostService(id);
}

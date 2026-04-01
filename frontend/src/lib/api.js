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
  togglePostLike as togglePostLikeService,
  togglePostBookmark as togglePostBookmarkService,
} from '@/services/post.service';
import {
  createComment as createCommentService,
  deleteComment as deleteCommentService,
  getComments as getCommentsService,
  toggleCommentLike as toggleCommentLikeService,
  updateComment as updateCommentService,
} from '@/services/comment.service';
import { createContact as createContactService } from '@/services/contact.service';
import {
  getAdminUsers as getAdminUsersService,
  getAdminPosts as getAdminPostsService,
  getAdminComments as getAdminCommentsService,
  getAdminContacts as getAdminContactsService,
  getAdminAnalytics as getAdminAnalyticsService,
  updateAdminUser as updateAdminUserService,
  updateAdminPost as updateAdminPostService,
  updateAdminContact as updateAdminContactService,
  deleteAdminUser as deleteAdminUserService,
  deleteAdminPost as deleteAdminPostService,
  deleteAdminComment as deleteAdminCommentService,
  deleteAdminContact as deleteAdminContactService,
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

export async function togglePostLike(id) {
  return togglePostLikeService(id);
}

export async function togglePostBookmark(id) {
  return togglePostBookmarkService(id);
}

export async function getComments(params = '') {
  return getCommentsService(parseParams(params));
}

export async function createComment(payload) {
  return createCommentService(payload);
}

export async function updateComment(id, payload) {
  return updateCommentService(id, payload);
}

export async function deleteComment(id) {
  return deleteCommentService(id);
}

export async function toggleCommentLike(id) {
  return toggleCommentLikeService(id);
}

export async function createContact(payload) {
  return createContactService(payload);
}

export async function getAdminUsers(params = '') {
  return getAdminUsersService(parseParams(params));
}

export async function getAdminPosts(params = '') {
  return getAdminPostsService(parseParams(params));
}

export async function getAdminComments(params = '') {
  return getAdminCommentsService(parseParams(params));
}

export async function getAdminContacts(params = '') {
  return getAdminContactsService(parseParams(params));
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

export async function updateAdminContact(id, payload) {
  return updateAdminContactService(id, payload);
}

export async function deleteAdminUser(id) {
  return deleteAdminUserService(id);
}

export async function deleteAdminPost(id) {
  return deleteAdminPostService(id);
}

export async function deleteAdminComment(id) {
  return deleteAdminCommentService(id);
}

export async function deleteAdminContact(id) {
  return deleteAdminContactService(id);
}

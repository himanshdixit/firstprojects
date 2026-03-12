'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Pencil, Trash2, Upload } from 'lucide-react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import AdminPagination from './AdminPagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';
import { deleteAdminPost, updateAdminPost } from '@/lib/api';
import { getPostCover } from '@/lib/media';

const tableStyles = {
  rows: {
    style: {
      minHeight: '66px',
    },
  },
  headCells: {
    style: {
      fontWeight: 700,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
  },
};

function tagsToText(tags) {
  if (!Array.isArray(tags)) return '';
  return tags.join(', ');
}

function textToTags(text) {
  return text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function AdminPostsTable({ postsRequest }) {
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('all');
  const [deletingId, setDeletingId] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    status: 'draft',
    tags: '',
    content: '',
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [actionError, setActionError] = useState('');

  const loading = postsRequest.loading;
  const error = postsRequest.error;
  const posts = postsRequest.data?.data?.items || [];
  const pagination = postsRequest.data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const openEdit = (post) => {
    setPendingEdit(post);
    setEditForm({
      title: post.title || '',
      status: post.status || 'draft',
      tags: tagsToText(post.tags),
      content: post.content || '',
    });
    setCoverImageFile(null);
    setCoverPreview('');
  };

  useEffect(() => {
    if (!coverImageFile) {
      setCoverPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(coverImageFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImageFile]);

  const columns = useMemo(
    () => [
      {
        name: 'Post',
        grow: 2.2,
        cell: (row) => (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getPostCover(row)} alt={row.title} className="h-11 w-16 rounded-md object-cover" />
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{row.author?.name || 'Unknown'}</p>
            </div>
          </div>
        ),
      },
      {
        name: 'Status',
        width: '120px',
        cell: (row) => <span className="uppercase text-xs font-semibold">{row.status}</span>,
      },
      {
        name: 'Created',
        width: '140px',
        cell: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        name: 'Actions',
        width: '170px',
        right: true,
        cell: (row) => (
          <div className="flex gap-2">
            <Button variant="secondary" className="px-3 py-2" onClick={() => openEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              className="px-3 py-2"
              disabled={deletingId === row._id}
              onClick={() => setPendingDelete(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deletingId]
  );

  const applyFilters = () => {
    postsRequest.setFilters({ search: searchInput, status: statusInput });
    postsRequest.setPage(1);
  };

  const confirmDelete = async () => {
    if (!pendingDelete?._id) return;

    try {
      setActionError('');
      setDeletingId(pendingDelete._id);
      await deleteAdminPost(pendingDelete._id);
      setPendingDelete(null);
      await postsRequest.refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to delete post');
    } finally {
      setDeletingId('');
    }
  };

  const submitEdit = async () => {
    if (!pendingEdit?._id) return;

    try {
      setActionError('');
      setUpdatingId(pendingEdit._id);
      const payload = {
        title: editForm.title,
        status: editForm.status,
        tags: textToTags(editForm.tags),
        content: editForm.content,
      };

      let requestBody = payload;
      if (coverImageFile) {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('status', payload.status);
        formData.append('tags', JSON.stringify(payload.tags));
        formData.append('content', payload.content);
        formData.append('coverImageFile', coverImageFile);
        requestBody = formData;
      }

      await updateAdminPost(pendingEdit._id, requestBody);
      setPendingEdit(null);
      await postsRequest.refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to update post');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-3 h-56 w-full" />
      </Card>
    );
  }

  if (error) {
    return <Alert title="Failed to load posts" message={error} />;
  }

  return (
    <Card className="bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-900 dark:to-slate-900/80">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Posts</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search, filter, and moderate content</p>
        </div>

        <div className="grid w-full gap-3 md:grid-cols-3 lg:w-auto">
          <Input
            placeholder="Search title/content"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-w-[220px]"
          />
          <label className="block">
            <span className="sr-only">Status filter</span>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <Button variant="secondary" onClick={applyFilters}>Apply</Button>
        </div>
      </div>

      {actionError ? <div className="mt-3"><Alert title="Action failed" message={actionError} /></div> : null}

      <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 md:block">
        <DataTable
          columns={columns}
          data={posts}
          responsive
          highlightOnHover
          pointerOnHover
          dense
          customStyles={tableStyles}
          noDataComponent={<span className="py-6 text-sm text-slate-500">No posts found for this query.</span>}
        />
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {posts.length === 0 ? (
          <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No posts found for this query.
          </p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getPostCover(post)} alt={post.title} className="h-36 w-full rounded-lg object-cover" />
              <p className="mt-3 font-medium">{post.title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{post.author?.name || 'Unknown'} · {post.status}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => openEdit(post)}>
                  Edit
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => setPendingDelete(post)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminPagination pagination={pagination} onPageChange={(nextPage) => postsRequest.setPage(nextPage)} />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete post"
        description={`Delete \"${pendingDelete?.title || 'this post'}\" permanently? This action cannot be undone.`}
        confirmLabel="Delete post"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />

      <FormModal
        open={Boolean(pendingEdit)}
        title="Edit post"
        subtitle="Update content, media and publish state."
        confirmLabel="Save post"
        loading={Boolean(updatingId)}
        onConfirm={submitEdit}
        onClose={() => setPendingEdit(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Status</span>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <Input
            label="Tags (comma separated)"
            value={editForm.tags}
            onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))}
          />
        </div>
        <TextArea
          label="Content"
          rows={7}
          value={editForm.content}
          onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Cover file</span>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700">
            <Upload className="h-4 w-4" />
            <span className="truncate">{coverImageFile?.name || 'Upload image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
            />
          </label>
        </label>
        {pendingEdit ? (
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Cover preview</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview || getPostCover(pendingEdit)}
              alt="Post cover preview"
              className="h-40 w-full rounded-xl object-cover"
            />
          </div>
        ) : null}
      </FormModal>
    </Card>
  );
}

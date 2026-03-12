'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Pencil, Trash2, Upload } from 'lucide-react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import AdminPagination from './AdminPagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';
import { deleteAdminUser, updateAdminUser } from '@/lib/api';
import { getAvatar } from '@/lib/media';

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
      background: 'transparent',
    },
  },
};

export default function AdminUsersTable({ usersRequest }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deletingId, setDeletingId] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [actionError, setActionError] = useState('');

  const loading = usersRequest.loading;
  const error = usersRequest.error;
  const users = usersRequest.data?.data?.items || [];
  const pagination = usersRequest.data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const openEdit = (user) => {
    setPendingEdit(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
    });
    setAvatarFile(null);
    setAvatarPreview('');
  };

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const columns = useMemo(
    () => [
      {
        name: 'Photo',
        width: '90px',
        cell: (row) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getAvatar(row)} alt={row.name} className="h-9 w-9 rounded-full object-cover" />
        ),
      },
      {
        name: 'User',
        grow: 1.6,
        cell: (row) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
          </div>
        ),
      },
      {
        name: 'Role',
        width: '120px',
        cell: (row) => <span className="uppercase text-xs font-semibold">{row.role}</span>,
      },
      {
        name: 'Joined',
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

  const confirmDelete = async () => {
    if (!pendingDelete?._id) return;

    try {
      setActionError('');
      setDeletingId(pendingDelete._id);
      await deleteAdminUser(pendingDelete._id);
      setPendingDelete(null);
      await usersRequest.refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to delete user');
    } finally {
      setDeletingId('');
    }
  };

  const submitEdit = async () => {
    if (!pendingEdit?._id) return;

    try {
      setActionError('');
      setUpdatingId(pendingEdit._id);
      let payload = editForm;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('email', editForm.email);
        formData.append('role', editForm.role);
        formData.append('avatarFile', avatarFile);
        payload = formData;
      }

      await updateAdminUser(pendingEdit._id, payload);
      setPendingEdit(null);
      await usersRequest.refetch();
    } catch (err) {
      setActionError(err.message || 'Failed to update user');
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
    return <Alert title="Failed to load users" message={error} />;
  }

  return (
    <Card className="bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-900 dark:to-slate-900/80">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage platform members</p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[220px]"
          />
          <label className="block">
            <span className="sr-only">Role filter</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>
        </div>
      </div>

      {actionError ? <div className="mt-3"><Alert title="Action failed" message={actionError} /></div> : null}

      <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 md:block">
        <DataTable
          columns={columns}
          data={filteredUsers}
          responsive
          highlightOnHover
          pointerOnHover
          dense
          customStyles={tableStyles}
          noDataComponent={<span className="py-6 text-sm text-slate-500">No users match current filters.</span>}
        />
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {filteredUsers.length === 0 ? (
          <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No users match current filters.
          </p>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getAvatar(user)} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="uppercase">{user.role}</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => openEdit(user)}>
                  Edit
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => setPendingDelete(user)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminPagination pagination={pagination} onPageChange={(nextPage) => usersRequest.setPage(nextPage)} />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete user"
        description={`Delete ${pendingDelete?.name || 'this user'} and all authored posts? This action cannot be undone.`}
        confirmLabel="Delete user"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />

      <FormModal
        open={Boolean(pendingEdit)}
        title="Edit user"
        subtitle="Update profile fields and role."
        confirmLabel="Save user"
        loading={Boolean(updatingId)}
        onConfirm={submitEdit}
        onClose={() => setPendingEdit(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Role</span>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Avatar file</span>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700">
              <Upload className="h-4 w-4" />
              <span className="truncate">{avatarFile?.name || 'Upload image'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </label>
          </label>
          {pendingEdit ? (
            <div className="space-y-1.5">
              <span className="text-sm font-medium">Avatar preview</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarPreview || getAvatar(pendingEdit)}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </FormModal>
    </Card>
  );
}

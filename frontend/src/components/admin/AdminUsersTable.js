'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Pencil, Search, ShieldCheck, Trash2, Upload, Users } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import AdminPagination from './AdminPagination';
import { deleteAdminUser, updateAdminUser } from '@/lib/api';
import useToast from '@/hooks/useToast';
import { getAvatar } from '@/lib/media';

const tableStyles = {
  table: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  headRow: {
    style: {
      minHeight: '54px',
      backgroundColor: 'transparent',
      borderBottomColor: 'rgba(183, 146, 87, 0.18)',
    },
  },
  headCells: {
    style: {
      fontWeight: 700,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: '#8f6b33',
    },
  },
  rows: {
    style: {
      minHeight: '74px',
      backgroundColor: 'transparent',
      borderBottomColor: 'rgba(183, 146, 87, 0.12)',
    },
    highlightOnHoverStyle: {
      backgroundColor: 'rgba(214, 181, 126, 0.08)',
      transitionDuration: '160ms',
    },
  },
  cells: {
    style: {
      paddingTop: '12px',
      paddingBottom: '12px',
    },
  },
};

function SelectField({ value, onChange, options = [], srLabel }) {
  return (
    <label className="block">
      <span className="sr-only">{srLabel}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-[22px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,247,241,0.86))] px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(18,12,7,0.04),inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/55 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.82))] dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminUsersTable({ usersRequest }) {
  const toast = useToast();
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
  const adminCount = users.filter((item) => item.role === 'admin').length;

  const filteredUsers = useMemo(
    () =>
      users.filter((account) => {
        const matchesSearch =
          account.name?.toLowerCase().includes(search.toLowerCase()) ||
          account.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' ? true : account.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [roleFilter, search, users]
  );

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const openEdit = (account) => {
    setPendingEdit(account);
    setEditForm({
      name: account.name || '',
      email: account.email || '',
      role: account.role || 'user',
    });
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const columns = useMemo(
    () => [
      {
        name: 'Member',
        grow: 1.9,
        cell: (row) => (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getAvatar(row)} alt={row.name} className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-950 dark:text-white">{row.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        name: 'Role',
        width: '130px',
        cell: (row) => (
          <Badge variant={row.role === 'admin' ? 'brand' : 'default'} size="sm">
            {row.role}
          </Badge>
        ),
      },
      {
        name: 'Joined',
        width: '140px',
        cell: (row) => (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        name: 'Actions',
        width: '136px',
        right: true,
        cell: (row) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconOnly
              onClick={() => openEdit(row)}
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              iconOnly
              disabled={deletingId === row._id}
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete ${row.name}`}
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
      toast.success('User deleted', 'The account and related content were removed.');
    } catch (err) {
      setActionError(err.message || 'Failed to delete user');
      toast.error('Delete failed', err.message || 'Failed to delete user');
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
      toast.success('User updated', 'Account details were saved successfully.');
    } catch (err) {
      setActionError(err.message || 'Failed to update user');
      toast.error('Update failed', err.message || 'Failed to update user');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return (
      <Card variant="dashboard" hover={false}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </Card>
    );
  }

  if (error) {
    return <Alert title="Failed to load users" message={error} />;
  }

  return (
    <Card variant="dashboard" hover={false} className="overflow-hidden">
      <Card.Header className="flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" size="sm">
              Admin only
            </Badge>
            <Badge variant="default" size="sm">
              {pagination.total} total users
            </Badge>
            <Badge variant="muted" size="sm">
              {adminCount} admins on this page
            </Badge>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
            User management
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control member access, roles, and profile data from one place.
          </p>
        </div>

        <div className="grid w-full gap-3 md:grid-cols-[minmax(0,1fr)_210px] 2xl:w-auto 2xl:min-w-[560px]">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={<Search className="h-4 w-4" />}
          />
          <SelectField
            srLabel="Filter users by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All roles' },
              { value: 'admin', label: 'Admins' },
              { value: 'user', label: 'Users' },
            ]}
          />
        </div>
      </Card.Header>

      {actionError ? (
        <div className="mt-4">
          <Alert title="Action failed" message={actionError} />
        </div>
      ) : null}

      <div className="mt-6 hidden overflow-hidden rounded-[30px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.82),rgba(250,245,236,0.66))] shadow-[0_22px_56px_rgba(18,12,7,0.06),inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.82),rgba(11,9,7,0.7))] md:block">
        <DataTable
          columns={columns}
          data={filteredUsers}
          responsive
          highlightOnHover
          pointerOnHover
          customStyles={tableStyles}
          noDataComponent={
            <span className="py-8 text-sm text-slate-500 dark:text-slate-400">
              No users match the current search and role filters.
            </span>
          }
        />
      </div>

      <div className="mt-5 space-y-3 md:hidden">
        {filteredUsers.length === 0 ? (
          <p className="rounded-[22px] border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No users match the current search and role filters.
          </p>
        ) : (
          filteredUsers.map((account) => (
            <div
              key={account._id}
              className="rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.92),rgba(249,243,233,0.8))] p-4 shadow-[0_18px_44px_rgba(18,12,7,0.06)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.82),rgba(11,9,7,0.72))]"
            >
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatar(account)}
                  alt={account.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-950 dark:text-white">
                    {account.name}
                  </p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {account.email}
                  </p>
                </div>
                <Badge variant={account.role === 'admin' ? 'brand' : 'default'} size="sm">
                  {account.role}
                </Badge>
              </div>

              <div className="mt-4 rounded-[22px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(250,245,236,0.62))] px-3 py-2 text-xs font-medium text-slate-500 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.72),rgba(11,9,7,0.6))] dark:text-slate-400">
                Joined {new Date(account.createdAt).toLocaleDateString()}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" fullWidth onClick={() => openEdit(account)}>
                    Edit
                </Button>
                <Button variant="danger" size="sm" fullWidth onClick={() => setPendingDelete(account)}>
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
        subtitle="Update member profile fields, avatar, and role permissions."
        confirmLabel="Save user"
        loading={Boolean(updatingId)}
        onConfirm={submitEdit}
        onClose={() => setPendingEdit(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <div className="space-y-1.5">
            <span className="text-[0.8rem] font-semibold tracking-[-0.01em] text-slate-700 dark:text-slate-200">
              Role
            </span>
            <SelectField
              srLabel="Select role"
              value={editForm.role}
              onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[0.8rem] font-semibold tracking-[-0.01em] text-slate-700 dark:text-slate-200">
              Avatar file
            </span>
            <label className="flex cursor-pointer items-center gap-2 rounded-[24px] border border-dashed border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,245,236,0.7))] px-4 py-3 text-sm text-slate-600 transition hover:border-amber-300 hover:shadow-[0_14px_30px_rgba(18,12,7,0.05)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.72),rgba(11,9,7,0.6))] dark:text-slate-300">
              <Upload className="h-4 w-4" />
              <span className="truncate">{avatarFile?.name || 'Upload avatar image'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        {pendingEdit ? (
          <div className="rounded-[26px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,245,236,0.68))] p-4 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.76),rgba(11,9,7,0.62))]">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarPreview || getAvatar(pendingEdit)}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  <p className="font-medium text-slate-950 dark:text-white">Profile preview</p>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Uploading a new file replaces the stored avatar for this account.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </FormModal>
    </Card>
  );
}

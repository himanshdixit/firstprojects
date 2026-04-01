'use client';

import React, { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Inbox, Mail, Pencil, Search, Trash2 } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import TextArea from '@/components/ui/TextArea';
import AdminPagination from './AdminPagination';
import { deleteAdminContact, updateAdminContact } from '@/lib/api';
import useToast from '@/hooks/useToast';

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
      minHeight: '90px',
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

function truncateText(text, max = 90) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function ContactStatusBadge({ status }) {
  const normalized = status || 'new';
  const variant =
    normalized === 'resolved' ? 'success' : normalized === 'in_progress' ? 'warning' : 'brand';

  return (
    <Badge variant={variant} size="sm">
      {normalized.replace('_', ' ')}
    </Badge>
  );
}

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

export default function AdminContactsTable({ contactsRequest }) {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('all');
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [pendingEdit, setPendingEdit] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    status: 'new',
    notes: '',
  });

  const loading = contactsRequest.loading;
  const error = contactsRequest.error;
  const contacts = contactsRequest.data?.data?.items || [];
  const pagination = contactsRequest.data?.data?.pagination || { page: 1, pages: 1, total: 0 };
  const resolvedCount = contacts.filter((contact) => contact.status === 'resolved').length;

  const openEdit = (contact) => {
    setPendingEdit(contact);
    setEditForm({
      name: contact.name || '',
      email: contact.email || '',
      subject: contact.subject || '',
      message: contact.message || '',
      status: contact.status || 'new',
      notes: contact.notes || '',
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'Sender',
        grow: 1.3,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-950 dark:text-white">{row.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
          </div>
        ),
      },
      {
        name: 'Subject',
        grow: 1.7,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-950 dark:text-white">{row.subject}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{truncateText(row.message, 76)}</p>
          </div>
        ),
      },
      {
        name: 'Status',
        width: '140px',
        cell: (row) => <ContactStatusBadge status={row.status} />,
      },
      {
        name: 'Received',
        width: '170px',
        cell: (row) => (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(row.createdAt).toLocaleString()}
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
              aria-label={`Edit contact from ${row.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              iconOnly
              disabled={deletingId === row._id}
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete contact from ${row.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deletingId]
  );

  function applyFilters() {
    contactsRequest.setFilters({
      search: searchInput,
      status: statusInput,
    });
    contactsRequest.setPage(1);
  }

  async function submitEdit() {
    if (!pendingEdit?._id) return;

    try {
      setActionError('');
      setUpdatingId(pendingEdit._id);
      await updateAdminContact(pendingEdit._id, editForm);
      setPendingEdit(null);
      await contactsRequest.refetch();
      toast.success('Contact updated', 'The inbox item was updated successfully.');
    } catch (err) {
      setActionError(err.message || 'Failed to update contact');
      toast.error('Update failed', err.message || 'Failed to update contact');
    } finally {
      setUpdatingId('');
    }
  }

  async function confirmDelete() {
    if (!pendingDelete?._id) return;

    try {
      setActionError('');
      setDeletingId(pendingDelete._id);
      await deleteAdminContact(pendingDelete._id);
      setPendingDelete(null);
      await contactsRequest.refetch();
      toast.success('Contact deleted', 'The inbox item was removed successfully.');
    } catch (err) {
      setActionError(err.message || 'Failed to delete contact');
      toast.error('Delete failed', err.message || 'Failed to delete contact');
    } finally {
      setDeletingId('');
    }
  }

  if (loading) {
    return (
      <Card variant="dashboard" hover={false}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </Card>
    );
  }

  if (error) {
    return <Alert title="Failed to load contacts" message={error} />;
  }

  return (
    <Card variant="dashboard" hover={false} className="overflow-hidden">
      <Card.Header className="flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" size="sm">
              Contact inbox
            </Badge>
            <Badge variant="default" size="sm">
              {pagination.total} total submissions
            </Badge>
            <Badge variant="success" size="sm">
              {resolvedCount} resolved on this page
            </Badge>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">Contact management</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review incoming inquiries, update status, add notes, and keep the contact pipeline organized.
          </p>
        </div>

        <div className="grid w-full gap-3 md:grid-cols-2 2xl:w-auto 2xl:min-w-[780px] 2xl:grid-cols-[minmax(0,1fr)_220px_140px]">
          <Input
            placeholder="Search sender, subject, or message"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            startAdornment={<Search className="h-4 w-4" />}
          />
          <SelectField
            srLabel="Filter contacts by status"
            value={statusInput}
            onChange={(event) => setStatusInput(event.target.value)}
            options={[
              { value: 'all', label: 'All status' },
              { value: 'new', label: 'New' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'resolved', label: 'Resolved' },
            ]}
          />
          <Button variant="secondary" className="w-full 2xl:w-auto" onClick={applyFilters}>
            Apply
          </Button>
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
          data={contacts}
          responsive
          highlightOnHover
          pointerOnHover
          customStyles={tableStyles}
          noDataComponent={(
            <span className="py-8 text-sm text-slate-500 dark:text-slate-400">
              No contact submissions match the current filters.
            </span>
          )}
        />
      </div>

      <div className="mt-5 space-y-3 md:hidden">
        {contacts.length === 0 ? (
          <p className="rounded-[22px] border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No contact submissions match the current filters.
          </p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact._id}
              className="rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.92),rgba(249,243,233,0.8))] p-4 shadow-[0_18px_44px_rgba(18,12,7,0.06)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.82),rgba(11,9,7,0.72))]"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/85 p-3 text-amber-700 dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-amber-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-950 dark:text-white">{contact.name}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{contact.email}</p>
                  <p className="mt-2 font-medium text-slate-900 dark:text-white">{contact.subject}</p>
                </div>
                <ContactStatusBadge status={contact.status} />
              </div>

              <p className="mt-4 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(250,245,236,0.62))] px-3 py-3 text-sm leading-6 text-slate-600 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.72),rgba(11,9,7,0.6))] dark:text-slate-300">
                {contact.message}
              </p>

              {contact.notes ? (
                <p className="mt-3 rounded-[22px] border border-dashed border-amber-200/80 px-3 py-3 text-sm text-slate-500 dark:border-amber-300/10 dark:text-slate-400">
                  Admin notes: {contact.notes}
                </p>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" fullWidth onClick={() => openEdit(contact)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" fullWidth onClick={() => setPendingDelete(contact)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminPagination pagination={pagination} onPageChange={(nextPage) => contactsRequest.setPage(nextPage)} />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete contact submission"
        description={`Delete the contact submission from ${pendingDelete?.name || 'this sender'}? This action cannot be undone.`}
        confirmLabel="Delete submission"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />

      <FormModal
        open={Boolean(pendingEdit)}
        title="Edit contact submission"
        subtitle="Update inbox status, sender details, message content, or internal notes."
        size="lg"
        confirmLabel="Save changes"
        loading={Boolean(updatingId)}
        onConfirm={submitEdit}
        onClose={() => setPendingEdit(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>

        <Input
          label="Subject"
          value={editForm.subject}
          onChange={(event) => setEditForm((prev) => ({ ...prev, subject: event.target.value }))}
        />

        <div className="space-y-1.5">
          <span className="text-[0.8rem] font-semibold tracking-[-0.01em] text-slate-700 dark:text-slate-200">
            Status
          </span>
          <SelectField
            srLabel="Select contact status"
            value={editForm.status}
            onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
            options={[
              { value: 'new', label: 'New' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'resolved', label: 'Resolved' },
            ]}
          />
        </div>

        <TextArea
          label="Message"
          value={editForm.message}
          onChange={(event) => setEditForm((prev) => ({ ...prev, message: event.target.value }))}
          className="min-h-[180px]"
        />

        <TextArea
          label="Admin notes"
          helperText="Internal notes for follow-up and resolution context."
          value={editForm.notes}
          onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
          className="min-h-[120px]"
        />
      </FormModal>
    </Card>
  );
}

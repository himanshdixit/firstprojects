'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useAuth from '@/hooks/useAuth';
import { getAvatar } from '@/lib/media';

export default function ProfileCard() {
  const { user, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <Card className="max-w-xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-2 h-4 w-40" />
      </Card>
    );
  }

  if (!user) {
    return <Alert title="Unauthorized" message="Please login to view profile." />;
  }

  const avatar = getAvatar(user);

  const startEdit = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setError('');
    setIsEditing(true);
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

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      let payload = {
        name: form.name,
        email: form.email,
      };

      if (avatarFile) {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('avatar', avatarFile);
        payload = formData;
      }

      await updateProfile(payload);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar} alt={user?.name} className="h-20 w-20 rounded-2xl object-cover" />
      {isEditing ? (
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Upload avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Avatar preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarPreview || avatar} alt="Avatar preview" className="h-20 w-20 rounded-2xl object-cover" />
          </div>
          {error ? <Alert title="Update failed" message={error} /> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">{user?.name}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{user?.email}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Role: {user?.role}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
          </p>
          <div className="mt-4">
            <Button type="button" onClick={startEdit}>Edit profile</Button>
          </div>
        </>
      )}
    </Card>
  );
}

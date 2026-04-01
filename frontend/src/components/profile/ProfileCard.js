'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
import Card from '@/components/ui/Card';
import Skeleton, { SkeletonAvatar } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { appConfig } from '@/lib/config/appConfig';
import { getAvatar } from '@/lib/media';

export default function ProfileCard() {
  const { user, loading, updateProfile } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  if (loading) {
    return (
      <Card className="max-w-3xl" hover={false}>
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="lg" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-3 h-4 w-64" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
        </div>
      </Card>
    );
  }

  if (!user) {
    return <Alert title="Unauthorized" message="Please login to view profile." />;
  }

  const avatar = getAvatar(user);
  const shareUrl = appConfig.siteUrl;
  const shareText = `${user?.name || 'A DraftSphere author'} writes on DraftSphere`;
  const socialLinks = [
    {
      label: 'Email',
      href: `mailto:${encodeURIComponent(user?.email || 'hello@draftsphere.studio')}`,
      icon: Mail,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      icon: Twitter,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: Linkedin,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: Instagram,
    },
  ];

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

  const stopEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview('');
    setError('');
  };

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
      stopEdit();
      toast.success('Profile updated', 'Your account details were saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      toast.error('Profile update failed', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-3xl border border-white/60 bg-white/88 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/88 sm:p-7" hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-[24px]">
            <Image src={avatar} alt={user?.name} fill sizes="80px" className="object-cover" />
          </div>
          {!isEditing ? (
            <div>
              <p className="eyebrow">Author Profile</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{user?.name}</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{user?.email}</p>
            </div>
          ) : null}
        </div>
        {!isEditing ? (
          <div className="rounded-full border border-slate-200/80 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-300">
            {user?.role}
          </div>
        ) : null}
      </div>

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
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar preview" className="h-20 w-20 rounded-[24px] object-cover" />
            ) : (
              <div className="relative h-20 w-20 overflow-hidden rounded-[24px]">
                <Image src={avatar} alt="Avatar preview" fill sizes="80px" className="object-cover" />
              </div>
            )}
          </div>
          {error ? <Alert title="Update failed" message={error} /> : null}
          <div className="flex gap-2">
            <Button type="submit" loading={saving} loadingLabel="Saving profile">
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={stopEdit} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
          </p>
          <div className="mt-5 rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.9),rgba(249,243,233,0.8))] p-4 shadow-[0_18px_42px_rgba(18,12,7,0.06)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.86),rgba(10,8,6,0.8))]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Social Presence</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Share your DraftSphere presence or reach out through your preferred channel.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.label}
                      as="a"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      variant="secondary"
                      size="sm"
                      leftIcon={<Icon className="h-4 w-4" />}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button type="button" onClick={startEdit}>Edit profile</Button>
          </div>
        </>
      )}
    </Card>
  );
}

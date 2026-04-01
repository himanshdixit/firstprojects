'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { loginSchema, registerSchema } from '@/validators/forms';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';

export default function AuthForm({ mode = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const { login, register: signup } = useAuth();
  const toast = useToast();

  const isRegister = mode === 'register';
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const schema = isRegister ? registerSchema : loginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setError('');
      const payload = isRegister
        ? (() => {
            if (!avatarFile) {
              return {
                name: values.name,
                email: values.email,
                password: values.password,
              };
            }

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('password', values.password);
            formData.append('avatar', avatarFile);
            return formData;
          })()
        : {
            email: values.email,
            password: values.password,
          };

      if (isRegister) {
        await signup(payload);
        toast.success('Account created', 'Your profile is ready and you can start publishing.');
      } else {
        await login(payload);
        toast.success('Welcome back', 'You are now signed in.');
      }

      const next = searchParams.get('next') || '/';
      router.push(next);
    } catch (err) {
      setError(err.message || 'Authentication failed');
      toast.error('Authentication failed', err.message || 'Please check your details and try again.');
    }
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

  return (
    <Card className="mx-auto max-w-xl border border-amber-100/70 bg-[rgba(255,252,247,0.9)] p-6 shadow-[0_24px_64px_rgba(18,12,7,0.1)] dark:border-amber-300/10 dark:bg-[rgba(12,10,8,0.92)] sm:p-7" hover={false}>
      <div className="flex items-center gap-3">
        <span className="relative h-12 w-12 overflow-hidden rounded-2xl">
          <Image src="/draftsphere-logo.png" alt="DraftSphere logo" fill sizes="48px" className="object-contain" />
        </span>
        <div>
          <p className="font-display text-[1.95rem] leading-none text-slate-900 dark:text-white">DraftSphere</p>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">Private Editorial Access</p>
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{isRegister ? 'Create account' : 'Welcome back'}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {isRegister ? 'Register to start writing posts.' : 'Log in to continue.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {isRegister ? <Input label="Name" placeholder="Your name" {...register('name')} error={errors.name?.message} /> : null}

        <Input label="Email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />

        <Input
          label="Password"
          type="password"
          placeholder="********"
          {...register('password')}
          error={errors.password?.message}
        />

        {isRegister ? (
          <Input
            label="Confirm password"
            type="password"
            placeholder="********"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        ) : null}

        {isRegister ? (
          <Input
            label="Avatar image"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
        ) : null}
        {isRegister && avatarPreview ? (
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Avatar preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarPreview} alt="Avatar preview" className="h-20 w-20 rounded-2xl object-cover" />
          </div>
        ) : null}

        {error ? <Alert title="Request failed" message={error} /> : null}

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          loadingLabel={isRegister ? 'Creating account' : 'Signing in'}
        >
          {isRegister ? 'Register' : 'Login'}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            href={isRegister ? '/login' : '/register'}
            className="font-semibold text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
          >
            {isRegister ? 'Login' : 'Create one'}
          </Link>
        </p>
      </form>
    </Card>
  );
}

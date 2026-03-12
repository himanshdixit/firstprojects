'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '@/validators/forms';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import useAuth from '@/hooks/useAuth';

export default function AuthForm({ mode = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const { login, register: signup } = useAuth();

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
      } else {
        await login(payload);
      }

      const next = searchParams.get('next') || '/';
      router.push(next);
    } catch (err) {
      setError(err.message || 'Authentication failed');
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
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">{isRegister ? 'Create account' : 'Welcome back'}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
        </Button>
      </form>
    </Card>
  );
}

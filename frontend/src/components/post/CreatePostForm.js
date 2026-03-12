'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema } from '@/validators/forms';
import { createPost } from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function CreatePostForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
      status: 'draft',
    },
  });

  const onSubmit = async (values) => {
    try {
      setServerError('');
      const payload = {
        title: values.title,
        content: values.content,
        status: values.status,
        tags: values.tags
          ? values.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      let requestBody = payload;
      if (coverImageFile) {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('content', payload.content);
        formData.append('status', payload.status);
        formData.append('tags', JSON.stringify(payload.tags));
        formData.append('coverImageFile', coverImageFile);
        requestBody = formData;
      }

      const response = await createPost(requestBody);
      const createdPost = response?.data?.post;
      router.push(createdPost?.slug ? `/posts/${createdPost.slug}` : '/');
    } catch (err) {
      setServerError(err.message || 'Could not create post');
    }
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

  return (
    <Card className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Create a post</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Draft now, publish when ready.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Title" placeholder="Post title" {...register('title')} error={errors.title?.message} />

        <TextArea
          label="Content"
          placeholder="Write rich text HTML or plain content"
          rows={10}
          {...register('content')}
          error={errors.content?.message}
        />

        <Input
          label="Upload cover image"
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
        />
        {coverPreview ? (
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cover preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt="Cover preview" className="h-44 w-full rounded-xl object-cover" />
          </div>
        ) : null}

        <Input
          label="Tags"
          placeholder="nextjs, mern, mongodb"
          {...register('tags')}
          error={errors.tags?.message}
        />

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Status</span>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            {...register('status')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        {serverError ? <Alert title="Failed to create post" message={serverError} /> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </Button>
      </form>
    </Card>
  );
}

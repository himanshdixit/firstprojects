'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock3, Globe2, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { postSchema } from '@/validators/forms';
import { createPost } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import useToast from '@/hooks/useToast';
import useComposerDraft from '@/hooks/useComposerDraft';
import { calculateReadingTime } from '@/lib/readingTime';

const DEFAULT_VALUES = {
  title: '',
  content: '',
  tags: '',
  category: '',
  status: 'draft',
};

export default function CreatePostForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [didRestoreDraft, setDidRestoreDraft] = useState(false);
  const toast = useToast();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const formValues = watch();
  const publishState = formValues.status;
  const readingStats = useMemo(
    () => calculateReadingTime(formValues.content || ''),
    [formValues.content]
  );
  const localDraft = useComposerDraft('post-composer', formValues);

  useEffect(() => {
    if (localDraft.hasRestoredDraft) {
      return;
    }

    if (localDraft.restoredValue) {
      reset({
        ...DEFAULT_VALUES,
        ...localDraft.restoredValue,
      });
      setDidRestoreDraft(true);
    }

    localDraft.confirmRestored();
  }, [localDraft, reset]);

  const onSubmit = async (values) => {
    try {
      setServerError('');
      const payload = {
        title: values.title,
        content: values.content,
        status: values.status,
        category: values.category?.trim() || '',
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
        formData.append('category', payload.category);
        formData.append('tags', JSON.stringify(payload.tags));
        formData.append('coverImageFile', coverImageFile);
        requestBody = formData;
      }

      const response = await createPost(requestBody);
      const createdPost = response?.data?.post;
      localDraft.clearDraft();
      toast.success(
        payload.status === 'published' ? 'Post published' : 'Draft saved',
        createdPost?.title || 'Your story has been saved successfully.'
      );
      router.push(createdPost?.slug ? `/posts/${createdPost.slug}` : '/');
    } catch (err) {
      setServerError(err.message || 'Could not create post');
      toast.error('Post creation failed', err.message || 'Could not create post');
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

  const lastSavedLabel = localDraft.savedAt
    ? new Date(localDraft.savedAt).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  function handleDiscardLocalDraft() {
    localDraft.clearDraft();
    setDidRestoreDraft(false);
    reset(DEFAULT_VALUES);
    setCoverImageFile(null);
    setServerError('');
    toast.success('Local draft cleared', 'The recovered draft was removed from this browser.');
  }

  return (
    <Card className="mx-auto max-w-4xl border border-white/60 bg-white/88 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/88 sm:p-7" hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Editor</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create a post</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Draft now, publish when ready.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" size="sm">
            Author Workspace
          </Badge>
          <Badge
            variant={publishState === 'published' ? 'success' : 'warning'}
            size="sm"
            icon={
              publishState === 'published' ? <Globe2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />
            }
          >
            {publishState === 'published' ? 'Publish mode' : 'Draft mode'}
          </Badge>
          <Badge variant="outline" size="sm" icon={<Sparkles className="h-3.5 w-3.5" />}>
            {readingStats.label}
          </Badge>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {didRestoreDraft ? (
          <Alert
            variant="info"
            title="Recovered a local draft"
            message={`We restored your unfinished story from this browser${lastSavedLabel ? `, last saved at ${lastSavedLabel}` : ''}.`}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={handleDiscardLocalDraft}
              >
                Discard local draft
              </Button>
            }
          />
        ) : null}

        {!didRestoreDraft && lastSavedLabel ? (
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <RotateCcw className="h-3.5 w-3.5" />
            Autosaved locally at {lastSavedLabel}
          </div>
        ) : null}

        <Input label="Title" placeholder="Post title" {...register('title')} error={errors.title?.message} />

        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <RichTextEditor
              label="Content"
              value={field.value}
              onChange={field.onChange}
              error={errors.content?.message}
              helperText="Use headings, lists, quotes, code blocks, and links for a polished post body."
              placeholder="Tell the story behind your post..."
              minHeightClass="min-h-[320px]"
            />
          )}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Category"
            placeholder="engineering, product, growth"
            helperText="Used in feed filters and related-post discovery."
            {...register('category')}
            error={errors.category?.message}
          />

          <Input
            label="Tags"
            placeholder="nextjs, mern, mongodb"
            helperText="Comma-separated topic tags."
            {...register('tags')}
            error={errors.tags?.message}
          />
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Status</span>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            {...register('status')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drafts stay private. Published posts appear in the public feed and related-story recommendations.
          </p>
        </label>

        {serverError ? <Alert title="Failed to create post" message={serverError} /> : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel={publishState === 'published' ? 'Publishing post' : 'Saving draft'}
          >
            {publishState === 'published' ? 'Publish Post' : 'Save Draft'}
          </Button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {readingStats.words > 0
              ? `${readingStats.words} words prepared for ${publishState === 'published' ? 'publication' : 'draft review'}.`
              : "Start writing and we'll estimate reading time automatically."}
          </p>
        </div>
      </form>
    </Card>
  );
}

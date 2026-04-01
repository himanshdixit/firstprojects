'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Inbox,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Send,
  Sparkles,
} from 'lucide-react';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import useToast from '@/hooks/useToast';
import { CONTACT_VISUAL } from '@/lib/siteImages';
import { getBrandBlurDataUrl } from '@/lib/imagePlaceholders';
import { createContact } from '@/lib/api';
import { contactSchema } from '@/validators/forms';

const contactCards = [
  {
    title: 'Editorial inbox',
    description: 'Send project inquiries, collaboration ideas, and publishing conversations into the team inbox.',
    value: 'Stored securely in the admin inbox',
    icon: Inbox,
  },
  {
    title: 'Response rhythm',
    description: 'We keep the experience premium by replying with care, not canned templates.',
    value: 'Usually within 24 hours',
    icon: Clock3,
  },
  {
    title: 'Studio location',
    description: 'Remote-first publishing product with a luxury editorial mindset.',
    value: 'Global / Remote',
    icon: MapPin,
  },
];

export default function ContactExperience() {
  const toast = useToast();
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values) {
    try {
      setSubmitError('');
      await createContact(values);
      reset();
      setNotice({
        variant: 'success',
        title: 'Message sent successfully',
        message: 'Your inquiry is now stored in the DraftSphere contact inbox and ready for admin review.',
      });
      toast.success('Message sent', 'Your inquiry is now stored in the DraftSphere contact inbox.');
    } catch (error) {
      const message = error?.message || 'We could not send your message right now.';
      setSubmitError(message);
      setNotice({
        variant: 'error',
        title: 'Submission failed',
        message,
      });
      toast.error('Submission failed', message);
    }
  }

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {notice ? (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-x-4 top-24 z-[115] mx-auto w-full max-w-xl"
          >
            <div
              className={`rounded-[28px] border p-4 shadow-[0_24px_56px_rgba(18,12,7,0.18)] backdrop-blur-xl sm:p-5 ${
                notice.variant === 'success'
                  ? 'border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(249,243,233,0.95))] text-slate-900 dark:border-amber-300/20 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.98),rgba(10,8,6,0.96))] dark:text-white'
                  : 'border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,250,250,0.98),rgba(255,242,244,0.95))] text-slate-900 dark:border-rose-500/25 dark:bg-[linear-gradient(180deg,rgba(28,12,16,0.98),rgba(18,8,10,0.96))] dark:text-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-full p-2 ${
                    notice.variant === 'success'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                  }`}
                >
                  {notice.variant === 'success' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold sm:text-base">{notice.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {notice.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:bg-black/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Section
        eyebrow="Contact"
        title="Reach out through a premium editorial contact experience"
        description="Whether you want to discuss product direction, content strategy, or collaboration, the contact flow should feel as intentional as the rest of the platform."
        size="wide"
      >
        <Grid cols="split" gap="lg" className="items-start">
          <div className="space-y-4">
            <div className="relative min-h-[26rem] overflow-hidden rounded-[32px] border border-white/60 shadow-[0_28px_64px_rgba(18,12,7,0.14)]">
              <Image
                src={CONTACT_VISUAL.image}
                alt={CONTACT_VISUAL.alt}
                fill
                priority
                quality={72}
                placeholder="blur"
                blurDataURL={getBrandBlurDataUrl('light')}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,5,0.18),rgba(8,6,5,0.46))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100 backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  DraftSphere Studio
                </div>
                <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">
                  Start a thoughtful conversation with the team
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/86 sm:text-base">
                  We designed this space to feel calm, premium, and clear. The contact experience follows the same principle.
                </p>
              </div>
            </div>

            <Grid cols="triple" gap="sm" className="lg:grid-cols-1 xl:grid-cols-1">
              {contactCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} variant="blog" className="p-5" hover={false}>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-amber-200/70 bg-amber-50/85 p-3 text-amber-700 dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-amber-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                        <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300">{item.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </Grid>
          </div>

          <Card variant="elevated" className="p-6 sm:p-7" hover={false}>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/85 p-3 text-amber-700 dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-amber-300">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <p className="eyebrow">Message Draft</p>
                <h2 className="mt-3 text-[2.2rem] leading-tight">Compose your inquiry</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Your message is validated, stored securely in the backend, and surfaced to administrators in the DraftSphere control room.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Grid cols="split" gap="sm" className="items-start">
                <Input
                  id="contact-name"
                  label="Your name"
                  placeholder="Alex Morgan"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  id="contact-email"
                  label="Your email"
                  type="email"
                  placeholder="alex@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </Grid>

              <Input
                id="contact-subject"
                label="Subject"
                placeholder="Publishing collaboration"
                error={errors.subject?.message}
                {...register('subject')}
              />

              <TextArea
                id="contact-message"
                label="Message"
                placeholder="Tell us about your idea, product, or publishing need."
                error={errors.message?.message}
                {...register('message')}
                className="min-h-[170px]"
              />

              {submitError ? <Alert title="Unable to send message" message={submitError} /> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 rounded-[24px] border border-amber-200/70 bg-white/78 px-4 py-3 text-sm text-slate-600 shadow-[0_12px_30px_rgba(18,12,7,0.04)] dark:border-amber-300/10 dark:bg-[#120f0c]/75 dark:text-slate-300">
                  <PhoneCall className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  Prefer direct email? Use <span className="font-semibold text-slate-900 dark:text-white">hello@draftsphere.studio</span>
                </div>
                <Button
                  type="submit"
                  rightIcon={<Send className="h-4 w-4" />}
                  loading={isSubmitting}
                  loadingLabel="Sending message"
                >
                  Send message
                </Button>
              </div>
            </form>
          </Card>
        </Grid>
      </Section>
    </div>
  );
}

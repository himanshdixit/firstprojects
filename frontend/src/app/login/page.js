import AuthForm from '@/components/auth/AuthForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

export default function LoginPage() {
  return (
    <AuthSplitLayout
      eyebrow="Access"
      title="Sign in to your editorial workspace"
      description="Pick up your drafts, manage your profile, and continue reading or publishing with a focused product-style experience."
    >
      <AuthForm mode="login" />
    </AuthSplitLayout>
  );
}

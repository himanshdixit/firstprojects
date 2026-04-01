import AuthForm from '@/components/auth/AuthForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      eyebrow="Join"
      title="Create your publishing account"
      description="Set up your author profile, personalize your workspace, and start writing in a clean, modern blogging environment."
    >
      <AuthForm mode="register" />
    </AuthSplitLayout>
  );
}

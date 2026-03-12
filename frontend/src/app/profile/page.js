import ProfileCard from '@/components/profile/ProfileCard';
import { requireAuth } from '@/lib/routeProtection';

export default function ProfilePage() {
  requireAuth('/profile');
  return <ProfileCard />;
}

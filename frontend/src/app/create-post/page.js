import CreatePostForm from '@/components/post/CreatePostForm';
import { requireAuth } from '@/lib/routeProtection';

export default function CreatePostPage() {
  requireAuth('/create-post');
  return <CreatePostForm />;
}

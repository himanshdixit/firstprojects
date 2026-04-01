import AdminOverview from '@/components/admin/AdminOverview';
import Container from '@/components/ui/Container';
import { requireAdmin } from '@/lib/routeProtection';

export default function AdminDashboardPage() {
  requireAdmin('/admin');

  return (
    <section className="pb-8 pt-2 sm:pb-10">
      <Container size="wide">
        <AdminOverview />
      </Container>
    </section>
  );
}

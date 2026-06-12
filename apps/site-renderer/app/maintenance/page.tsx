import { MaintenancePage } from '@/components/MaintenancePage';
import { getTenantContext } from '@/lib/tenant-context';

export default async function MaintenanceRoutePage() {
  const tenant = await getTenantContext();

  return <MaintenancePage siteName={tenant?.siteName ?? 'This site'} />;
}

import CustomerAccountShell from '../../components/CustomerAccountShell';
import ProfilePanel from '../../components/ProfilePanel';

export default function CustomerProfile() {
  return (
    <CustomerAccountShell
      title="Personal Information"
      description="Manage your profile details and contact information."
    >
      <ProfilePanel />
    </CustomerAccountShell>
  );
}

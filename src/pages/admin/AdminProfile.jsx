import ProfilePanel from '../../components/ProfilePanel';

export default function AdminProfile() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and account details.</p>
      </div>
      <ProfilePanel />
    </div>
  );
}

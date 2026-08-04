import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function BuyerProfile() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const onSubmit = async (data) => {
    try {
      await api.put('/auth/profile', data);
      await refreshProfile();
      showToast('Profile updated');
    } catch {
      showToast('Update failed', 'error');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profile Settings</h1>
      <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name')} />
          <Input label="Email" value={user?.email} disabled />
          <Input label="Phone" {...register('phone')} />
          <Input label="Role" value={user?.role} disabled />
          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}

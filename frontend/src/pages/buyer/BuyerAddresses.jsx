import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function BuyerAddresses() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/addresses').then((r) => r.data.addresses),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/users/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      reset();
      showToast('Address added');
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Saved Addresses</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {addresses?.map((addr) => (
            <div key={addr._id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{addr.label}</span>
                {addr.isDefault && <span className="rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700">Default</span>}
              </div>
              <p className="text-sm text-gray-600">
                {addr.fullName}<br />{addr.street}<br />{addr.city}, {addr.state} {addr.zipCode}<br />{addr.phone}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Add New Address</h2>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-3">
            <Input label="Label" {...register('label')} placeholder="Home, Office..." />
            <Input label="Full Name" {...register('fullName', { required: true })} />
            <Input label="Phone" {...register('phone', { required: true })} />
            <Input label="Street" {...register('street', { required: true })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" {...register('city', { required: true })} />
              <Input label="State" {...register('state', { required: true })} />
            </div>
            <Input label="PIN Code" {...register('zipCode', { required: true })} />
            <Button type="submit" loading={createMutation.isPending}>Add Address</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

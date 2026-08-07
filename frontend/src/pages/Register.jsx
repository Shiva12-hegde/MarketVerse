import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: searchParams.get('role') || 'buyer' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser(data);
      if (user) {
        showToast('Account created successfully!');
        const redirectPath = searchParams.get('redirect') || (user.role === 'supplier' ? '/supplier' : '/buyer');
        navigate(redirectPath);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Create account</h1>
        <p className="mb-6 text-sm text-gray-500">Join MarketVerse as a buyer or supplier</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
          <Input label="Phone" {...register('phone')} />
          <Input
            label="Password"
            type="password"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            error={errors.password?.message}
          />
          <Select label="I want to" {...register('role')}>
            <option value="buyer">Buy products</option>
            <option value="supplier">Sell products (Supplier)</option>
          </Select>
          <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

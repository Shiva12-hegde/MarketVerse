import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (user) {
        showToast(`Welcome back, ${user.name}!`);
        const redirectPath = searchParams.get('redirect') || searchParams.get('from') || (user.role === 'supplier' ? '/supplier' : '/buyer');
        navigate(redirectPath);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to your MarketVerse account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email', { required: 'Email is required' })}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />
          <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">Register</Link>
        </p>

        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-700 mb-1">Demo accounts:</p>
          <p>Buyer: buyer@marketverse.ai / buyer123</p>
          <p>Supplier: supplier@marketverse.ai / supplier123</p>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { loginSysAdmin } from '@/data/services/sysAdmin.api';
import { setCookie } from '@/lib/cookies';
import { FormEvent, useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { execute, isLoading, result } = useLazyQuery(loginSysAdmin);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await execute({ email, password });

    if (response?.data?.accessToken) {
      await setCookie('auth_token', response.data.accessToken);
    }
  };

  return (
    <div className="mx-auto max-w-md p-5">
      <h2 className="mb-5 text-2xl font-semibold">SysAdmin Login</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-blue-600 px-4 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {result && (
        <div className="mt-5 rounded  p-4">
          {result.data ? (
            <div>
              <h3 className="mb-2.5 text-lg font-semibold text-green-600">✓ Login Successful</h3>
              <div className="text-sm">
                <p>
                  <strong>User ID:</strong> {result.data.user.id}
                </p>
                <p>
                  <strong>Email:</strong> {result.data.user.email}
                </p>
                <p>
                  <strong>Using Default Password:</strong>{' '}
                  {result.data.user.isUsingDefaultPassword ? 'Yes' : 'No'}
                </p>
                <p className="mt-2.5">
                  <strong>Access Token:</strong>
                </p>
                <div className="break-all rounded border border-gray-300 p-2.5 text-xs">
                  {result.data.accessToken}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="mb-2.5 text-lg font-semibold text-red-600">✗ Login Failed</h3>
              <ul className="m-0 list-disc pl-5">
                {result.errors?.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

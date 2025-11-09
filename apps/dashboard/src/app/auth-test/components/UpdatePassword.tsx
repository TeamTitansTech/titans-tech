'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { updateSysAdminPassword } from '@/data/services/auth.api';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { FormEvent, useState } from 'react';

export default function UpdatePassword() {
  const { sysAdminUser, setSysAdminUser } = useSysAdmin();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { execute, isLoading, result } = useLazyQuery(updateSysAdminPassword);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await execute({
      currentPassword: sysAdminUser?.isUsingDefaultPassword ? undefined : currentPassword,
      password,
      confirmPassword,
    });

    if (response?.data !== null) {
      // Update user state to reflect password change
      if (sysAdminUser) {
        setSysAdminUser({ ...sysAdminUser, isUsingDefaultPassword: false });
      }
      // Reset form
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  if (!sysAdminUser) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md p-5">
      <h2 className="mb-5 text-2xl font-semibold">Update Password</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!sysAdminUser.isUsingDefaultPassword && (
          <div className="flex flex-col gap-1">
            <label htmlFor="currentPassword" className="font-medium">
              Current Password
            </label>
            <input
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
              className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-medium">
            New Password
          </label>
          <input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="font-medium">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {result && (
        <div className="mt-5 rounded p-4">
          {result.data !== null ? (
            <p className="text-sm text-green-600">✓ Password updated successfully</p>
          ) : (
            <div>
              <p className="mb-2 text-sm font-semibold text-red-600">✗ Update failed</p>
              <ul className="list-disc pl-5">
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

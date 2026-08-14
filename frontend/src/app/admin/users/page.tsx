'use client';

import { useEffect, useState } from 'react';

import {
  RefreshCw,
  Users,
  Search,
  ShieldCheck,
  UserX,
} from 'lucide-react';

import apiClient from '../../../utils/api/apiClient';

interface User {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  status?: string;
}

export default function AdminUsersPage() {

  const [users, setUsers] =
    useState<User[]>([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    try {

      setLoading(true);
      setError(null);

      /*
       * Use the admin users endpoint if it exists.
       * If your backend currently does not expose it,
       * this page will show the backend error instead of
       * using fake user data.
       */

      const response =
        await apiClient.get('/admin/users');

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : response.data?.users || []
      );

    } catch (err: any) {

      console.error(
        'Failed to load users:',
        err
      );

      setError(
        err?.response?.data?.detail ||
        'Unable to load users.'
      );

    } finally {

      setLoading(false);

    }
  };

  const filteredUsers =
    users.filter((user) => {

      const query =
        search.toLowerCase();

      return (
        user.name
          ?.toLowerCase()
          .includes(query) ||
        user.email
          ?.toLowerCase()
          .includes(query) ||
        user.role
          ?.toLowerCase()
          .includes(query)
      );

    });

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">

        <RefreshCw
          size={28}
          className="text-indigo-600 animate-spin"
        />

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-slate-50/50 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <div className="border-b border-slate-200 pb-5">

          <h1 className="text-2xl font-bold text-slate-900">
            Manage Users
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Manage platform users and account status.
          </p>

        </div>

        {error && (

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">

            <p className="text-xs font-semibold text-rose-700">
              {error}
            </p>

            <button
              onClick={fetchUsers}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Try Again
            </button>

          </div>

        )}

        {!error && (

          <>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                <Users
                  size={20}
                  className="text-indigo-600 mb-3"
                />

                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Total Users
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  {users.length}
                </p>

              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                <ShieldCheck
                  size={20}
                  className="text-emerald-600 mb-3"
                />

                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Active Users
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  {
                    users.filter(
                      (u) =>
                        u.is_active !== false
                    ).length
                  }
                </p>

              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                <UserX
                  size={20}
                  className="text-rose-600 mb-3"
                />

                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Inactive Users
                </p>

                <p className="text-2xl font-black text-slate-900 mt-1">
                  {
                    users.filter(
                      (u) =>
                        u.is_active === false
                    ).length
                  }
                </p>

              </div>

            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="p-4 border-b border-slate-100">

                <div className="relative max-w-md">

                  <Search
                    size={16}
                    className="absolute left-3 top-2.5 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search users..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />

                </div>

              </div>

              {filteredUsers.length === 0 ? (

                <div className="p-12 text-center text-xs text-slate-400">
                  No users found.
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-left text-xs">

                    <thead className="bg-slate-50 border-b border-slate-200">

                      <tr className="text-[10px] uppercase tracking-wider text-slate-400">

                        <th className="px-4 py-3">
                          User
                        </th>

                        <th className="px-4 py-3">
                          Email
                        </th>

                        <th className="px-4 py-3">
                          Role
                        </th>

                        <th className="px-4 py-3">
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredUsers.map(
                        (user) => (

                          <tr key={user.id}>

                            <td className="px-4 py-3 font-bold text-slate-900">
                              {user.name ||
                                'Unnamed User'}
                            </td>

                            <td className="px-4 py-3 text-slate-500">
                              {user.email ||
                                'N/A'}
                            </td>

                            <td className="px-4 py-3">

                              <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold">
                                {user.role ||
                                  'User'}
                              </span>

                            </td>

                            <td className="px-4 py-3">

                              <span
                                className={`px-2 py-1 rounded-full font-bold ${
                                  user.is_active === false
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-emerald-50 text-emerald-600'
                                }`}
                              >
                                {user.is_active === false
                                  ? 'Inactive'
                                  : 'Active'}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>

        )}

      </div>

    </div>
  );
}


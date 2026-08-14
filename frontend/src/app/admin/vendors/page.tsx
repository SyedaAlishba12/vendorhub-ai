'use client';

import { useEffect, useState } from 'react';

import {
  RefreshCw,
  Building2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import apiClient from '../../../utils/api/apiClient';

interface Vendor {
  id: string | number;
  company_name?: string;
  name?: string;
  email?: string;
  status?: string;
  is_verified?: boolean;
}

export default function AdminVendorsPage() {

  const [vendors, setVendors] =
    useState<Vendor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {

    try {

      setLoading(true);
      setError(null);

      const response =
        await apiClient.get('/admin/vendors');

      setVendors(
        Array.isArray(response.data)
          ? response.data
          : response.data?.vendors || []
      );

    } catch (err: any) {

      console.error(
        'Failed to load vendors:',
        err
      );

      setError(
        err?.response?.data?.detail ||
        'Unable to load vendors.'
      );

    } finally {

      setLoading(false);

    }
  };

  const handleVerification =
    async (
      vendorId: string | number,
      verified: boolean
    ) => {

      try {

        await apiClient.patch(
          `/admin/vendors/${vendorId}/verification`,
          {
            is_verified: verified,
          }
        );

        await fetchVendors();

      } catch (err: any) {

        console.error(
          'Vendor verification error:',
          err
        );

        alert(
          err?.response?.data?.detail ||
          'Failed to update vendor verification.'
        );

      }
    };

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
            Verify Vendors
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Review vendor accounts and manage verification status.
          </p>

        </div>

        {error && (

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">

            <p className="text-xs font-semibold text-rose-700">
              {error}
            </p>

            <button
              onClick={fetchVendors}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Try Again
            </button>

          </div>

        )}

        {!error && (

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {vendors.length === 0 ? (

              <div className="p-12 text-center">

                <Building2
                  size={30}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-xs text-slate-400">
                  No vendors available for verification.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left text-xs">

                  <thead className="bg-slate-50 border-b border-slate-200">

                    <tr className="text-[10px] uppercase tracking-wider text-slate-400">

                      <th className="px-4 py-3">
                        Vendor
                      </th>

                      <th className="px-4 py-3">
                        Email
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {vendors.map(
                      (vendor) => {

                        const verified =
                          vendor.is_verified === true ||
                          vendor.status === 'verified';

                        return (

                          <tr key={vendor.id}>

                            <td className="px-4 py-3">

                              <div className="flex items-center gap-3">

                                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                  <Building2 size={16} />
                                </div>

                                <span className="font-bold text-slate-900">
                                  {vendor.company_name ||
                                    vendor.name ||
                                    'Unnamed Vendor'}
                                </span>

                              </div>

                            </td>

                            <td className="px-4 py-3 text-slate-500">
                              {vendor.email ||
                                'N/A'}
                            </td>

                            <td className="px-4 py-3">

                              <span
                                className={`px-2 py-1 rounded-full font-bold ${
                                  verified
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-amber-50 text-amber-600'
                                }`}
                              >
                                {verified
                                  ? 'Verified'
                                  : 'Pending'}
                              </span>

                            </td>

                            <td className="px-4 py-3">

                              <div className="flex justify-end gap-2">

                                {!verified && (

                                  <button
                                    onClick={() =>
                                      handleVerification(
                                        vendor.id,
                                        true
                                      )
                                    }
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold"
                                  >
                                    <CheckCircle size={14} />

                                    Verify
                                  </button>

                                )}

                                {verified && (

                                  <button
                                    onClick={() =>
                                      handleVerification(
                                        vendor.id,
                                        false
                                      )
                                    }
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold"
                                  >
                                    <XCircle size={14} />

                                    Revoke
                                  </button>

                                )}

                              </div>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
}


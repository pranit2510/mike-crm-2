// src/app/technicians/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { technicianOperations } from "@/lib/supabase-client";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    technicianOperations.getAll().then((data) => {
      setTechnicians(data as typeof technicians);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl w-full mx-auto mt-10">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Technicians</h1>
          <Link href="/technicians/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">
              Add Technician
            </button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {technicians.map((tech: { id: string; name: string; email: string; phone: string; }) => (
                  <tr key={tech.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{tech.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tech.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tech.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        (tech as any).status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {(tech as any).status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{(tech as any).notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <Link href={`/technicians/${tech.id}/edit`}>
                        <button className="text-yellow-600 hover:text-yellow-800 p-1" title="Edit">
                          ✏️
                        </button>
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this technician?')) {
                            await technicianOperations.delete(tech.id);
                            setTechnicians(prev => prev.filter((t: any) => t.id !== tech.id));
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {technicians.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No technicians found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
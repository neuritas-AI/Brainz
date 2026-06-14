"use client";

import { useState } from 'react';

export default function ProfileCard({ session }: { session: any }) {
  const [profileName, setProfileName] = useState(session?.user?.name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const response = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileName, password }),
    });

    const data = await response.json();
    setLoading(false);
    setMessage(response.ok ? 'Profile updated successfully.' : data.error || 'Unable to update profile.');
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-glow">
      <h2 className="text-xl font-semibold">Profile details</h2>
      <form onSubmit={saveProfile} className="mt-4 space-y-4">
        <label className="block text-sm text-slate-200">Display name
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your profile name" />
        </label>
        <label className="block text-sm text-slate-200">New password
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
        </label>
        <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-3 font-semibold disabled:opacity-60">{loading ? 'Saving…' : 'Save profile'}</button>
        {message ? <p className="text-sm text-emerald-200">{message}</p> : null}
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p>Email: {session?.user?.email}</p>
        <p className="mt-1">Role: {(session?.user as any)?.role || 'USER'}</p>
        <p className="mt-1">Plan: {(session?.user as any)?.plan || 'FREE'}</p>
      </div>
    </section>
  );
}

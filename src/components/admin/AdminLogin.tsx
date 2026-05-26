'use client';

import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { getFirebaseAuth, googleAuthProvider } from '@/lib/firebase-client';
import { Shield, LogIn, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onAuthenticated: (email: string) => void;
}

export function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase is not configured. Check your environment variables.');
      }

      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        await signOut(auth);
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthenticated(data.email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Sign in with your authorized Google account to view live metrics.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
        >
          <LogIn className="h-5 w-5" />
          <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          Only authorized admin accounts can access this dashboard.
        </p>
      </div>
    </div>
  );
}

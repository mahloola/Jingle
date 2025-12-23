// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!userLoggedIn) {
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }

  return <>{children}</>;
}

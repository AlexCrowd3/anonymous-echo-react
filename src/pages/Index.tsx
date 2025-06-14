import React from 'react';
import { AuthForm } from '../components/auth/AuthForm';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthForm onSuccess={() => window.location.href = '/menu'} />;
  }

  return <Navigate to="/menu" replace />;
};

export default Index;
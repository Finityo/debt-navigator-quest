import { Navigate } from 'react-router-dom';
import { AUTH_PAGE_ENABLED } from '@/config/authAvailability';
import AuthPage from '@/pages/AuthPage';

export function AuthEntryRoute() {
  return AUTH_PAGE_ENABLED ? <AuthPage /> : <Navigate to="/debts" replace />;
}
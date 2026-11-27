import { useContext } from 'react';
import { ToastContext, type ToastApi } from '../components/ui/toast-context';

export const useToast = (): ToastApi => {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside the admin layout');
  return api;
};

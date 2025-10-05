import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../analytics';

export default function PageTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    analytics.page(undefined, { pathname, search });
  }, [pathname, search]);

  return null;
}
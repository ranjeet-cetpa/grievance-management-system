import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

const PreventBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (e) => {
      // push user forward if they attempt to go back
      navigate(1);
    };

    window.history.pushState(null, '', location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location]);

  return null;
};

export default PreventBackNavigation;

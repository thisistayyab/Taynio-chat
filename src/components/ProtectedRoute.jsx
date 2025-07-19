import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../server';

const API_URL = `${api}/v1/api/user`;

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/get-user`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (res.status === 401) {
          // Try to refresh the token
          try {
            const refreshRes = await fetch(`${API_URL}/refresh-token`, {
              method: 'POST',
              credentials: 'include',
            });
            
            if (refreshRes.ok) {
              // Token refreshed successfully, try get-user again
              const retryRes = await fetch(`${API_URL}/get-user`, {
                method: 'GET',
                credentials: 'include',
              });
              
              if (retryRes.status !== 200) {
                navigate('/login');
              }
            } else {
              navigate('/login');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            navigate('/login');
          }
        } else if (res.status !== 200) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (checking) return null; // or a loading spinner

  return children;
};

export default ProtectedRoute; 
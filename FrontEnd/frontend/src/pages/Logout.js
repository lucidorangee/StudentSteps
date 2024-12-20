import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`, {
          method: 'post',
          credentials: 'include',
        });

        if (response.ok) {
          // Logout successful
          console.log('Logout successful!');
          navigate('/login'); // Redirect to login page
        } else {
          // Logout failed
          console.error('Logout failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    handleLogout();
  }, [navigate]);

  return null; // This component does not render anything directly
};

export default Logout;

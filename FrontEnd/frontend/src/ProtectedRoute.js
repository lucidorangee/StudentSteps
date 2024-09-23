import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const [authenticated, setAuthenticated] = useState(null);

    useEffect(() => {
        const fetchAuthStatus = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setAuthenticated(data.isAuthenticated);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                console.error('Error fetching authentication status:', error);
                setAuthenticated(false);
            }
        };

        fetchAuthStatus();
    }, []); // Empty dependency array ensures it runs only once on mount

    // Show a loading indicator while checking authentication status
    if (authenticated === null) {
        return <div>Loading...</div>;
    }

    console.log('Authenticated:', authenticated);
    return authenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

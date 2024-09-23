import React from 'react';
import ProtectedRoute from './ProtectedRoute.js';

const ProtectedRouteWrapper = ({ element: Component, ...rest }) => {
    return <ProtectedRoute element={Component} {...rest} />;
};

export default ProtectedRouteWrapper;
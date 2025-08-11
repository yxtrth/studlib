import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Private route component - requires authentication
 */
export const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector(state => state.auth);
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired
};

/**
 * Role guard component - requires specific role
 */
export const RoleGuard = ({ children, role }) => {
    const { user, isAuthenticated, loading } = useSelector(state => state.auth);
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== role) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

RoleGuard.propTypes = {
    children: PropTypes.node.isRequired,
    role: PropTypes.oneOf(['student', 'admin']).isRequired
};

/**
 * Public route component - redirects if authenticated
 */
export const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const location = useLocation();

    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    return children;
};

PublicRoute.propTypes = {
    children: PropTypes.node.isRequired
};

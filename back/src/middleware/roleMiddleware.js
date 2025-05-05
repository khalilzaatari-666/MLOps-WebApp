function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access forbidden, Insufficient permissions.'
      });
    }

    next();
  }
}

function requireAdmin(res, req, next) {
  return requireRole('admin')(res, req, next);
}

module.exports = {
  requireRole,
  requireAdmin
}

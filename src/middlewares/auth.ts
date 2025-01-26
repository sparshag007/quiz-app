import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { JwtPayloadWithRole } from 'types/jwt';

// Middleware to check if JWT token is valid and attached to the request
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Bearer header
  if (!token) {
    res.status(401).json({ message: 'Access denied, token missing' });
    return;
  }

  try {
    const decoded = verifyToken(token) as JwtPayloadWithRole;
    req.user = decoded; // Attach the decoded token to the request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check the user's role
export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const role  = req.user.role;

    if (!roles.includes(role)) {
      res.status(403).json({ message: 'Access denied, insufficient privileges' });
      return;
    }

    next(); // Proceed if the user has the correct role
  };
};

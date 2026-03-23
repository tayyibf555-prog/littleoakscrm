import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { config } from '../config';
import { AppError } from './error-handler';

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired access token');
  }
}

export function authorize(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    next();
  };
}

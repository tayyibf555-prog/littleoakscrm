import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export function auditLog(entityType: string, action?: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const resolvedAction =
      action ||
      {
        GET: 'READ',
        POST: 'CREATE',
        PUT: 'UPDATE',
        PATCH: 'UPDATE',
        DELETE: 'DELETE',
      }[req.method] ||
      req.method;

    const rawEntityId = req.params.id || req.params.childId || req.params.staffId;
    const entityId = Array.isArray(rawEntityId) ? rawEntityId[0] : rawEntityId;

    // Fire and forget — don't block the request
    prisma.auditLog
      .create({
        data: {
          userId: req.user?.userId,
          action: resolvedAction,
          entityType,
          entityId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      })
      .catch(() => {
        // Silently fail — audit logging should never break the app
      });

    next();
  };
}

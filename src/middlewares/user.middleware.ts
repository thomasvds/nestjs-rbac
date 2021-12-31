import { NextFunction, Request, Response } from 'express';

export function userSetter(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers['USER-ID'] as string;
  req.user.id = header?.toString() || null;
  next();
}

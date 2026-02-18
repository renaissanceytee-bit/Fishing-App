import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }

  record.count++;
  next();
};

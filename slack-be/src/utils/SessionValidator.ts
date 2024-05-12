import { NextFunction, Request, Response } from "express";
import { User, Session } from "lucia";
import { lucia } from "../auth/lucia";

declare global {
  namespace Express {
    interface Request {
      user: User;
      session: Session;
    }
  }
}
/**
 * 
@description Middleware to validate the session cookie and set the user and session on the request object
 */
export async function ValidateAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const SessionID = req.cookies[lucia.sessionCookieName] ?? null;
  if (!SessionID) {
    return res.sendStatus(401);
  } else {
    const result = await lucia.validateSession(SessionID);
    try {
      if (result.session && result.user) {
        req.user = result.user;
        req.session = result.session;
        if (result.session.fresh) {
          // Session is fresh, update the cookie to extend the session
          const sessionCookie = lucia.createSessionCookie(result.session.id);
          res.cookie(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
          );
        }
        next();
      } else {
        // might be Session Expired or User Deleted
        // Remove Cookie and return 401
        const sessionCookie = lucia.createBlankSessionCookie();
        res.cookie(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
        return res.sendStatus(401);
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        return res.sendStatus(500);
      }
    }
  }
}

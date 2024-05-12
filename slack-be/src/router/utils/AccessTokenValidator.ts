import { NextFunction, Request, Response } from "express";
import { lucia } from "../../auth/lucia";

export default async function AccessTokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader = req.headers.authorization;
  const SessionID = lucia.readBearerToken(authorizationHeader ?? "");
  if (!SessionID) {
    return res.sendStatus(401);
  } else {
    const result = await lucia.validateSession(SessionID);
    try {
      if (result.session && result.user) {
        req.user = result.user;
        req.session = result.session;
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

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadWithRole; // Add the type of `user` based on your JWT payload
    }
  }
}

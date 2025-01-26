import { JwtPayload } from "jsonwebtoken";

interface JwtPayloadWithRole extends JwtPayload {
  id: number;
  email: string;
  role: string;
}
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

interface UserPayload {
  id: number;
  roleId: number;
  email: string;
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not defined`);
  return v;
}

export const userProvides = {
  async encodeToken(user: UserPayload): Promise<string> {
    const secret = getEnv("JWT_SECRET");
    const expiresIn = (process.env.JWT_EXPIRES_IN ??
      "1m") as SignOptions["expiresIn"];

    const payload = {
      id: user.id,
      roleId: user.roleId,
      email: user.email,
    } as Record<string, unknown>;

    const options: SignOptions = {
      expiresIn,
      algorithm: "HS256",
    };

    return jwt.sign(payload, secret as unknown as jwt.Secret, options);
  },

  async encodeRefreshToken(user: UserPayload): Promise<string> {
    const secret = getEnv("JWT_SECRET");
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
      "7d") as SignOptions["expiresIn"];

    const payload = {
      id: user.id,
      roleId: user.roleId,
    } as Record<string, unknown>;

    const options: SignOptions = {
      expiresIn,
      algorithm: "HS256",
    };

    return jwt.sign(payload, secret as unknown as jwt.Secret, options);
  },

  async decodeToken(token: string): Promise<JwtPayload | string> {
    const secret = getEnv("JWT_SECRET");
    return jwt.verify(token, secret as unknown as jwt.Secret);
  },

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const secret = getEnv("JWT_SECRET");
    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (err: any) {
      if (err.name === "TokenExpiredError")
        throw new Error("Refresh token expired");
      throw new Error("Invalid refresh token");
    }
  },
};

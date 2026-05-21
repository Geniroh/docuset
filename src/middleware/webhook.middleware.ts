import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { UnauthorizedError, ValidationError } from "../lib/errors";

export function verifyWebhookSignature(secret: string, headerName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers[headerName.toLowerCase()] as string;

    if (!signature) {
      throw new UnauthorizedError("Missing signature header");
    }

    // The body must be the RAW bytes, not parsed JSON
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      throw new ValidationError(
        "Raw body not available. Ensure express.raw() middleware is configured.",
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    // Use timingSafeEqual to prevent timing attacks
    const provided = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      provided.length !== expected.length ||
      !crypto.timingSafeEqual(provided, expected)
    ) {
      throw new UnauthorizedError("Invalid signature");
    }

    next();
  };
}

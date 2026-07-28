import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
export declare const shouldBeUser: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const shouldBeAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=authMiddleware.d.ts.map
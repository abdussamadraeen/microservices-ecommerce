import { Request, Response } from "express";
export declare const createProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=product.controller.d.ts.map
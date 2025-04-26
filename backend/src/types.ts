// Extend Express Request type to include file
declare namespace Express {
    export interface Request {
        file?: Multer.File;
    }

    namespace Multer {
        interface File {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            destination: string;
            filename: string;
            path: string;
            buffer: Buffer;
        }
    }
}

// Extend Error with status property
declare interface Error {
    status?: number;
}

// src/types/pdf-text-extract.d.ts
declare module "pdf-text-extract" {
    function extract(
        filePath: string,
        options: { layout?: boolean; sort?: boolean },
        callback: (err: Error | null, pages?: string[]) => void
    ): void;

    export default extract;
}

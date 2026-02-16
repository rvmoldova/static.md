import Busboy from 'busboy';
import { Request, Response, NextFunction } from 'express';

export interface ParsedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/**
 * Middleware that parses multipart/form-data from req.rawBody
 * (Cloud Functions v2 consumes the stream before Express sees it).
 */
export function parseForm(maxFiles: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody || !req.headers['content-type']?.includes('multipart/form-data')) {
      return next();
    }

    const bb = Busboy({ headers: req.headers });
    const files: ParsedFile[] = [];
    const fields: Record<string, string> = {};

    bb.on('file', (fieldname, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on('data', (d: Buffer) => chunks.push(d));
      stream.on('end', () => {
        if (files.length < maxFiles) {
          const buf = Buffer.concat(chunks);
          files.push({
            fieldname,
            originalname: info.filename,
            encoding: info.encoding,
            mimetype: info.mimeType,
            buffer: buf,
            size: buf.length,
          });
        }
      });
    });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('finish', () => {
      (req as any).files = files;
      req.body = fields;
      next();
    });

    bb.on('error', (err: Error) => next(err));

    bb.end(rawBody);
  };
}

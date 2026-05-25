declare module 'multer' {
  import type { Request } from 'express';

  type Multer = {
    (options?: any): any;
    any: any;
  };

  const multer: Multer;
  export default multer;
}


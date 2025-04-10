/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="@emotion/react/types/css-prop" />

declare interface ObjectConstructor {
  keys<T>(o: T): (keyof T)[];
}

declare global {
  export type YN = 'Y' | 'N';
}

declare module 'md5';
declare module 'esdk-obs-browserjs' {
  class ObsClient {
    constructor(config: { access_key_id: string; secret_access_key: string; security_token: string; server: string });
    uploadFile(params: any, callback: any): void;
    getObject(
      params: { Bucket: string; Key: string; SaveByType?: string },
      callback: (
        err?: Error,
        success: (result: {
          CommonMsg: {
            Status: number;
            InterfaceResult: boolean;
          };
          InterfaceResult: {
            Content: {
              SignedUrl: string;
            };
          };
        }) => void,
      ) => void,
    ): void;
  }
  export default ObsClient;
}

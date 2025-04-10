// import type { State } from '@/stores/global.store';

import dayjs from 'dayjs';
import ObsClient from 'esdk-obs-browserjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { generateRandomString } from '@/utils';
// import { queryObsConfig } from '@/api/iam';
import { useGlobalStore } from '@/zustand';

const MAX_SIZE = 1024 * 1024 * 300; //100;

export interface ObsInterfaceResult {
  ContentLength: string; // 这里是 string 类型，因为 JSON 中的 ContentLength 是一个字符串
  Location: string;
  Bucket: string;
  Key: string;
  ETag: string;
}

export interface UploadResult {
  file: File;
  result: ObsInterfaceResult;
  server?: string;
  key?: string;
  cdnServer?: string;
  cdnFileUrl: string;
}

export const useUploader = () => {
  const obsClient = useRef<ObsClient>();
  const { obsConfig, setObsConfig } = useGlobalStore();
  const obsConfigRef = useRef(obsConfig);
  const [isPrepare, setPrepareStatus] = useState(false);

  const bucket = useRef('');
  const server = useRef('');
  const cdnServer = useRef('');

  const getConfig = useCallback(() => {
    // queryObsConfig().then(res => {
    //   const { access, secret, securityToken, bucketName, endPoint, cdnEndPoint } = res.body;
    //   bucket.current = bucketName;
    //   server.current = endPoint;
    //   cdnServer.current = cdnEndPoint;
    //   setObsConfig(res.body);
    //   obsClient.current = new ObsClient({
    //     access_key_id: access,
    //     secret_access_key: secret,
    //     security_token: securityToken || '',
    //     server: endPoint,
    //   });
    //   setPrepareStatus(true);
    // });
  }, [setObsConfig]);

  useEffect(() => {
    if (obsConfigRef.current) {
      const { expiresAt, access, secret, securityToken, bucketName, endPoint, cdnEndPoint } = obsConfigRef.current;
      const expiresAtTime = dayjs(expiresAt);
      const currentTime = dayjs(new Date());

      if (currentTime.isBefore(expiresAtTime)) {
        bucket.current = bucketName;
        server.current = endPoint;
        cdnServer.current = cdnEndPoint;
        obsClient.current = new ObsClient({
          access_key_id: access,
          secret_access_key: secret,
          security_token: securityToken,
          server: endPoint,
        });
        setPrepareStatus(true);

        return;
      }
    }

    getConfig();
  }, [getConfig]);

  const customRequest = async (
    file: File,
    {
      onProgress,
      onSuccess,
      onError,
    }: {
      onProgress?: (percent: number) => void;
      onSuccess?: (response: any, file: File) => void;
      onError?: (response: Error, file: File) => void;
    },
  ) => {
    const affterfix = file.name.split('.').pop();

    const key = `${import.meta.env.VITE_OBS_PATH}/${affterfix}/${generateRandomString()}.${affterfix}`;

    const ProgressCallback = (transferredAmount: number, totalAmount: number) => {
      onProgress?.(Math.floor((transferredAmount / totalAmount) * 100));
    };

    let uploadCheckpoint: any;
    let time = 0;
    const maxTime = 1;

    const callback = (
      err: string,
      result: { CommonMsg: { Status: string | number }; InterfaceResult: ObsInterfaceResult },
    ) => {
      if (!err) {
        const url = ['https://', cdnServer.current, '/', result.InterfaceResult.Key].join('');

        onSuccess?.(
          {
            ...result.InterfaceResult,
            url,
            key: result.InterfaceResult.Key,
          },
          file,
        );

        return;
      }

      if (time >= maxTime) {
        onError?.(new Error(err), file);

        return;
      }

      time++;
      obsClient.current?.uploadFile(
        {
          UploadCheckpoint: uploadCheckpoint,
          ProgressCallback,
        },
        callback,
      );
    };

    try {
      obsClient.current?.uploadFile(
        {
          Bucket: bucket.current,
          Key: key,
          SourceFile: file,
          PartSize: MAX_SIZE,
          ProgressCallback,
          ResumeCallback: (resumeHook: any, _uploadCheckpoint: any) => {
            uploadCheckpoint = _uploadCheckpoint;
          },
        },
        callback,
      );
    } catch (e) {
      onError?.(e as Error, file);
    }
  };

  return {
    isPrepare,
    customRequest,
    obsClient,
    bucket,
  };
};

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { resolveImageUri } from '../services/fileService';
import {
  STAMP_JPEG_COMPRESS,
  prepareExportPhoto,
  type PreparedExportPhoto,
  type StampImageExportOptions,
} from '../services/exportStampImage';
import type { Stamp } from '../types/stamp';
import { StampExportCard } from './StampExportCard';

export type StampImageExportHostRef = {
  captureStamp: (stamp: Stamp, options: StampImageExportOptions) => Promise<string>;
};

type CapturePayload = {
  stamp: Stamp;
  options: StampImageExportOptions;
  preparedPhoto: PreparedExportPhoto | null;
};

export const StampImageExportHost = forwardRef<StampImageExportHostRef>(function StampImageExportHost(
  _props,
  ref,
) {
  const shotRef = useRef<ViewShot>(null);
  const [payload, setPayload] = useState<CapturePayload | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const resolverRef = useRef<{
    resolve: (uri: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    captureStamp(stamp, options) {
      return new Promise<string>((resolve, reject) => {
        resolverRef.current = { resolve, reject };
        setImageReady(false);

        void (async () => {
          try {
            if (options.textLayout === 'watermark') {
              const preparedPhoto = await prepareExportPhoto(resolveImageUri(stamp.imagePath));
              setPayload({ stamp, options, preparedPhoto });
              return;
            }

            setPayload({ stamp, options, preparedPhoto: null });
          } catch (error) {
            resolverRef.current = null;
            reject(error instanceof Error ? error : new Error('스탬프 이미지 준비에 실패했습니다.'));
          }
        })();
      });
    },
  }));

  useEffect(() => {
    if (!payload || !imageReady || !resolverRef.current) {
      return;
    }

    const { resolve, reject } = resolverRef.current;
    const timer = setTimeout(async () => {
      try {
        const uri = await captureRef(shotRef, {
          format: 'jpg',
          quality: STAMP_JPEG_COMPRESS,
          result: 'tmpfile',
        });
        resolve(uri);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('스탬프 이미지 캡처에 실패했습니다.'));
      } finally {
        resolverRef.current = null;
        setImageReady(false);
        setPayload(null);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [payload, imageReady]);

  return (
    <View style={styles.offscreen} pointerEvents="none" collapsable={false}>
      <ViewShot
        ref={shotRef}
        options={{ format: 'jpg', quality: STAMP_JPEG_COMPRESS }}
        collapsable={false}
      >
        {payload ? (
          <StampExportCard
            stamp={payload.stamp}
            options={payload.options}
            preparedPhoto={payload.preparedPhoto}
            onImageReady={() => setImageReady(true)}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </ViewShot>
    </View>
  );
});

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -20000,
    top: 0,
  },
  placeholder: {
    width: 1,
    height: 1,
  },
});

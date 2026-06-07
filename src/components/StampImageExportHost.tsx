import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import {
  STAMP_JPEG_COMPRESS,
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
};

export const StampImageExportHost = forwardRef<StampImageExportHostRef>(function StampImageExportHost(
  _props,
  ref,
) {
  const shotRef = useRef<ViewShot>(null);
  const [payload, setPayload] = useState<CapturePayload | null>(null);
  const resolverRef = useRef<{
    resolve: (uri: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    captureStamp(stamp, options) {
      return new Promise<string>((resolve, reject) => {
        resolverRef.current = { resolve, reject };
        setPayload({ stamp, options });
      });
    },
  }));

  useEffect(() => {
    if (!payload || !resolverRef.current) {
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
        setPayload(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [payload]);

  return (
    <View style={styles.offscreen} pointerEvents="none" collapsable={false}>
      <ViewShot
        ref={shotRef}
        options={{ format: 'jpg', quality: STAMP_JPEG_COMPRESS }}
        collapsable={false}
      >
        {payload ? (
          <StampExportCard stamp={payload.stamp} options={payload.options} />
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
    left: -10000,
    top: 0,
    opacity: 0,
  },
  placeholder: {
    width: 1,
    height: 1,
  },
});

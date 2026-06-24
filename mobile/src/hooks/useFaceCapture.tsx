import { useCallback, useRef, useState } from "react";
import type { FaceCaptureMode } from "../components/FaceCameraModal";
import { FaceCameraModal } from "../components/FaceCameraModal";
import { enrollFromPhotos, verifyFromPhoto } from "../lib/face-auth";

interface CaptureState {
  visible: boolean;
  mode: FaceCaptureMode;
}

export function useFaceCapture() {
  const [capture, setCapture] = useState<CaptureState | null>(null);
  const enrollResolverRef = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null);
  const verifyResolverRef = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null);

  const closeCapture = useCallback(() => {
    setCapture(null);
    enrollResolverRef.current = null;
    verifyResolverRef.current = null;
  }, []);

  const requestEnroll = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      enrollResolverRef.current = { resolve, reject };
      setCapture({ visible: true, mode: "enroll" });
    });
  }, []);

  const requestVerify = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      verifyResolverRef.current = { resolve, reject };
      setCapture({ visible: true, mode: "verify" });
    });
  }, []);

  const handleSuccess = useCallback(async (images: string[]) => {
    const enrollResolver = enrollResolverRef.current;
    const verifyResolver = verifyResolverRef.current;
    closeCapture();

    try {
      if (enrollResolver) {
        await enrollFromPhotos(images);
        enrollResolver.resolve();
        return;
      }
      if (verifyResolver) {
        const token = await verifyFromPhoto(images[0]);
        verifyResolver.resolve(token);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Face capture failed");
      enrollResolver?.reject(err);
      verifyResolver?.reject(err);
    }
  }, [closeCapture]);

  const handleCancel = useCallback(() => {
    const message = "Face capture cancelled";
    enrollResolverRef.current?.reject(new Error(message));
    verifyResolverRef.current?.reject(new Error(message));
    closeCapture();
  }, [closeCapture]);

  const handleError = useCallback((message: string) => {
    const error = new Error(message);
    enrollResolverRef.current?.reject(error);
    verifyResolverRef.current?.reject(error);
    closeCapture();
  }, [closeCapture]);

  const modal = capture ? (
    <FaceCameraModal
      visible={capture.visible}
      mode={capture.mode}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      onError={handleError}
    />
  ) : null;

  return { requestEnroll, requestVerify, modal };
}

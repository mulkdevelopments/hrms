import { api } from "../api/client";

export interface FaceStatus {
  enabled: boolean;
  enrolled: boolean;
  faceEnrolledAt?: string | null;
}

export async function fetchFaceStatus(): Promise<FaceStatus> {
  return api<FaceStatus>("/attendance/face/status");
}

export async function enrollFromPhotos(images: string[]): Promise<void> {
  await api("/attendance/face/enroll-photo", {
    method: "POST",
    body: JSON.stringify({ images }),
  });
}

export async function verifyFromPhoto(image: string): Promise<string> {
  const result = await api<{ faceVerificationToken: string }>("/attendance/face/verify-photo", {
    method: "POST",
    body: JSON.stringify({ image }),
  });
  return result.faceVerificationToken;
}

export async function resolveFaceVerificationToken(
  requestEnroll: () => Promise<void>,
  requestVerify: () => Promise<string>,
): Promise<string | undefined> {
  const status = await fetchFaceStatus();
  if (!status.enabled) return undefined;

  if (!status.enrolled) {
    await requestEnroll();
  }

  return requestVerify();
}

const MODEL_BASE = "https://justadudewhohacks.github.io/face-api.js/models";
export const FACE_MATCH_THRESHOLD = 0.45;
const FACE_DETECTION_SCORE_THRESHOLD = 0.4;

let modelsReady = false;
let modelsLoading: Promise<void> | null = null;
let faceapiModule: typeof import("@vladmandic/face-api") | null = null;
let canvasModule: typeof import("canvas") | null = null;

async function loadModels(): Promise<void> {
  const tf = await import("@tensorflow/tfjs-node");
  faceapiModule = await import("@vladmandic/face-api");
  canvasModule = await import("canvas");

  faceapiModule.env.monkeyPatch({
    Canvas: canvasModule.Canvas as never,
    Image: canvasModule.Image as never,
    ImageData: canvasModule.ImageData as never,
  });

  try {
    await tf.setBackend("tensorflow");
  } catch {
    await tf.setBackend("cpu");
  }
  await tf.ready();

  await Promise.all([
    faceapiModule.nets.tinyFaceDetector.loadFromUri(MODEL_BASE),
    faceapiModule.nets.faceLandmark68TinyNet.loadFromUri(MODEL_BASE),
    faceapiModule.nets.faceRecognitionNet.loadFromUri(MODEL_BASE),
  ]);

  modelsReady = true;
}

export async function ensureFaceModels(): Promise<void> {
  if (modelsReady) return;
  if (!modelsLoading) {
    modelsLoading = loadModels().catch((error) => {
      modelsLoading = null;
      throw error;
    });
  }
  await modelsLoading;
}

function decodeBase64Image(base64: string): Buffer {
  const cleaned = base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "").trim();
  return Buffer.from(cleaned, "base64");
}

export async function descriptorFromImageBase64(base64: string): Promise<number[]> {
  await ensureFaceModels();
  if (!faceapiModule || !canvasModule) {
    throw new Error("Face recognition is unavailable");
  }

  const buffer = decodeBase64Image(base64);
  const image = await canvasModule.loadImage(buffer);
  const surface = canvasModule.createCanvas(image.width, image.height);
  const context = surface.getContext("2d");
  context.drawImage(image, 0, 0, image.width, image.height);
  const detection = await faceapiModule
    .detectSingleFace(surface as never, new faceapiModule.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: FACE_DETECTION_SCORE_THRESHOLD }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection?.descriptor) {
    throw new Error("No face detected. Keep your face centered and well lit.");
  }

  return Array.from(detection.descriptor);
}

export async function descriptorsFromImagesBase64(images: string[]): Promise<number[]> {
  const descriptors: number[][] = [];
  for (const image of images) {
    descriptors.push(await descriptorFromImageBase64(image));
  }
  return averageDescriptors(descriptors);
}

export function averageDescriptors(descriptors: number[][]): number[] {
  if (!descriptors.length) return [];
  const length = descriptors[0].length;
  const sums = new Array<number>(length).fill(0);
  for (const descriptor of descriptors) {
    for (let index = 0; index < length; index += 1) {
      sums[index] += Number(descriptor[index] ?? 0);
    }
  }
  return sums.map((value) => value / descriptors.length);
}

export function descriptorDistance(saved: number[], candidate: number[]): number {
  const length = Math.min(saved.length, candidate.length);
  if (length < 64) {
    throw new Error("Face descriptor data is invalid");
  }
  let squared = 0;
  for (let index = 0; index < length; index += 1) {
    const diff = Number(saved[index]) - Number(candidate[index]);
    squared += diff * diff;
  }
  return Math.sqrt(squared);
}

export function descriptorsMatch(saved: number[], candidate: number[]): { matched: boolean; distance: number } {
  const distance = descriptorDistance(saved, candidate);
  return { matched: distance <= FACE_MATCH_THRESHOLD, distance };
}

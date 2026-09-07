import { readFileHeadBytes } from "@/lib/catalog-import/resolve-source";
import {
  PRINT_MASTER_TARGET_HEIGHT,
  PRINT_MASTER_TARGET_WIDTH,
} from "@/lib/catalog-import/constants";

export type ImageDimensions = {
  width: number;
  height: number;
  format: "PNG" | "JPEG";
};

function readPngDimensions(buffer: Buffer): ImageDimensions | null {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) {
    return null;
  }

  const chunkType = buffer.subarray(12, 16).toString("ascii");

  if (chunkType !== "IHDR") {
    return null;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { width, height, format: "PNG" };
}

function readJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    if (offset + 3 >= buffer.length) {
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);

    if (segmentLength < 2 || offset + 2 + segmentLength > buffer.length) {
      break;
    }

    const isStartOfFrame =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (isStartOfFrame) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);

      if (width <= 0 || height <= 0) {
        return null;
      }

      return { width, height, format: "JPEG" };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

export function readImageDimensionsFromBuffer(
  buffer: Buffer,
  extension: string,
): ImageDimensions | null {
  const normalizedExtension = extension.toLowerCase();

  if (normalizedExtension === "png") {
    return readPngDimensions(buffer);
  }

  if (normalizedExtension === "jpg" || normalizedExtension === "jpeg") {
    return readJpegDimensions(buffer);
  }

  return null;
}

export function readImageDimensionsFromFile(
  absolutePath: string,
  extension: string,
): ImageDimensions {
  const buffer = readFileHeadBytes(absolutePath);
  const dimensions = readImageDimensionsFromBuffer(buffer, extension);

  if (!dimensions) {
    throw new Error("Could not read image dimensions.");
  }

  return dimensions;
}

export function isBelowPrintMasterTarget(dimensions: ImageDimensions): boolean {
  return (
    dimensions.width < PRINT_MASTER_TARGET_WIDTH ||
    dimensions.height < PRINT_MASTER_TARGET_HEIGHT
  );
}

export function formatDimensions(dimensions: ImageDimensions): string {
  return `${dimensions.width} × ${dimensions.height}`;
}

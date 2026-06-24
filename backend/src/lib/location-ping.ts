import { prisma } from "./prisma.js";
import { resolveGeoTag } from "./geocoding.js";

type CreateLocationPingInput = {
  employeeId: string;
  sessionId?: string | null;
  officeId?: string | null;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  insideGeofence?: boolean | null;
  eventType: string;
  recordedAt?: Date;
  geoTag?: string | null;
  geoAddress?: string | null;
};

export async function createLocationPing(input: CreateLocationPingInput) {
  const geo = await resolveGeoTag({
    latitude: input.latitude,
    longitude: input.longitude,
    geoTag: input.geoTag,
    geoAddress: input.geoAddress,
  });

  return prisma.locationPing.create({
    data: {
      employeeId: input.employeeId,
      sessionId: input.sessionId ?? null,
      officeId: input.officeId ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy ?? null,
      insideGeofence: input.insideGeofence ?? null,
      eventType: input.eventType,
      recordedAt: input.recordedAt,
      geoTag: geo.geoTag,
      geoAddress: geo.geoAddress,
    },
  });
}

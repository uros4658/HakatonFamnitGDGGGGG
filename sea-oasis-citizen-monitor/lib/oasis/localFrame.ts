export function offsetToLatLng(
  centerLat: number,
  centerLng: number,
  eastM: number,
  northM: number
): { lat: number; lng: number } {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((centerLat * Math.PI) / 180);

  return {
    lat: centerLat + northM / metersPerDegLat,
    lng: centerLng + eastM / metersPerDegLng,
  };
}

export function rotateLocalOffset(
  eastM: number,
  northM: number,
  orientationDegrees: number
): { eastM: number; northM: number } {
  const theta = (orientationDegrees * Math.PI) / 180;
  return {
    eastM: eastM * Math.cos(theta) - northM * Math.sin(theta),
    northM: eastM * Math.sin(theta) + northM * Math.cos(theta),
  };
}


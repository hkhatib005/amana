import { Coordinates, Qibla } from 'adhan';

export function computeQiblaBearing(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

// src/app/types/solar-calculator.d.ts
declare module 'solar-calculator' {

  export function century(date: Date): number;
  export function declination(t: number): number;
  export function equationOfTime(t: number): number;
  export function apparentLongitude(t: number): number;
  export function meanAnomaly(t: number): number;
  export function meanLongitude(t: number): number;
  export function obliquityOfEcliptic(t: number): number;
  export function trueLongitude(t: number): number;

  const solar: {
    century(date: Date): number;
    declination(t: number): number;
    equationOfTime(t: number): number;
    hourAngle(t: number, latitude: number): number;
    radius(t: number): number;
    rightAscension(t: number): number;
    solarNoon(t: number, longitude: number): number;
    zenith(t: number, latitude: number): number;
  };

  export default solar;
}
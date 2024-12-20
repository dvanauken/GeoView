// src/app/types/solar-calculator.d.ts
declare module 'solar-calculator' {
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
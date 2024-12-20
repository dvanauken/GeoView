declare module 'versor' {
    interface VersorFunction {
        (rotate: [number, number, number]): number[];
        delta(v0: [number, number, number], v1: [number, number, number]): number[];
        rotation(q: number[]): [number, number, number];
    }
    const versor: VersorFunction;
    export = versor;
}
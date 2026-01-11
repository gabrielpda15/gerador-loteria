export function range(from: number, to: number): number[] {
    const min = from > to ? to : from;
    const length = (from > to ? from - to : to - from) + 1;
    return [...Array(length).keys()].map((value) => value + min);
}

export function createBatch<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }

    return result;
}

export function sleep(ms: number): Promise<void> {
    return new Promise<void>((res) => {
        setTimeout(() => res(), ms);
    });
}

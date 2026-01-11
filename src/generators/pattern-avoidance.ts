export function generatePatternAvoidanceGames(
    stats: Map<string, number>,
    size: number,
    total: number,
    threshold: number
): number[][] {
    const pool = [...stats.keys()].map((num) => Number(num));

    function isBadPattern(arr: number[]): boolean {
        const evens = arr.filter((num) => num % 2 === 0).length;
        const odds = size - evens;

        if (evens === size || odds === size) return true;
        if (evens === size - 1 || odds === size - 1) return true;

        let seq = 1;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] === arr[i + 1] + 1) seq++;
            else seq = 1;

            if (seq >= 3) return true;
        }

        return false;
    }

    function createValidGame(threshold: number): number[] | null {
        for (let i = 0; i < threshold; i++) {
            const numbers = [...pool]
                .sort(() => Math.random() - 0.5)
                .slice(0, size)
                .sort((a, b) => a - b);
            if (!isBadPattern(numbers)) return numbers;
        }

        return null;
    }

    return [...Array(total)].map(() => createValidGame(threshold));
}

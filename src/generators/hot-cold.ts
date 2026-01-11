export function generateHotColdGames(stats: Map<string, number>, size: number, total: number): number[][] {
    const sorted = [...stats.entries()].sort((a, b) => b[1] - a[1]);
    const len = sorted.length;

    const hot = sorted.slice(0, Math.ceil(len * 0.2)).map(([num]) => Number(num));
    const cold = sorted.slice(-Math.ceil(len * 0.2)).map(([num]) => Number(num));

    let odd = false;
    function createValidGame(): number[] {
        const count = size / 2;
        const hotCount = odd ? Math.floor(count) : Math.ceil(count);
        const coldCount = odd ? Math.ceil(count) : Math.floor(count);

        const result = [
            ...hot.sort(() => Math.random() - 0.5).slice(0, hotCount),
            ...cold.sort(() => Math.random() - 0.5).slice(0, coldCount),
        ];
        
        odd = !odd;

        return result.sort((a, b) => a - b);
    }

    return [...Array(total)].map(() => createValidGame());
}

export function generateCombinatorialGames(stats: Map<string, number>, size: number, total: number): number[][] {
    const numbers = [...stats.keys()].map(num => Number(num)).sort((a, b) => a - b);

    function createValidGame(): number[] {
        const result = new Set<number>();

        while (result.size < size) {
            const index = Math.floor(Math.abs(Math.random() * Math.random()) * numbers.length);
            result.add(numbers[index]);
        }

        return [...result].sort((a, b) => a - b);
    }
    
    return [...Array(total)].map(() => createValidGame());
}

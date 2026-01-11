export function generateAdaptiveWeightedGames(stats: Map<string, number>, size: number, total: number): number[][] {
    const entries = [...stats.entries()];
    const max = Math.max(...entries.map((e) => e[1]));
    const min = Math.min(...entries.map((e) => e[1]));

    const weights = entries.map(([num, count]) => ({
        num: Number(num),
        weight: (count - min) / (max - min || 1),
    }));

    const raised = weights.map((item) => ({
        num: item.num,
        weight: Math.pow(item.weight + 0.1, 2),
    }));

    const totalWeight = raised.reduce((pv, cv) => pv + cv.weight, 0);

    function pickOne(): number {
        let rndValue = Math.random() * totalWeight;
        for (const item of raised) {
            if (rndValue < item.weight) return item.num;
            rndValue -= item.weight;
        }
        return raised[raised.length - 1].num;
    }

    function createValidGame(): number[] {
        const result = new Set<number>();
        while (result.size < size) {
            result.add(pickOne());
        }
        return [...result].sort((a, b) => a - b);
    }

    return [...Array(total)].map(() => createValidGame());
}

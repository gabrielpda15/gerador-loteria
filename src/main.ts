import 'reflect-metadata';
import 'dotenv/config';

import minimist from 'minimist';

import { Api } from './api';
import { ApiResponse } from './response';
import { generatePatternAvoidanceGames } from './generators/pattern-avoidance';
import { generateCombinatorialGames } from './generators/combinatorial';
import { generateHotColdGames } from './generators/hot-cold';
import { generateAdaptiveWeightedGames } from './generators/adaptive-weighted';

function getStats(games: ApiResponse[]) {
    const stats = new Map<string, number>();

    for (const game of games) {
        for (const num of game.numbers) {
            const currCount = stats.get(num) ?? 0;
            stats.set(num, currCount + 1);
        }
    }

    const sortedStats = [...stats.entries()].sort((a, b) => b[1] - a[1]);
    const top6 = sortedStats
        .slice(0, 6)
        .map(([num]) => Number(num))
        .sort((a, b) => a - b);
    const bottom6 = sortedStats
        .slice(-6)
        .map(([num]) => Number(num))
        .sort((a, b) => a - b);

    return { top6, bottom6, stats };
}

function removeDupes(generated: number[][], history: number[][]): number[][] {
    const historySet = new Set(history.map(game => [...game].sort((a, b) => a - b).join('-')));

    return generated.filter(game => {
        const key = [...game].sort((a, b) => a - b).join('-');
        return !historySet.has(key);
    });
}

function stringifyGame(game: number[]): string {
    const numbers = game.map(num => num.toString().padStart(2, ' ')).join('  ');
    return ` ➤  ${numbers}`;
}

(async () => {
    const args = minimist(process.argv.slice(2));
    const api = new Api();



    const n = args['n'] ?? 2;
    const k = args['k'] ?? 6;
    const threshold = args['t'] ?? 100;
    const batchSize = args['b'] ?? 5;
    const type = args['type'] ?? 'megasena'
    
    console.log(` 🔎 Buscando jogo mais recente.`);
    const latestGame = await api.getLatest('megasena');

    const from = args['from'] ?? latestGame.id;
    const to = args['to'] ?? from - 5;

    console.log(' 🚀 Iniciando processo de aquisição de dados.');
    console.log(` 📌 Usando jogos de ${from} até ${to}`);

    const games = await api.getMultiple(from, to, batchSize, 'megasena');
    const { top6, bottom6, stats } = getStats(games);

    console.log(`\n ✔️ Finalizado a aquisição dos dados.\n`);

    console.log(` 🎮 TOP 6 ${ stringifyGame(top6) }`);
    console.log(` 🎮 BOT 6 ${ stringifyGame(bottom6) }`);

    console.log();
    const result: number[][] = [];

    console.log(` ⚙️ Gerando ${n} jogos evitando padrões.`);
    const paGames = generatePatternAvoidanceGames(stats, k, n, threshold);

    console.log(` ⚙️ Gerando ${n} jogos usando combinações.`);
    const cGames = generateCombinatorialGames(stats, k, n);
    
    console.log(` ⚙️ Gerando ${n} jogos usando números quentes e frios.`);
    const hcGames = generateHotColdGames(stats, k, n);
    
    console.log(` ⚙️ Gerando ${n} jogos usando sistema de pesos.`);
    const awGames = generateAdaptiveWeightedGames(stats, k, n);
    
    result.push(...paGames);
    result.push(...cGames);
    result.push(...hcGames);
    result.push(...awGames);

    const gamesNums = games.map(item => item.numbers.map(num => Number(num)).sort((a, b) => a - b));
    const finalResult = removeDupes(result, gamesNums);

    const finalText = finalResult.map(stringifyGame).join('\n');

    console.log(' 📖 Lista de todos os jogos gerados:\n');
    console.log(finalText);
})();

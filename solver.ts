import chalk from 'chalk';

type PreSudoku = string[];
type Tile = {
	possibles: number[];
};

type TileGroup = Tile[];
type Sudoku = TileGroup[];

const parse = (sudoku: PreSudoku): Sudoku => {
	return sudoku.map(row =>
		row.split('').map(number => {
			const numberAsNumber = parseInt(number);
			if (numberAsNumber !== 0) {
				return {
					possibles: [numberAsNumber],
				};
			} else {
				return {
					possibles: [1, 2, 3, 4, 5, 6, 7, 8, 9],
				};
			}
		})
	);
};

const isSolved = (tile: Tile) => tile.possibles.length === 1;

const isUnique = (number, tileGroup: TileGroup): boolean =>
	tileGroup.filter(({ possibles }) => possibles.includes(number)).length === 0;

const findBlocked = (tileGroup: TileGroup): number[] =>
	tileGroup.filter(isSolved).map(({ possibles }) => possibles[0]);

const getQuad = (
	sudoku: Sudoku,
	{ rowIndex, colIndex }: { rowIndex: number; colIndex: number }
): TileGroup => {
	const getIds = quad => [3 * quad - 3, 3 * quad - 2, 3 * quad - 1];
	const [rowQuad, colQuad] = [
		Math.ceil((rowIndex + 1) / 3),
		Math.ceil((colIndex + 1) / 3),
	].map(getIds);

	let rt = [];
	for (let rowQuadIndex of rowQuad) {
		for (let colQuadIndex of colQuad) {
			if (rowQuadIndex !== rowIndex || colQuadIndex !== colIndex)
				rt = [...rt, sudoku[rowQuadIndex][colQuadIndex]];
		}
	}
	return rt;
};

const getRow = (
	sudoku: Sudoku,
	{ rowIndex, colIndex }: { rowIndex: number; colIndex: number }
): TileGroup => {
	return sudoku[rowIndex].filter((_, i) => i !== colIndex);
};

const getColumn = (
	sudoku: Sudoku,
	{ rowIndex, colIndex }: { rowIndex: number; colIndex: number }
): TileGroup => {
	let rt = [];
	for (let i = 0; i < 9; i++) {
		if (i !== rowIndex) rt = [...rt, sudoku[i][colIndex]];
	}
	return rt;
};

const iterate = (sudoku: Sudoku) => {
	return sudoku.map((row, rowIndex) =>
		row.map((tile, colIndex) => {
			if (isSolved(sudoku[rowIndex][colIndex])) {
				return tile;
			}
			const inRow = getRow(sudoku, { rowIndex, colIndex });
			const inCol = getColumn(sudoku, { rowIndex, colIndex });
			const inQuad = getQuad(sudoku, { rowIndex, colIndex });
			const blocked = findBlocked([...inRow, ...inCol, ...inQuad]);
			tile.possibles = tile.possibles.filter(
				possible => !blocked.includes(possible)
			);
			for (let set of [inRow, inCol, inQuad]) {
				for (let possible of tile.possibles) {
					if (isUnique(possible, set)) {
						tile.possibles = [possible];
						break;
					}
				}
			}
			return tile;
		})
	);
};

const solve = (sudoku: PreSudoku, iterateFor: number = 10): any => {
	let parsed = parse(sudoku);
	for (let i = 0; i < iterateFor; i++) {
		parsed = iterate(parsed);
		render(parsed);
	}
	return parsed;
};

const render = (sudoku: Sudoku) => {
	const allPossibles = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
	const color = i => ((i + 1) % 3 === 0 ? chalk.green : chalk.gray);

	const newLine = i => {
		process.stdout.write('  ');
		process.stdout.write(color(i)(new Array(3 * 3).fill('–--').join(' + ')));
		process.stdout.write('\n');
	};

	newLine(-1);
	sudoku.forEach((row, rowIndex) => {
		allPossibles.forEach((possibleRow, possibleRowIndex) => {
			process.stdout.write(color(-1)('| '));
			row.forEach((tile, colIndex) => {
				possibleRow.forEach((possible, possibleIndex) => {
					if (isSolved(tile)) {
						if (possibleIndex === 1 && possibleRowIndex === 1) {
							process.stdout.write(chalk.blue(tile.possibles[0].toString()));
						} else {
							process.stdout.write(' ');
						}
					} else {
						if (tile.possibles.includes(possible)) {
							process.stdout.write(possible.toString());
						} else {
							process.stdout.write(chalk.gray('x'));
						}
					}
				});
				process.stdout.write(color(colIndex)(' | '));
			});
			process.stdout.write('\n');
		});
		newLine(rowIndex);
	});
};

export { solve, render };

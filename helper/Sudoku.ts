export type PreSudoku = string[];

export type BlockedInQuad = {
	blockedRows: Set<number>;
	blockedCols: Set<number>;
};

export type Tile = BlockedInQuad & {
	possibles: Set<number>;
};

export type TileGroup = Tile[];
export type Quad = TileGroup[];
export type Sudoku = TileGroup[];

const smoosh = (input: any[][]): any[] =>
	input.reduce((a, b) => [...a, ...b], []);

const parse = (sudoku: PreSudoku): Sudoku => {
	return sudoku.map(row =>
		row.split('').map(number => {
			const numberAsNumber = parseInt(number);
			if (numberAsNumber !== 0) {
				return {
					possibles: new Set([numberAsNumber]),
					blockedRows: new Set(),
					blockedCols: new Set(),
				};
			} else {
				return {
					possibles: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]),
					blockedRows: new Set(),
					blockedCols: new Set(),
				};
			}
		})
	);
};

const isSolved = (tile: Tile): boolean => tile.possibles.size === 1;
const getSolution = (tile: Tile): number => [...tile.possibles][0];

const isSudokuSolved = (sudoku: Sudoku) =>
	smoosh(sudoku)
		.map(isSolved)
		.every(Boolean);

export { isSolved, isSudokuSolved, getSolution, smoosh, parse };

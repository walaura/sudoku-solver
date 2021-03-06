import {
	BlockedInQuad,
	Quad,
	TileGroup,
	Sudoku,
	isSolved,
	parse,
	getSolution,
	isSudokuSolved,
} from './helper/Sudoku';

const isUnique = (number, tileGroup: TileGroup): boolean =>
	tileGroup.filter(({ possibles }) => possibles.has(number)).length === 0;

const findNonPossibles = (tileGroup: TileGroup): number[] =>
	tileGroup.filter(isSolved).map(getSolution);

const findGridLocks = (tileGroup: TileGroup): number[][] => {
	const suspectify = (possibles: number[]) => possibles.sort().join('');
	const unsuspectify = (suspect: string): number[] =>
		suspect.split('').map(s => parseInt(s));

	let rt = [];
	const suspects = tileGroup
		.map(tile => suspectify([...tile.possibles]))
		.filter(s => s.length > 1);
	for (const suspect of suspects) {
		const len = suspects.filter(s => s === suspect).length;
		if (len === suspect.length) {
			rt.push(...unsuspectify(suspect));
		}
	}
	return rt;
};

const findBlockedInQuad = (
	quad: Quad,
	{ rowIndex, colIndex }: { rowIndex: number; colIndex: number }
): BlockedInQuad => {
	const getBlockedInGroup = (tiles, index) => {
		const group = tiles[getIndexWithinQuad(index)];
		const otherGroups = tiles
			.filter((_, i) => i !== getIndexWithinQuad(index))
			.flat();

		let rt = [];

		for (const number of group) {
			if (
				!otherGroups.includes(number) &&
				group.filter(n => n === number).length > 1
			) {
				rt.push(number);
			}
		}
		return new Set(rt);
	};

	const [rows, columns] = [
		[0, 1, 2].map(subRowIndex =>
			getRow(quad, { rowIndex: subRowIndex, colIndex: -1 })
		),
		[0, 1, 2].map(subColIndex =>
			getColumn(quad, { rowIndex: -1, colIndex: subColIndex })
		),
	].map(group =>
		group.map(tiles => tiles.map(({ possibles }) => [...possibles]).flat())
	);

	const rt = {
		blockedRows: getBlockedInGroup(rows, rowIndex),
		blockedCols: getBlockedInGroup(columns, colIndex),
	};
	return rt;
};

const getIndexWithinQuad = (i: number): number => i % 3;

const getQuad = (
	sudoku: Sudoku,
	{ rowIndex, colIndex }: { rowIndex: number; colIndex: number }
): Quad => {
	const getIds = quad => [3 * quad - 3, 3 * quad - 2, 3 * quad - 1];
	const [rowQuad, colQuad] = [
		Math.ceil((rowIndex + 1) / 3),
		Math.ceil((colIndex + 1) / 3),
	].map(getIds);

	let rt = [[], [], []];
	for (let rowQuadIndex of rowQuad) {
		for (let colQuadIndex of colQuad) {
			rt[getIndexWithinQuad(rowQuadIndex)] = [
				...rt[getIndexWithinQuad(rowQuadIndex)],
				sudoku[rowQuadIndex][colQuadIndex],
			];
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
	for (let i = 0; i < sudoku.length; i++) {
		if (i !== rowIndex) rt = [...rt, sudoku[i][colIndex]];
	}
	return rt;
};

const iterate = (sudoku: Sudoku): Sudoku => {
	return sudoku.map((row, rowIndex) =>
		row.map((tile, colIndex) => {
			/* 
			if it's solved our work here it's done
			*/
			if (isSolved(sudoku[rowIndex][colIndex])) {
				return tile;
			}

			/* 
			get some stuff
			*/
			let blocked = [];
			const quad = getQuad(sudoku, { rowIndex, colIndex });

			const inRow = getRow(sudoku, { rowIndex, colIndex });
			const inCol = getColumn(sudoku, { rowIndex, colIndex });
			const inQuad = quad.flat().filter(t => t !== tile);

			/* 
			Find all possible numbers & filter out which ones
			are "placed" already (this loop is how i do sudokus irl)
			*/
			blocked.push(...findNonPossibles([...inRow, ...inCol, ...inQuad]));

			/* 
			tiles can be 'grid locked' when within a set, there's 
			a pair with the same possibile #s. This means that
			pair is the only place in the set where those numbers will 
			appear and it's safe to block them
			*/
			for (const set of [inRow, inCol, inQuad]) {
				blocked.push(...findGridLocks(set));
			}

			for (const b of blocked) {
				tile.possibles.delete(b);
			}

			/*
			within quads a possible # in a row/col can be blocked for
			the rest of the quads in the board if it can only go
			in a row/col in that quad. 
			We preempt this work and pick it up on the next passes.
			*/
			tile = { ...tile, ...findBlockedInQuad(quad, { rowIndex, colIndex }) };

			/* 
			if there's only 1 tile in a group that can hold a solution 
			it has to be that one 
			*/
			for (const set of [inRow, inCol, inQuad]) {
				for (const possible of tile.possibles) {
					if (isUnique(possible, set)) {
						tile.possibles = new Set([possible]);
						break;
					}
				}
			}

			/*
			if a possible # is horizontally or vertically
			locked with more than 1 number we can assume it has a pair.
			we can do away with the rest of possible #s and turn them
			into a gridlock
			*/
			if ([...tile.blockedRows].filter(r => tile.possibles.has(r)).length > 1) {
				tile.possibles = new Set([...tile.blockedRows, ...tile.blockedCols]);
			}
			if ([...tile.blockedCols].filter(r => tile.possibles.has(r)).length > 1) {
				tile.possibles = new Set([...tile.blockedRows, ...tile.blockedCols]);
			}

			return tile;
		})
	);
};

const solve = (
	sudoku: Sudoku,
	{
		iterateUntil = 99,
		afterIteration = () => {},
	}: { iterateUntil?: number; afterIteration?: (Sudoku) => void }
): Sudoku => {
	let parsed = sudoku;
	for (let i = 0; i < iterateUntil; i++) {
		parsed = iterate(parsed);
		afterIteration(parsed);
		if (isSudokuSolved(parsed)) {
			break;
		}
	}
	return parsed;
};

export { iterate, parse };
export default solve;

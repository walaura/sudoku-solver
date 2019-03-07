import chalk from 'chalk';
import { Sudoku, isSolved, getSolution } from './helper/Sudoku';

const write = w => process.stdout.write(w);

const newLine = i => {
	write('  ');
	write(color(i)(new Array(3 * 3).fill('–--').join(' + ')));
	write('\n');
};

const color = i => ((i + 1) % 3 === 0 ? chalk.green : chalk.gray);

const blockedColor = (tile, possible) => {
	if (tile.blockedRows.has(possible) && tile.blockedCols.has(possible)) {
		return chalk.blue;
	} else if (tile.blockedRows.has(possible)) {
		return chalk.yellow;
	} else if (tile.blockedCols.has(possible)) {
		return chalk.magenta;
	}
	return c => c;
};

const draw = (sudoku: Sudoku) => {
	const allPossibles = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

	newLine(-1);
	sudoku.forEach((row, rowIndex) => {
		allPossibles.forEach((possibleRow, possibleRowIndex) => {
			write(color(-1)('| '));
			row.forEach((tile, colIndex) => {
				possibleRow.forEach((possible, possibleIndex) => {
					if (isSolved(tile)) {
						if (possibleIndex === 1 && possibleRowIndex === 1) {
							write(chalk.blue(getSolution(tile).toString()));
						} else {
							write(' ');
						}
					} else {
						if (tile.possibles.has(possible)) {
							write(blockedColor(tile, possible)(possible.toString()));
						} else {
							write(chalk.gray('x'));
						}
					}
				});
				write(color(colIndex)(' | '));
			});
			write('\n');
		});
		newLine(rowIndex);
	});
};

export default draw;

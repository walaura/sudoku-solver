import solve, { parse, iterate } from '../src/index';
import { PreSudoku } from '../src/helper/Sudoku';

export type MessageAction = 'load' | 'step' | 'solve';

let mySudoku;

onmessage = ({
	data: { type, sudoku },
}: {
	data: { type: MessageAction; sudoku: PreSudoku };
}) => {
	switch (type) {
		case 'load':
			mySudoku = parse(sudoku);
			postMessage({ type: 'step', sudoku: mySudoku });
			return;
		case 'step':
			mySudoku = iterate(mySudoku);
			postMessage({ type: 'step', sudoku: mySudoku });
			return;
		case 'solve':
			mySudoku = solve(mySudoku, {
				afterIteration: partial => {
					postMessage({ type: 'step', sudoku: partial });
				},
			});
			postMessage({ type: 'step', sudoku: mySudoku });
			postMessage({ type: 'done', sudoku: mySudoku });
			return;
	}
};

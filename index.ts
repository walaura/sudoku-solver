import solve from './solver';
import draw from './draw';

const sudoku = [
	'000000003',
	'634700000',
	'010006400',
	'360510000',
	'080000020',
	'000029016',
	'001200040',
	'000004731',
	'700000000',
];

solve(sudoku, {
	afterIteration: s => {
		process.stdout.write('\n');
		process.stdout.write('\n');
		process.stdout.write('\n');
		draw(s);
	},
});

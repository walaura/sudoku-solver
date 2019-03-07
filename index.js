require('@babel/register')({
	presets: [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'entry',
			},
		],
	],
});

const { solve, render } = require('./solver.ts');
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

render(solve(sudoku, 33));

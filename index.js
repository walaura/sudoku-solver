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
	'002100000',
	'040000560',
	'010030007',
	'000000004',
	'005060200',
	'100000000',
	'300070010',
	'029000030',
	'000004800',
];

render(solve(sudoku, 10));

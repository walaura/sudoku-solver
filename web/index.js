import { html, render } from 'lit-html';

const myWorker = new Worker('./worker.ts');

const Tile = ({ possibles }) =>
	html`
		<x-tile data-is-big="${possibles.size === 1}"
			>${possibles.size === 1
				? [...possibles][0]
				: [...possibles].map(p => html`<x-small>${p}</xsmall>`)}</x-tile
		>
	`;

const Board = tiles =>
	html`
		<x-board>${tiles}</x-board>
	`;

const Controls = () => html`
	<x-controls>
		<button
			data-solve
			@click=${() => {
				myWorker.postMessage({ type: 'solve' });
			}}
		>
			Solve
		</button>
		<button
			@click=${() => {
				myWorker.postMessage({ type: 'step' });
			}}
		>
			Step
		</button>
	</x-controls>
`;

myWorker.onmessage = ({ data: { type, sudoku } }) => {
	render(
		[
			html`<x-board-holder>${Board(
				sudoku.flat().map(({ possibles }) => Tile({ possibles }))
			)}</>`,
			Controls(),
		],
		document.querySelector('#app')
	);
};

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
myWorker.postMessage({ type: 'load', sudoku });

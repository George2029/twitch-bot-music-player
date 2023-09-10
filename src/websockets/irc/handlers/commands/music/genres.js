import mpc from './../../../mpc.js';

export let genresDocs = `Displays all unique genres in the audio library`;

export let genres = () =>
	new Promise( async (res, rej) => {
		let genres = await mpc.api.db.list('genre');
		let str = `Total: ${genres.length}. ${genres.map(({genre}, idx) => `${idx+1}. ${genre}`).join(' ')}`.slice(0, 500);
		return res(str);
	});


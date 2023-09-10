import mpc from './../../../mpc.js';

export let artists = () =>
	new Promise( async (res, rej) => {
		let artists = await mpc.api.db.list('artist');
		let str = `Total: ${artists.length}. ${artists.map(({artist}, idx) => `${idx+1}. ${artist}`).join(' ')}`.slice(0, 500);
		return res(str);
	});

import mpc from './../../../mpc.js';

//how many tracks are in the directory at the moment;

export let tracks = () =>
	new Promise(async (res, rej) => {
		let {songs} = await mpc.api.status.stats() ;
		return res(songs);
	});

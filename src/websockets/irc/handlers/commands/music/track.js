import mpc from './../../../mpc.js';

//displays the current track's info
export let track = () =>
	new Promise( async (res, rej) => {
		let current_song = await mpc.api.status.currentsong();
		if (!current_song) return res('Nothing is playing at the moment.');
		let {title, artist, genre} = current_song;
		return res(`"${title}" by ${artist}. #${genre}`);
	});
		

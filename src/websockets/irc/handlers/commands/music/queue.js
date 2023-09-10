import mpc from './../../../mpc.js';

export let queueDocs = `Displays the total amount of tracks in the queue and info about last 10 ones.`

export let queue = () =>
	new Promise (async (res, rej) => {
		let queue = await mpc.api.queue.info();
		if(queue.length === 0) {
			return res('Nothing is playing right now');
		} 
		let result = `Total: ${queue.length}. ${queue.slice(0, 10)
			.map((track, idx) => `${idx+1}. "${track.title}" by ${track.artist}`)
			.join(' ')}`.slice(0, 500);
		return res(result);
	});

import isFollower from './../../requests/isFollower.js';
import db from './../../../../db.js'
import createUser from './../../db/createUser.js';
import acceptPayment from './../../db/acceptPayment.js';
import mpc from './../../../mpc.js';
import {playCost, insertCost, initIncome} from './../config.js';

let delimiter = '@';

let description = `For followers only. ${playCost}/${insertCost} points per song for !play(F)/!insert(F). *MUSIC PLAYER* USAGE: ![play/playF/insert/insertF] [arguments]. 'F' at the end of a command enforces strict search, i.e. a song will be found only if all parameters are matching exactly. !play adds a track to the end of the queue, !insert - adds to the beginning; If there are no arguments, random song appended. If argument starts with '@' or '#' random [artist/genre] song appended respectively. Case insensitive.`;

export let appendToQueueDocs = description;

let addToQueueAndPlay = async (file, name) => {
	if(name === 'insert') {
		let currentSong = await mpc.api.status.currentsong();
		if(!currentSong) {
			await mpc.api.queue.add(file, 0)
		} else {
			await mpc.api.queue.add(file, 1);
		}
		return mpc.api.playback.play();
	} else {
		await mpc.api.queue.add(file);
		return mpc.api.playback.play();
	}
}

let isResultBad = (searchResult) => {
	if(searchResult.length === 0) return 'Not found';
	if(searchResult.length > 1) {
		let str = searchResult
			.slice(0, 5)
			.map((song, idx) => `${idx+1}. "${song.title}" by ${song.artist}`)
			.join(' | ')
		return `More than 1 track found. ${str} `.slice(0, 500);
	}
	return false;
}

let getSearchStr = (params, searchMethod) => {
	let [title, artist] = params.split(delimiter).map(e=>e.trim());
	if (title) {
		if (artist) {
			return `((title ${searchMethod} "${title}") AND (artist ${searchMethod} "${artist}"))`;
		} else {
			return `(title ${searchMethod} "${title}")`;
		}
	} else {
		return false;
	}
}

export let appendToQueue = ({user: {user_id, user_login}, user_type: {broadcaster}, name, params}) =>
	new Promise( async (res, rej) => {

		if(broadcaster || await isFollower(user_id)) {

			let searchMethod = name.includes('F') ? '==' : 'contains';
			let cost = name.includes('play') ? playCost : insertCost;

			let followerInDb = await db.collection('users').findOne({user_id});	

			if (!followerInDb) {
				await createUser(user_id, user_login);
				followerInDb = {points: initIncome};	
			}

			if (followerInDb.points < cost) return res('No money:(');
			params = params?.replaceAll('"', '');

			let all_tracks, track;

			switch (params?.[0]) {

				case undefined: // random song
					all_tracks = await mpc.api.db.search('(title contains "")');			
					track = all_tracks[Math.floor(Math.random() * all_tracks.length)];
					break;

				case '@': // random artist song 
					let artist = params.split('@')[1];
					artist = artist.trim();	
					if (!artist) return res(description);
					all_tracks = await mpc.api.db.search(`(artist ${searchMethod} "${artist}")`)
					if(!all_tracks.length) return res('Not Found');
					track = all_tracks[Math.floor(Math.random() * all_tracks.length)];
					break;

				case '#': // random genre song
					let genre = params.split('#')[1];
					genre = genre.trim();	
					if (!genre) return res(description);
					all_tracks = await mpc.api.db.search(`(genre ${searchMethod} "${genre}")`)
					if(!all_tracks.length) return res('Not found');
					track = all_tracks[Math.floor(Math.random() * all_tracks.length)];
					break;

				default: // specific song 
					let searchStr = getSearchStr(params, searchMethod);
					let searchResult = await mpc.api.db.search(searchStr); 	
					let badResult = isResultBad(searchResult);
					if (badResult) return res(badResult);
					track = searchResult[0];
			}

			await acceptPayment(user_id, cost);
			await addToQueueAndPlay(track.file, name);

			let resp = name === 'play' ? 
				`appended "${track.title}" to the queue` : 
				`appended "${track.title}" to the beginning of the queue`;
			return res(resp);

		} else {
			return res('For followers only')
		}
	})
		


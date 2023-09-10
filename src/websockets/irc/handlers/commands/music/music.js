import mpc from './../mpc.js';
import logger from './../../../utils/logger.js';
import db from './../../db.js';

let description = `
	A music command has 3 subcommands: 
		add (append a track to the end of queue),
		insert (append a track in the beginning of the queue, to be played next),
		skip (skip a song)
	To add or insert a specific track you need to enter a name of a song first, then, optionally, you may add artist's name, using  ' / ' (slash) separator.
	Example of usage: '!music add lose yourself / eminem'
`;

let users = {};
export default (command, params, user_id, user_login) =>

	new Promise ( async (res, rej) => {

		switch (command) {
			case 'queue': 
				let queue = await mpc.api.queue.info();
				if(queue.length === 0) {
					return res('Nothing is playing right now');
				} 
					
				let answer = queue.slice(0, 5)
					.map((song, idx) => `${idx+1}. "${song.title}" by ${song.artist}`)
					.join(' | ');
				answer += ` In total: ${queue.length}`;
				return res(answer);
			case 'play':
			case 'insert':	
					while(users[user_id]) {
						logger('irc', 'waiting', 'error');
						setTimeout(()=>{}, 500);
					}
					users[user_id] = true;
					logger('irc', `${command.botCommand} is ready to make the 1st req to db for ${nick}`, 'warning');
					let user = await db.collection('users').findOne({user_id});
					logger('irc', `${command.botCommand} has just found the ${nick}`, 'warning');
					if(!user) {
						await giveInitialCapital(user_id, nick); 
						logger('irc', `${command.botCommand} has just given the initcap to ${nick}`, 'warning');
						user = {points: 1000};
					}
					let cost;
					switch (command.botCommand) {
						case 'play':
							cost = 100;
							break;
						case 'insert':
							cost = 400;
							break;
						case 'skip':
							cost = 500;
					}
					if(user.points < cost) {
						users[user_id] = false;
						return res(`Not enough Clon Coins, fellaw, gotta have ${cost}`);
					} else {
						//await db.collection('users').updateOne({user_id}, {$set: {points: user.points - cost}}); 
						//	logger('irc', `${command.botCommand} has just updated the ${nick}`, 'warning');
						//users[user_id] = false;
						//return res(music_handler(command.botCommand, command.botCommandParams));
					

						let cleanedParams = params?.replaceAll('"', '');
						let searched;
						let [song, artist] = cleanedParams.split('/');	
						song = song.trim();
						if (artist) {
							artist = artist.trim();
						}
						if (artist) { 
							searched = await mpc.api.db.search(`((title contains "${song}") AND  (artist contains "${artist}"))`);
						} else {
							searched = await mpc.api.db.search(`(title contains "${song}")`);
						}

						if (searched.length === 0) {
							return res('not found');
						}
						if (searched.length !== 1) {
							let findings = searched.slice(0, 5).map((song, idx) => `${idx+1}. "${song.title}" by ${song.artist}`).join(' | ');
							return res(`More than 1 track found. ${findings} `.slice(0, 500));
						} else {
							let track = searched[0];
							if(command === 'play') {
								await mpc.api.queue.add(track.file);
								await mpc.api.playback.play();
								return res(`appended "${track.title}" to the queue`);
							} else {
								await mpc.api.queue.add(track.file, 0);
								await mpc.api.playback.play();
								return res(`inserted "${track.title}" to the queue`);
							}
						}
					}
			case 'skip':
				let current_song = await mpc.api.status.currentsong();
				if (current_song) {
					await mpc.api.playback.next();
					logger('mpc', `skipped "${current_song.title}"`, 'good');
					return res(`skipped the "${current_song.title}"`);
				} else {
					return res('What is there to skip... nothing is playing...');
				}
		}
	});

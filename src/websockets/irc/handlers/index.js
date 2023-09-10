// main command handler

import * as commands from './commands/index.js';

let activeUsers = {};

export default 
	({
		command: {botCommand: name, botCommandParams: params}, 
		tags: {
			user_id, 
			mod, 
			broadcaster,
			vip
		},
		source: {nick: user_login}
	}) => {  
		return new Promise( async (res, rej) => {
			if (activeUsers[user_id]) return res(`You're sending messages too quickly`);
			activeUsers[user_id] = true;
			let result;
			const commandData = {
				user: {user_id, user_login},
				user_type: {vip, mod, broadcaster},
				name,
				params
			}
			switch (name) {

				case 'docs':

				case 'genres':
				case 'artists':
				case 'tracks':
				case 'track':
				case 'play':
				case 'playF':
				case 'insert':
				case 'insertF':
				case 'skip':
				case 'queue':
					result = await commands[name](commandData);
					break;
   		 	}

			activeUsers[user_id] = null;
			return res(result);
		})
	}

import mpc from './../../../mpc.js';
import db from './../../../../db.js';
import isFollower from './../../requests/isFollower.js';
import createUser from './../../db/createUser.js';
import acceptPayment from './../../db/acceptPayment.js';
import {skipCost, pointsTitle, initIncome} from './../config.js';

export let skipDocs = `${skipCost} ${pointsTitle} per song. Skips the current song`;

export let skip = ({user: {user_id, user_login}, user_type: {broadcaster}}) =>
	new Promise (async (res, rej) => {
		if (broadcaster || await isFollower(user_id)) {
			let follower = await db.collection('users').findOne({user_id});
			if(!follower) {
				await createUser(user_id, user_login);
				follower = {points: initIncome};
			}
			if (follower.points < skipCost) {
				return res(`Not enough money`);
			} else {
				let track = await mpc.api.status.currentsong();
				if(!track) return res('Nothing to skip');
				await acceptPayment(user_id, skipCost); 
				await mpc.api.playback.next();
				return res(`skipped "${track.title}"`);
			}
		} else {
			return res('Only for followers');
		}
	});
			

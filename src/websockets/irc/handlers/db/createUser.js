import db from './../../../db.js';

export default (user_id, user_login) =>
		 db.collection('users').insertOne({
				user_id, 
				user_login, 
				points: 1000, 
				last_points_reception: new Date(), 
				smurfs: [user_login],
				followed_at: new Date(), 
			}); 

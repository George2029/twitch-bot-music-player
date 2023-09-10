// returns false if a chatter is not a follower, true if they are

export default (userId) => 
	new Promise (async (res, rej) => {
		let url = new URL('https://api.twitch.tv/helix/channels/followers');
		url.search = new URLSearchParams([
			['broadcaster_id', process.env.broadcaster_id],
			['user_id', userId]
		]);
		fetch(url,
			{
				method: 'GET',
				headers: {
					"Client-ID": process.env.client_id,
					"Authorization": `Bearer ${process.env[`${process.env.bot}_access_token`]}`
				}
			}
		)
		.then(r=>r.json()
			.then(data=> {
				if(r.status == 200) {
					return res(!!data.data.length);
				} else return rej(data.message);
			})
		)
	}) 

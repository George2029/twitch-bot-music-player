import mpdapi from 'mpd-api' // music player client which connects locally to music player daemon

const mpc = await mpdapi.connect({
	host: process.env.mpd_host, 
	port: process.env.mpd_port, 
	password: process.env.mpd_password
})

export default mpc;

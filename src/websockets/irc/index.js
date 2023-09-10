import ws from 'ws';
import logger from './../../utils/logger.js';
import irc_message_parser from './../../utils/irc_message_parser.js';
import commandHandler from './handlers/index.js';
import mpdapi from 'mpd-api' // music player client which connects locally to music player daemon
import {internetCheck} from './../../utils/internetCheck.js';

class InternetRelayChatWebSocket extends ws {
	static reconnect_url = 'ws://irc-ws.chat.twitch.tv:80';
	static mpc;
	constructor(url) {

		return (async () => {

			super(url);
			
			if(!InternetRelayChatWebSocket.mpc) {
				InternetRelayChatWebSocket.mpc = await mpdapi.connect({
					host: process.env.mpd_host, 
					port: process.env.mpd_port, 
					password: process.env.mpd_password
				});
				await InternetRelayChatWebSocket.mpc.api.playback.consume(1);
				logger('mpc', 'Connected', 'good');
			}

			this.on('error', this.onError);
			this.on('message', this.onMessage);
			this.on('open', this.onOpen);
			this.on('close', this.onClose);

			return this;

		}) ();

	}

	async onClose (msg) {
		logger('irc', 'Closed', 'error');
		console.log(msg);
		clearInterval(this.playMusicInterval);
		clearTimeout(this.pingTimeout);
		await InternetRelayChatWebSocket.mpc.api.playback.pause();
		InternetRelayChatWebSocket.mpc.removeAllListeners('system');
		await internetCheck();
		this.newConnection = await new InternetRelayChatWebSocket(InternetRelayChatWebSocket.reconnect_url); 
		logger('irc', 'Created a new instance of oneself', 'error');
	}

	onError (err) {
		console.log('AAAAAAAAAAAAAAAAAAAAA EEEEEEERRRRRRRROOOOOOOOOORRRRRRRR');
		console.log(err);
		this.close();
	}

	onOpen () {
		this.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands');
    	this.send(`PASS oauth:${process.env[`${process.env.bot}_access_token`]}`);
   		this.send(`NICK ${process.env.bot}`);
		this.send(`JOIN #${process.env.broadcaster}`);

		logger('irc', 'Connected', 'good');
		this.say(`Here!`);
		InternetRelayChatWebSocket.mpc.on('system', this.onMpcSystem.bind(this));
		this.playMusic();
	}

	async onMessage (ircMessage) {
		let rawIrcMessage = ircMessage.toString().trim();
		let messages = rawIrcMessage.split('\r\n');
		messages.forEach( async msg => {
			let parsed_message = irc_message_parser(msg);
			if (parsed_message) {
				let {command: {command: irc_command, botCommand, botCommandParams}, source, tags} = parsed_message;
				if(irc_command === 'PING') return this.onPing(); 
				if (botCommand) {
					let paramsLog = botCommandParams ? `with the following input: ${botCommandParams}` : '';
					logger('user', `${source.nick} uses !${botCommand} ${paramsLog}`, 'user_input');
					let res = await commandHandler(parsed_message);
					if (res !== undefined) {
						this.reply(res, tags.id);
					}
				} 
			}
		});
	}

	
	
	async onMpcSystem (msg) {
		// outputs a new current song in the chat 
		logger('mpc', msg, 'warning');
		if(msg === 'player'){
			let song = await InternetRelayChatWebSocket.mpc.api.status.currentsong();
			if(song) {
				this.say(`Current song: "${song.title}" by ${song.artist}`);
			} else {
				this.say('Stopped playing');
			}
		}
	}

	async playMusic () {

		// every 5 min add some random tracks to the queue if it has less than 4 tracks

		let fn = async () => {
			let queue = await InternetRelayChatWebSocket.mpc.api.queue.info();
			if (queue.length >= 4) {
				logger(`mpc`, `queue check`, `warning`);
				return await InternetRelayChatWebSocket.mpc.api.playback.play();
			}
			let numberOfTracksToAdd = 4-queue.length;
			let total = await InternetRelayChatWebSocket.mpc.api.db.search(`(title contains "")`);
			[...Array(numberOfTracksToAdd)].forEach(async ()=>{
				await InternetRelayChatWebSocket.mpc.api.queue.add(total[Math.floor(Math.random() * total.length)].file)
			}) 	
			await InternetRelayChatWebSocket.mpc.api.playback.play();
			logger(`mpc`, `Appended ${numberOfTracksToAdd} track(s)`, `good`);
		}

		fn();
		this.playMusicInterval = setInterval(fn, 1000*60*5);
	}

	onPing() {
		// If the server does not ping for >5 minutes, reconnect
		clearTimeout(this.pingTimeout);
		this.send('PONG :tmi.twitch.tv');
		logger('irc', 'Ping-Pong', 'warning');
		this.pingTimeout = setTimeout(() => {
			logger('irc', 'DIDNOT RECEIVE PING FOR MORE THAN 5 MIN. RECONNECTING', 'error');	
			this.terminate();
		}, 1000 * 60 * 5);
		return;
	}

	say (msg) {
		try {
			this.send(`PRIVMSG #${process.env.broadcaster} :${msg}`);
		} catch (err) {
			console.error(err);
		}
	}

	reply (msg, id) {
		try {
			this.send(`@reply-parent-msg-id=${id} PRIVMSG #${process.env.broadcaster} :${msg}`);
		} catch (err) {
			console.error(err);
		}
	}



}

export default InternetRelayChatWebSocket;

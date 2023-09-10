import chalk from 'chalk';
import fs from 'fs';

const esws = chalk.magenta;
const mpc = chalk.hex('#ccff00');
const irc = chalk.bold.cyan;
const user = chalk.blue;
const auth = chalk.red;
const inet = chalk.red.bold;

const error = chalk.bold.red;
const warning = chalk.hex(`#FFA500`); // orange
const good = chalk.green;
const user_input = chalk.italic.cyan;
const mpc_msg = chalk.bgBlue;
const reconnecting = chalk.hex(`#f72d00`);

const timestyle = chalk.blue;

export default (from, msg, theme) => {
	let date = new Date();
	let timestamp = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}:${date.getMilliseconds().toString().padStart(3, '0')}`
	let styled_timestamp = timestyle(timestamp);
	let styled_source;
	let styled_msg;

	switch (from) {
		case 'esws': 
			styled_source = esws(from);
			break;
		case 'irc': 
			styled_source = ' '+irc(from);
			break;
		case 'mpc':
			styled_source = ' '+mpc(from);
			break;
		case 'user':
			styled_source = user(from);
			break;
		case 'auth':
			styled_source = auth(from);
		case 'inet':
			styled_source = inet(from);
	}

	switch (theme) {
		case 'error':
			styled_msg = error(msg); 
			break;
		case 'warning':
			styled_msg = warning(msg);
			break;
		case 'good':
			styled_msg = good(msg);
			break;
		case 'user_input':
			styled_msg = user_input(msg);
			break;
		case 'reconnecting':
			styled_msg = reconnecting(msg);
			break;
		case 'mpc':
			styled_msg = mpc_msg(msg);
	}	

	let log = `${styled_timestamp} | ${styled_source} : ${styled_msg}`;

	fs.appendFile('file.log', `${timestamp} | ${from.padStart(4)} | ${msg}\n`, err => {
  		if (err) {
   			console.error(err);
  		}
  		// done!
	});

	console.log(log);
}

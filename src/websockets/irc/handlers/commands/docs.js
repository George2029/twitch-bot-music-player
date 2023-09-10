import {appendToQueueDocs} from './music/appendToQueue.js';
import {skipDocs} from './music/skip.js';

export let docs = ({params}) => {
	if(!params) return; 
	switch (params) {
		case 'play':
		case 'playF':
		case 'insert':
		case 'insertF':
			return appendToQueueDocs;
		case 'skip':
			return skipDocs;
	}
}	

// ** docs **

export {docs} from './docs.js';

// ** music-info **

export {queue} from './music/queue.js';
export {track} from './music/track.js';
export {tracks} from './music/tracks.js';
export {artists} from './music/artists.js';
export {genres} from './music/genres.js';

// === folowers only: ===

import {appendToQueue} from './music/appendToQueue.js';
export let insert = appendToQueue;
export let play = appendToQueue;
export let playF = appendToQueue;
export let insertF = appendToQueue;
export {skip} from './music/skip.js';


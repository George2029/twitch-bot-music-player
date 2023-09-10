import db from './../../../db.js';

export default (user_id, payment) => db.collection('users').updateOne({user_id}, {$inc: {points: -payment}}); 

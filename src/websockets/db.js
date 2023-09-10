import {MongoClient} from 'mongodb';
const url = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(url)
export default client.db('bot');

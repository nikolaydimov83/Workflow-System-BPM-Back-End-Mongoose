const path = require('path');

const CONNECTION_STRING='mongodb://localhost:27217,localhost:27218,localhost:27219/eurobankApp2?replicaSet=myReplicaSet1'
const PORT = 3030;
const IP_ADDRESS="122.0.0.1";
const FRONT_END_IP_ADDRESS="122.0.0.1:3000";

//Check if the server is run by the binary in order to find the correct base dir
const isPkg = typeof process.pkg !== 'undefined';
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;
const filePathCert = path.join(baseDir, 'keys', 'your-cert.pem');
const filePathKey = path.join(baseDir, 'keys', 'your-private-key.pem');

module.exports={CONNECTION_STRING,baseDir,filePathCert,filePathKey,PORT,IP_ADDRESS,FRONT_END_IP_ADDRESS}
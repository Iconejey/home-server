const express = require('express');
const fs = require('fs');
const url = require('url');

let code = null;

fs.readFile('./code', 'utf8', (err, data) => {
	let err_mess = '\033[33mNO CODE WILL BE REQUIRED !\033[0m';
	if (err) console.error(err.message + '\n' + err_mess);
	if (data == 'none') console.log(err_mess);
	else {
		console.log('Required code: \033[32m' + data + '\033[0m');
		code = data;
	}
});

let app = express();

app.use('/', express.static(__dirname + '/public'));

app.get('/cmd/', (req, res) => {
	let params = url.parse(req.url, true).query;
	if (code && params.code != code) console.log('Wrong code given for \033[32m"' + params.cmd + '"\033[0m cmd: \033[31m' + params.code + '\033[0m');
	// res.writeHead(302, { Location: '/' });
	res.end();
});

// fs.readFile('/etc/hosts', 'utf8', function (err, data) {
// 	if (err) return console.log(err);
// 	console.log(data);
// });

let server = app.listen(5555);
console.clear();
console.log('server up..');

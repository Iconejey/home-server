const express = require('express');
const fs = require('fs');
const url = require('url');

let code = null;
let commands = [];

fs.readFile('./code', 'utf8', (err, data) => {
	let err_mess = '\033[33mNO CODE WILL BE REQUIRED !\033[0m';
	if (err) console.error(err.message + '\n' + err_mess);
	if (data == 'none') console.log(err_mess);
	else {
		console.log('Required code: \033[32m' + data + '\033[0m');
		code = data;
	}
	console.log();
});

fs.readFile('./commands', 'utf8', (err, data) => {
	let err_mess = '\033[33mNO COMMANDS WILL BE AVAILABLE !\033[0m';
	if (err) console.error(err.message + '\n' + err_mess);
	if (data == 'none') console.log(err_mess);
	else {
		for (let line of data.split('\n')) {
			let cmd = line.split(' ');
			commands.push({ device: cmd[0], action: cmd[1], icon: cmd[2], color: cmd[3], data: cmd[4] });
		}

		console.log(commands.length + ' available commands:');
		for (let cmd of commands) console.log('\033[35m' + cmd.device + ': ' + cmd.action + '\033[0m');
	}
	console.log();
});

let app = express();

const inject = device => {
	let html = `
		<h2>${device}:</h2>
		<div id="${device}">
	`;

	for (let cmd of commands.filter(cmd => cmd.device == device)) {
		html += `<a href='./cmd?code=${code}&cmd=${cmd.device}_${cmd.action}' style="background-color: ${cmd.color}">`;
		if (cmd.icon != 'none') html += `<i class="material-icons md-64">${cmd.icon}</i>`;
		html += `</a>`;
	}

	return html + `</div>`;
};

app.get('/', (req, res) => {
	let params = url.parse(req.url, true).query;

	let html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Home Control</title>
				<link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet" />
				<style>
					* {
						padding: 0px;
						margin: 0px;
						box-sizing: border-box;
					}

					h1 {
						text-align: center;
						margin-top: 24px;
					}

					h1, h2 {
						padding: 10px;
						font-family: monospace;
					}
					
					#clim,
					#lumière {
						display: flex;
						flex-wrap: wrap;
					}
					
					a {
						width: 48px;
						height: 48px;
						border-radius: 24px;
						margin: 10px;
						color: #333;
					}

					.material-icons.md-64 {
						font-size: 48px;
					}	
				</style>
			</head>
			<body>
				<h1>Home Control</h1>
	`;

	if (code && params.code == code) {
		html += inject('clim') + inject('lumière');
	} else {
		html += `<p>Error: Wrong code.</p>`;
		console.log('\033[31mWrong code "' + params.code + '" given for cmd: "' + params.cmd + '"\033[0m');
	}

	html += `
			</body>
		</html>
	`;

	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end(html);
});

app.get('/cmd/', (req, res) => {
	let params = url.parse(req.url, true).query;

	if (code && params.code == code) console.log('\033[35mCommand: "' + params.cmd + '"\033[0m');
	else console.log('\033[31mWrong code "' + params.code + '" given for cmd: "' + params.cmd + '"\033[0m');

	res.writeHead(302, { Location: '/?code=' + code });
	res.end();
});

let server = app.listen(5555);
console.clear();
console.log('server up..');

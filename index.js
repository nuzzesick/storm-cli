const express = require('express');
const path = require('path');
const OS = require('opensubtitles-api');
const open = require('open');
const app = express();
const port = 3000;
const { getUserData, getUserInput, getMovieTorrent, startDownloadingTorrent } = require('./utils');

app.use(express.static(path.join(__dirname, '')));

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'include');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.get('/', (req, res) => {
	res.send('index.html');
});

app.listen(port);

const main = async () => {
	console.log('storm-cli\n');
	console.log('Enter your OpenSubtitles.org credentials: \n');
	const data = await getUserData();
	const { username, password } = data;
	const OpenSubtitles = new OS({
		useragent:'UserAgent',
		username: username,
		password: password,
		ssl: true,
	});
	const { input: movieId } = await getUserInput('enter a movie', 'IMDbID');
	const hash = await getMovieTorrent(movieId);
	const { input: language } = await getUserInput('enter a language', 'lang');
	const allSubs = await OpenSubtitles.search({ imdbid: movieId });
	const { vtt } = await allSubs[language];
	await open(`http://localhost:${port}?hash=${hash}&sub=${vtt}`);
	await startDownloadingTorrent(hash);
};

main();
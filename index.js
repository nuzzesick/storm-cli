const express = require('express');
const path = require('path');
const OS = require('opensubtitles-api');
const open = require('open');
const app = express();
const port = 3000;
const { getUserData, getUserInput, getMovieTorrent, startDownloadingTorrent } = require('./utils');

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
	res.send('index.html');
});

app.listen(port);

const main = async () => {
	const data = await getUserData();
	const { username, password } = data;
	const OpenSubtitles = new OS({
		useragent:'UserAgent',
		username: username,
		password: password,
		ssl: true,
	});
	const { input: movieId } = await getUserInput('Enter a movie', 'IMDbID');
	const hash = await getMovieTorrent(movieId);
	const { input: language } = await getUserInput('Enter a language', 'lang');
	const allSubs = await OpenSubtitles.search({ imdbid: movieId });
	const { vtt } = await allSubs[language];
	await open(`http://localhost:${port}?hash=${hash}&sub=${vtt}`);
	await startDownloadingTorrent(hash);
};

main();
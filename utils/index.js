const prompt = require('prompt');
const fetch = require('node-fetch');
const WebTorrent = require('webtorrent-hybrid');

const getUserData = async () => {
	const schema = {
    properties: {
      username: {
        required: true,
        description: 'username',
      },
      password: {
        hidden: true,
				required: true,
        description: 'password',
      },
    },
  };
  prompt.message = 'OpenSubtitles credentials';
	const { username, password } = await prompt.get(schema);
	return { username, password };
};

const getUserInput = async (message, type) => {
	const schema = {
    properties: {
      input: {
        required: true,
        description: type,
      },
    },
  };
  prompt.message = message;
	const { input } = await prompt.get(schema);
	return { input };
};

const getMovieTorrent = async (movieId) => {
  try {
    const res = await fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${movieId}`);
    const { data: { movies } } = await res.json();
    const { torrents } = await movies[0];
    return torrents[1].hash;
  } catch (error) {
    console.error(error);
  };
};

const startDownloadingTorrent = (hash) => {
  return new Promise ((resolve) => {
    const client = new WebTorrent();
    const magnetURI = hash;
    client.add(magnetURI, { path: 'torrents' }, (torrent) => {
      console.log('Download started...\n');
      console.log('You can watch the movie while is downloading!\n');
      torrent.on('done', () => {
        console.log('Download finished');
        client.seed('torrents', (torrent) => {
          console.log('Client is seeding ' + torrent.magnetURI);
          resolve();
        });
      });
    });
  });
};

module.exports = { getUserData, getUserInput, getMovieTorrent, startDownloadingTorrent };
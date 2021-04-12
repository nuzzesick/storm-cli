const date = new Date().getFullYear();
const $date = document.querySelector("#date");
$date.innerHTML = date;

const params = new URL(document.location).searchParams;

const hash = params.get("hash").toLowerCase();
const sub = params.get("sub");

const torrentId = `magnet:?xt=urn:btih:${hash}&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com`;

const client = new WebTorrent();

// HTML elements
const $body = document.body;
const $progressBar = document.querySelector("#progressBar");
const $numPeers = document.querySelector("#numPeers");
const $downloaded = document.querySelector("#downloaded");
const $total = document.querySelector("#total");
const $remaining = document.querySelector("#remaining");
const $uploadSpeed = document.querySelector("#uploadSpeed");
const $downloadSpeed = document.querySelector("#downloadSpeed");

// Download the torrent
client.add(torrentId, function (torrent) {
  // Torrents can contain many files. Let's use the .mp4 file
  const file = torrent.files.find(function (file) {
    return file.name.endsWith(".mp4");
  });

  // Stream the file in the browser
  file.appendTo("#output");
  const video = document.getElementsByTagName("video")[0];
  video.setAttribute("crossorigin", "anonymous");
  video.setAttribute("autoplay", "true");
  let track = document.createElement("track");
  track.setAttribute("src", sub);
  video.appendChild(track);

  // Trigger statistics refresh
  torrent.on("done", onDone);
  setInterval(onProgress, 500);
  onProgress();

  // Statistics
  function onProgress() {
    // Peers
    $numPeers.innerHTML =
      torrent.numPeers + (torrent.numPeers === 1 ? " peer" : " peers");

    // Progress
    const percent = Math.round(torrent.progress * 100 * 100) / 100;
    $progressBar.style.width = percent + "%";
    $downloaded.innerHTML = prettyBytes(torrent.downloaded);
    $total.innerHTML = prettyBytes(torrent.length);

    // Remaining time
    let remaining;
    if (torrent.done) {
      remaining = "Done.";
    } else {
      remaining = moment
        .duration(torrent.timeRemaining / 1000, "seconds")
        .humanize();
      remaining =
        remaining[0].toUpperCase() + remaining.substring(1) + " remaining.";
    }
    $remaining.innerHTML = remaining;

    // Speed rates
    $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + "/s";
    $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + "/s";
  }
  function onDone() {
    $body.className += " is-seed";
    onProgress();
  }
});

// Human readable bytes util
function prettyBytes(num) {
  let exponent,
    unit,
    neg = num < 0,
    units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  if (neg) num = -num;
  if (num < 1) return (neg ? "-" : "") + num + " B";
  exponent = Math.min(
    Math.floor(Math.log(num) / Math.log(1000)),
    units.length - 1
  );
  num = Number((num / Math.pow(1000, exponent)).toFixed(2));
  unit = units[exponent];
  return (neg ? "-" : "") + num + " " + unit;
}

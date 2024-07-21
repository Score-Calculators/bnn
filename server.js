const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/resolutions', async (req, res) => {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const thumbnailUrl = info.videoDetails.thumbnails.pop().url;

        const videoFormats = ytdl.filterFormats(info.formats, 'video')
            .filter(format => format.qualityLabel && ['144p', '240p', '360p', '480p', '720p', '1080p'].includes(format.qualityLabel))
            .map(format => ({
                url: format.url,
                qualityLabel: format.qualityLabel,
                container: format.container,
                size: (format.contentLength ? (format.contentLength / (1024 * 1024)).toFixed(2) : 'Unknown') + ' MB'
            }));

        const audioFormats = ytdl.filterFormats(info.formats, 'audio')
            .map(format => ({
                url: format.url,
                qualityLabel: format.audioQuality,
                container: format.container,
                size: (format.contentLength ? (format.contentLength / (1024 * 1024)).toFixed(2) : 'Unknown') + ' MB'
            }));

        res.json({ 
            title: info.videoDetails.title, 
            thumbnailUrl, 
            videoFormats,
            audioFormats 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get video info' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

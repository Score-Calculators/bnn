document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('menu');

    hamburger.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
});

document.getElementById('download-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const url = document.getElementById('url').value;
    const message = document.getElementById('message');
    const videoInfo = document.getElementById('video-info');
    const videoTitle = document.getElementById('video-title');
    const thumbnail = document.getElementById('thumbnail');
    const videoResolutionsContainer = document.getElementById('video-resolutions-container');
    const audioResolutionsContainer = document.getElementById('audio-resolutions-container');
    const downloadForm = document.getElementById('download-form');

    message.textContent = '';
    videoInfo.style.display = 'none';
    downloadForm.style.display = 'none';

    try {
        const response = await fetch('/resolutions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const result = await response.json();
        if (response.ok) {
            videoTitle.textContent = result.title;
            thumbnail.src = result.thumbnailUrl;
            videoResolutionsContainer.innerHTML = result.videoFormats.map(format =>
                `<button class="resolution-button" data-url="${format.url}">${format.qualityLabel}<br>${format.container}<br>${format.size}</button>`
            ).join('');
            audioResolutionsContainer.innerHTML = result.audioFormats.map(format =>
                `<button class="resolution-button" data-url="${format.url}">${format.qualityLabel}<br>${format.container}<br>${format.size}</button>`
            ).join('');
            videoInfo.style.display = 'block';

            document.querySelectorAll('.resolution-button').forEach(button => {
                button.addEventListener('click', () => {
                    const downloadUrl = button.getAttribute('data-url');
                    startCountdown(downloadUrl);
                });
            });
        } else {
            message.textContent = result.error;
            downloadForm.style.display = 'block';
        }
    } catch (error) {
        message.textContent = 'An error occurred. Please try again.';
        downloadForm.style.display = 'block';
    }
});

function startCountdown(downloadUrl) {
    const countdownContainer = document.getElementById('countdown-container');
    const countdownElement = document.getElementById('countdown');
    const downloadButton = document.getElementById('download-button');
    const videoInfo = document.getElementById('video-info');
    const downloadForm = document.getElementById('download-form');

    videoInfo.style.display = 'none';
    countdownContainer.style.display = 'block';
    downloadForm.style.display = 'none';

    let countdown = 10;

    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(interval);
            downloadButton.style.display = 'block';
            downloadButton.onclick = () => {
                window.location.href = downloadUrl;
            };
        }
    }, 1000);
}

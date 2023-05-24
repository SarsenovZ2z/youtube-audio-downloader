class AudioDownloader {

    constructor(element, onFinished) {
        this.el = element;
        this.chunks = [];
        this.isConnected = false;
        this.isAuto = false;
        this.lastRecord = null;
        this.recorder = null;
        this.onFinished = onFinished;
    }

    initRecorder() {
        if (this.isConnected) {
            console.log('already connected. Skipping...');
            return;
        }

        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(this.el);

        const dest = audioCtx.createMediaStreamDestination();
        source.connect(audioCtx.destination);
        source.connect(dest);

        this.recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });

        this.recorder.ondataavailable = (e) => {
            this.chunks.push(e.data);
        };

        this.recorder.onstop = () => {
            this.onFinished(this.chunks);
            this.chunks = [];
        };

        this.isConnected = true;
    }

    auto() {
        this.isAuto = true;
        this.lastRecord = new Date();
    }

    start() {
        if (!this.isConnected) {
            this.initRecorder();
        }
        if (!this.isVideoPlaying()) {
            this.el.play();
        }

        this.recorder.start();
        console.log('recording...');
    }

    pause() {
        if (!this.isRecording()) {
            return;
        }
        this.recorder.pause();
        console.log('pause');
    }

    resume() {
        if (!this.isRecording() && this.canAutoRecord()) {
            this.start();
        }
        if (!this.isPaused()) {
            return;
        }

        this.recorder.resume();
        console.log('resume');
    }

    stop() {
        if (!this.isRecording()) {
            return;
        }
        if (this.isVideoPlaying()) {
            this.el.pause();
        }
        this.recorder.requestData();
        this.recorder.stop();
        console.log('stop');
    }

    isRecording() {
        return this.recorder && this.recorder.state != 'inactive';
    }

    isPaused() {
        return this.recorder && this.recorder.state == 'paused';
    }

    isVideoPlaying() {
        return !!(this.el.currentTime > 0 && !this.el.paused && !this.el.ended && this.el.readyState > 2);
    }

    canAutoRecord() {
        return this.isAuto && (this.lastRecord && Math.abs(this.lastRecord - new Date() < 2000));
    }
}

class DownloadController {
    constructor(el, download, mode) {
        this.mode = mode;
        this.recorder = new AudioDownloader(el, download);

        this.isControlsRendered = false;
        this.controlsInterval = window.setInterval(() => {
            if (this.isControlsRendered) {
                window.clearInterval(this.controlsInterval);
            } else {
                this.createVideoControls();
            }
        }, 200);


        el.addEventListener('pause', (e) => {
            this.recorder.pause();
        });

        el.addEventListener('waiting', (e) => {
            this.recorder.pause();
        });

        el.addEventListener('play', (e) => {
            this.recorder.resume();
        });

        el.addEventListener('playing', (e) => {
            this.recorder.resume();
        });

        el.addEventListener('ended', (e) => {
            if (this.mode == window.RECORDER_MODE_AUTO && this.recorder.isRecording()) {
                this.recorder.auto();
            }
            this.recorder.stop();
        });

    }

    createVideoControls() {
        const actionsContainer = document.querySelector('#actions');
        if (!actionsContainer) {
            return;
        }

        const recordBtn = document.createElement('a');
        recordBtn.href = "javascript:void(0)";
        recordBtn.style.display = 'inline-flex';
        recordBtn.style.minHeight = '30px';
        recordBtn.style.alignItems = 'center';
        recordBtn.style.marginLeft = '5px';
        recordBtn.style.padding = '3px 13px';
        recordBtn.style.backgroundColor = '#2d2e30';
        recordBtn.style.borderRadius = '18px';
        recordBtn.style.fontSize = '14px';
        recordBtn.style.fontFamily = 'Arial';
        recordBtn.style.fontWeight = '600';
        recordBtn.style.color = 'white';
        recordBtn.style.textDecoration = 'none';

        const setRecordText = () => {
            const redDot = document.createElement('div');
            redDot.style.width = '7px';
            redDot.style.height = '7px';
            redDot.style.marginRight = '3px';
            redDot.style.backgroundColor = 'red';
            redDot.style.borderRadius = '50%';
            recordBtn.innerHTML = 'REC';
            recordBtn.prepend(redDot);
        }

        setRecordText();

        const setDownloadText = () => {
            recordBtn.innerHTML = 'Download';
        }

        recordBtn.onclick = () => {
            if (this.recorder.isRecording()) {
                this.recorder.stop();
                setRecordText();
            } else {
                this.recorder.start();
                setDownloadText();
            }
        }

        actionsContainer.append(recordBtn);
        this.isControlsRendered = true;
    }
}

console.log('recorder script injected...');
window.addEventListener("load", (e) => {
    window.RECORDER_MODE_AUTO = 'auto';

    const el = document.querySelector('video.html5-main-video');

    if (!el) {
        console.log('video.html5-main-video not found!');
        return;
    }

    const download = (chunks) => {
        console.log('saving...');
        const nameEl = document.querySelector('h1.ytd-watch-metadata');
        const fileName = nameEl ? nameEl.textContent.replace(/^\s+|\s+$/g, '') : 'video';

        const blob = new Blob(chunks, { type: "audio/mp3" });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = fileName + '.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const upload = (chunks) => {
        console.log('uploading...');
        const nameEl = document.querySelector('h1.ytd-watch-metadata');
        const filename = (nameEl ? nameEl.textContent.replace(/^\s+|\s+$/g, '') : 'video') + '.webm';

        console.log(chunks[0].type);
        const blob = new Blob(chunks, { type: chunks[0].type });
        const file = new File([blob], filename, { type: 'audio/webm' });

        var formData = new FormData();
        formData.append("file", file, filename);
        formData.append("name", filename);
        fetch("https://music.z2z.kz/upload.php", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.text())
            .then((responseText) => {
                console.log(responseText);
            });
    }

    console.log('creating downloader...');
    const downloadController = new DownloadController(el, upload, RECORDER_MODE_AUTO);
});


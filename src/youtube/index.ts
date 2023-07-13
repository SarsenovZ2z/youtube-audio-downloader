import Api from "../utils/api"
import RecorderController from "./controller"
import YoutubeAudioRecorder from "./recorder"

const api = new Api('http://localhost:3000/api')
chrome.storage.local.get('access_token').then((data) => {
    if (typeof data.access_token == 'string') {
        api.setAccessToken(data.access_token)
    }
})

const getFilename = (): string => {
    return (document.querySelector('h1.ytd-watch-metadata')?.textContent.replace(/^\s+|\s+$/g, '') ?? 'video') + '.webm'
}

const upload = (chunks: Array<Blob>) : void => {
    const file = new File(chunks, getFilename(), { type: chunks[0].type })
    const formData = new FormData()
    formData.append("file", file, file.name)

    api.request('POST', '/audio/upload', formData)
        .then((response) => response.text())
        .then((responseText) => {
            console.log(responseText)
        })
}

const main = () => {
    const video: HTMLVideoElement | null = document.querySelector('video.html5-main-video')
    const actionsWrapper: HTMLElement | null = document.querySelector('div#actions')

    if (video && actionsWrapper) {
        const recorder = new YoutubeAudioRecorder(video, upload)
        const controller = new RecorderController(recorder, actionsWrapper)
        controller.renderControls()
        console.log('uRecord init done')
    } else {
        setTimeout(main, 300)
    }
}

main()

import RecorderController from "./controller"

const video: HTMLVideoElement | null = document.querySelector('video.html5-main-video')
const actionsWrapper: HTMLElement | null = document.querySelector('div#actions')

if (video && actionsWrapper) {
    const controller = new RecorderController(video, actionsWrapper)
    controller.renderControls()
}

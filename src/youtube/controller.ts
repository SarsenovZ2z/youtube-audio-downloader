import YoutubeAudioRecorder from "./recorder"

export default class RecorderController {

    private recorder: YoutubeAudioRecorder | null
    private actionsWrapper: HTMLElement
    private recordButton: HTMLElement

    constructor(video: HTMLVideoElement, actionsWrapper: HTMLElement) {
        this.recorder = new YoutubeAudioRecorder(video)
        this.actionsWrapper = actionsWrapper
    }

    public renderControls(): void {
        this.recordButton = document.createElement('button')
        this.recordButton.classList.add('urecord-btn')

        this.recordButton.onclick = () => this.handleRecordButtonClick()

        this.actionsWrapper.append(this.recordButton)
        this.setButtonRecordText()
    }

    private handleRecordButtonClick(): void {
        if (this.recorder.isRecording) {
            this.recorder.stop((chunks: Array<Blob>) => {
                console.log(chunks)
            })

            this.setButtonRecordText()
        } else {
            this.recorder.init()
            this.recorder.start()

            this.setButtonDownloadText()
        }
    }

    private setButtonDownloadText(): void {
        this.recordButton.innerHTML = 'Download'
    }

    private setButtonRecordText(): void {
        const redDot = document.createElement('div')
        redDot.classList.add('urecord-dot')

        this.recordButton.innerHTML = 'REC'
        this.recordButton.prepend(redDot)
    }

}
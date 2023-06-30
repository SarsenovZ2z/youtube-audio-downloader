export default class YoutubeAudioRecorder {

    private videoElement: HTMLVideoElement
    private recorder: MediaRecorder | null
    private onFinished: Function = () => { }
    private chunks: Array<Blob> = []

    constructor(el: HTMLVideoElement) {
        this.videoElement = el
    }

    public init(): void {
        const audioCtx = new AudioContext()
        const source = audioCtx.createMediaElementSource(this.videoElement)

        const dest = audioCtx.createMediaStreamDestination()
        source.connect(audioCtx.destination)
        source.connect(dest)

        this.recorder = new MediaRecorder(dest.stream)

        this.recorder
            .ondataavailable = (e) => {
                this.chunks.push(e.data)
            }

        this.recorder
            .onstop = (e) => {
                this?.onFinished(this.chunks)
                this.chunks = []
            }
    }

    public start(): void {
        if (!this.isVideoPlaying) {
            this.videoElement.play()
        }
        this.recorder.start()
    }

    public pause(): void {
        this.recorder.pause()
    }

    public resume(): void {
        this.recorder.resume()
    }

    public stop(fn: Function): void {
        this.onFinished = fn

        this.recorder.requestData()
        this.recorder.stop()

        this.videoElement.pause()
    }

    get isRecording(): boolean {
        return this.recorder && this.recorder.state != 'inactive'
    }

    get isPaused(): boolean {
        return this.recorder && this.recorder.state == 'paused'
    }

    get isVideoPlaying(): boolean {
        return this.videoElement.currentTime > 0
            && !this.videoElement.paused
            && !this.videoElement.ended
            && this.videoElement.readyState > 2
    }

}
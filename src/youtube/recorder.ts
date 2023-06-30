export default class YoutubeAudioRecorder {

    private videoElement: HTMLVideoElement
    private recorder: MediaRecorder | null
    private onFinished: Function = () => { }
    private chunks: Array<Blob> = []

    constructor(el: HTMLVideoElement, onFinished: Function) {
        this.videoElement = el
        this.onFinished = onFinished
    }

    public start(): void {
        if (!this.recorder) {
            this.init()
        }

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

    public stop(): void {
        this.recorder.requestData()
        this.recorder.stop()

        this.videoElement.pause()
    }

    private init(): void {
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
                this.onFinished(this.chunks)
                this.chunks = []
            }
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
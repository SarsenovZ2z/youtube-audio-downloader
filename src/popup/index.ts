import Api from "../utils/api"

const QRCode = require('qrcode')

const authWrp: HTMLElement = document.querySelector('#auth-uid')
const refreshBtn: HTMLButtonElement = document.querySelector('#refresh')

const api = new Api('http://localhost:3000/api')

refreshBtn.onclick = async (e) => {
    const uid = await api.request('GET', '/auth/uid', {})
        .then(res => res.json())
        .then(res => res.uid)

    QRCode.toDataURL(uid, (err: any, url: string) => {
        let img: HTMLImageElement | null = authWrp.querySelector('img')
        if (!img) {
            img = document.createElement('img')
            authWrp.appendChild(img)
        }

        img.setAttribute('src', url)
    })
}


const QRCode = require('qrcode')

const authInfo = document.querySelector('#auth-info')
const qrWrp: HTMLElement = document.querySelector('#auth-uid')
const refreshBtn: HTMLButtonElement = document.querySelector('#refresh')

chrome.storage.local.get('access_token').then((data) => {
    const textEl = document.createElement('b')
    authInfo.appendChild(textEl)
    if (typeof data.access_token == 'string') {
        textEl.innerHTML = `Current AccessToken: ${data.access_token}`
    } else {
        textEl.innerHTML = `Not authenticated`

    }
})


const ws = new WebSocket('ws://localhost:8999')

ws.onmessage = (msg) => {
    const event = JSON.parse(msg.data)
    if (event.type == 'uid') {
        setUid(event.data)
    } else if (event.type == 'token') {
        setToken(event.data)
    }
}

refreshBtn.onclick = async (_) => {
    ws.send(JSON.stringify({ type: 'refresh' }))
}

const setUid = (uid: string) => {
    QRCode.toDataURL(uid, (err: any, url: string) => {
        let img: HTMLImageElement | null = qrWrp.querySelector('img')
        if (!img) {
            img = document.createElement('img')
            qrWrp.appendChild(img)
        }

        img.setAttribute('src', url)
    })
}

const setToken = (token: string) => {
    console.log('AccessToken received')
    chrome.storage.local.set({ 'access_token': token })
}
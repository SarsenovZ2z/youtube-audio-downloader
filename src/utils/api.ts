
export default class Api {

    baseUrl: string
    accessToken: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    setAccessToken(accessToken: string): void {
        this.accessToken = accessToken
    }

    async request(method: string, path: string, data: any) {
        return fetch(`${this.baseUrl}${path}`, {
            method: method,
            body: data,
            headers: new Headers({
                ...(typeof this.accessToken == 'string' && {'Authorization': `Bearer ${this.accessToken}`}), 
            })
        })
    }


}
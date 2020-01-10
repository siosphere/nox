import * as express from 'express'

class Response
{
    content : string
    httpStatus : number
    headers : object

    constructor(content : string, httpStatus : number = 200, headers : object = null)
    {
        this.content = content
        this.httpStatus = httpStatus
        this.headers = headers || {}
    }

    sendHeaders(res : express.Response)
    {
        res.status(this.httpStatus)

        for(let key in this.headers) {
            res.set(key, this.headers[key])
        }

        return this
    }

    sendContent(res : express.Response)
    {
        res.send(this.content)

        return this
    }

    send(res : express.Response)
    {
        this.sendHeaders(res)
        this.sendContent(res)

        return this
    }

    setHeader(key : string, value : string)
    {
        this.headers[key] = value

        return this
    }
}

export default Response
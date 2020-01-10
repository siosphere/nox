import * as express from 'express'

import Server, {NOX_AUTH_HEADER} from './index'

const createServerFromRequest = (req : express.Request, res : express.Response, routes : object) : Server => {

    const auth = req.cookies[NOX_AUTH_HEADER]

    return new Server(req, res, routes)
}

export {
    createServerFromRequest
}
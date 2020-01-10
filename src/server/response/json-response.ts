import Response from '../response'

class JSONResponse extends Response
{
    constructor(content : any, httpStatus : number = 200, headers : object = null)
    {
        super(JSON.stringify(content), httpStatus, headers)

        this.setHeader('Content-Type', 'application/json')
    }
}

export default JSONResponse
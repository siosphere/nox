import * as express from 'express'
import useSDK from 'hooks/use-sdk'
import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'

// # Server
import {createServerFromRequest} from 'server/create'
import Response from 'server/response'
import JSONResponse from 'server/response/json-response'

// # Layout
import Layout from './layout'

// # Middleware
import * as cookieParser from 'cookie-parser'
import Server from 'server'

declare global {
    namespace Express {
        export interface Request {
            routeUrls ?: string | string[]
        }
    }
}

interface NoxConfiguration
{
    apiPrefix : string
    port : number
    startMessage : string
}

const DefaultNoxConfiguration : Partial<NoxConfiguration> = {
    apiPrefix: '/api',
    port: 3000,
    startMessage: "Nox started",
}

class Nox
{
    app : express.Application
    _config : Partial<NoxConfiguration>
    _routes : object = {}
    contextConstructor : any

    api = {
        get: function(urls : string | string[], cb : (server : Server) => Response) {
            urls = this.prefixApiURLs(urls)
            return this.app.get(
                urls, this.handleCallback(cb, urls))
        },
        post: function(urls : string | string[], cb : (server : Server) => Response) {
            urls = this.prefixApiURLs(urls)
            return this.app.get(
                urls, this.handleCallback(cb, urls))
        },
        put: function(urls : string | string[], cb : (server : Server) => Response) {
            urls = this.prefixApiURLs(urls)
            return this.app.get(
                urls, this.handleCallback(cb, urls))
        },
        delete: function(urls : string | string[], cb : (server : Server) => Response) {
            urls = this.prefixApiURLs(urls)
            return this.app.get(
                urls, this.handleCallback(cb, urls))
        },
        patch: function(urls : string | string[], cb : (server : Server) => Response) {
            urls = this.prefixApiURLs(urls)
            return this.app.get(
                urls, this.handleCallback(cb, urls))
        },
        head: function(urls : string | string[], cb : (server : Server) => Response) {
            urls = this.prefixApiURLs(urls)
            return this.app.get(
                urls, this.handleCallback(cb, urls))
        },
        options: function(urls : string | string[], cb : (server : Server) => Response) {
            urls = this.prefixApiURLs(urls)
            return this.app.get(
                urls, this.handleCallback(cb, urls))
        },
    }
    
    createServerFromRequest(req : express.Request, res : express.Response)
    {
        return createServerFromRequest(req, res, this._routes)
    }

    constructor(contextConstructor : any, userConfig : Partial<NoxConfiguration> = {})
    {
        this.contextConstructor = contextConstructor
        let config = DefaultNoxConfiguration
        for(let key in userConfig) {
            config[key] = userConfig[key]
        }

        this._config = config
        this.app = express()

        this.app.use(cookieParser())
        this.app.use(express.static('public'))

        //api binding
        this.api.get = this.api.get.bind(this)
        this.api.post = this.api.post.bind(this)
        this.api.put = this.api.put.bind(this)
        this.api.delete = this.api.delete.bind(this)
        this.api.patch = this.api.patch.bind(this)
        this.api.head = this.api.head.bind(this)
        this.api.options = this.api.options.bind(this)
    }

    route(urls : string | string[], cb : (server : Server) => Response, component : React.JSXElementConstructor<any>)
    {
        this.registerRoutes(urls, component)
        this.app.get(urls, this.handleCallback(cb, urls))
    }

    entry(component : React.JSXElementConstructor<any>, location : string)
    {
        //register a component to a given location
    }

    start()
    {
        if(process.env['NOX_MODE'] === "generate") {
            this.generateClient()
        }
        this.app.listen(this.config('port'), () => {
            console.info(this.config('startMessage'))
        })
    }

    config(key : keyof NoxConfiguration, defaultValue : any = null)
    {
        if(typeof this._config[key] === 'undefined') {
            return defaultValue
        }

        return this._config[key]
    }

    protected generateClient()
    {
        console.log("Genearting client bundle...")
        let components = {}
        for(let url in this._routes) {
            let component = this._routes[url]
            let path = component.path
            if(!path) {
                throw new Error(url + ", has a component without a path")
            }
            if(typeof components[path] === 'undefined') {
                components[path] = {
                    urls: [],
                    name: null
                }
            }

            components[path].urls.push(url)
        }

        let cwd = process.cwd()
        let buildPath = path.join(cwd, 'tmp')

        let root = path.join(__dirname, '../')
        
        let entry = fs.readFileSync(path.join(root, 'stub/entry.tsx.stub')).toString()

        let componentID = 1;
        let componentData = Object.keys(components).map(p => {
            let relativePath = path.relative(buildPath, p)
            let componentName = `Component${componentID}`
            componentID++
            components[p].name = componentName

            return `import ${componentName} from '${relativePath}'`
        }).join("\n")

        let routeData = Object.keys(components).map((c) => {
            let urls = components[c].urls
            let pathArray = `[${urls.map(url => `'${url}'`).join(',')}]`
            return `<Route exact path={${pathArray}}>
        <${components[c].name} />
    </Route>`
        }).join("\n")


        let config = fs.readFileSync(path.join(root, 'stub/webpack.config.js.stub')).toString()
        config = config.replace('/** nox:publicPath */', path.join(cwd, 'public', 'dist'))
        config = config.replace('/** nox:context */', buildPath)

        entry = entry.replace('/** nox:components */', componentData)
        entry = entry.replace('/** nox:routes */', routeData)
        //TODO: fix pathing...
        let relativePath = path.relative(buildPath, this.contextConstructor.path)
        entry = entry.replace('/** nox:context */', relativePath)
        fs.mkdirSync(buildPath, {
            recursive: true,
        })
        fs.writeFileSync(path.join(buildPath, 'entry.tsx'), entry)
        fs.writeFileSync(path.join(buildPath, 'webpack.config.js'), config)
        
        const webpackConfig = require(path.join(buildPath, 'webpack.config.js'))

        process.chdir('./tmp')
        
        webpack(webpackConfig, (err, stats) => {
            if (err || stats.hasErrors()) {
                console.error("FAILED", err, stats.toString())
                return
            }

            console.log("Generated client bundle")
        })
        //if we are generating the client....
        /*const stack = new Error().stack
        const stackData = stack.split("\n")
        const line = stackData[3]
        const pathRegex = /\(([a-z0-9\-\_\.\s\/\\]+):[0-9]+:[0-9]+\)/gi
        const path = pathRegex.exec(line)
        const contents = fs.readFileSync(path[1]).toString()
        const tree = esprima.parse(contents)

        //list of all declared variables
        let declaredVariables = {}
        let noxVar
        let appVar
        tree.body.forEach(node => {
            if(node.type === 'VariableDeclaration') {
                node.declarations.forEach(d => {
                    
                    if(d.type !== 'VariableDeclarator') {
                        return
                    }

                    const name = d.id.name
                })
            }
            if(!noxVar) {
                if(node.type === 'VariableDeclaration') {
                    node.declarations.forEach(d => {
                        if(noxVar) {
                            return
                        }
                        if(!d.init.callee || d.init.callee.name !== "require") {
                            return
                        }
                        if(typeof d.init.arguments[0] !== 'object') {
                            return
                        }
                        if(d.init.arguments[0].value !== "./index") { //TODO: change to "nox"
                            return
                        }

                        console.log('variable that has nox is', d.id.name)
                        noxVar = d.id.name
                    })
                }
                return
            }
            if(!appVar) {
                if(node.type === 'VariableDeclaration') {
                    node.declarations.forEach(d => {
                        if(d.init.type === 'CallExpression' && d.init.callee.type === 'MemberExpression' && d.init.callee.object.name === noxVar && d.init.callee.property.value === "default") {
                            appVar = d.id.name
                        }
                    })
                }
                return
            }
            //should have appVar
            if(node.type === 'ExpressionStatement' && node.expression.type === "CallExpression" && node.expression.callee.object.name === appVar && node.expression.callee.property.name === "route") {
                console.log('ROUTE CALL', node)
            }
        })
        //if routes are not defined here, and we don't have a configured route file path, error*/
    }

    protected handleCallback(cb : (server : Server) => Response, urls : string | string[])
    {
        return (req, res) => {
            req.routeUrls = urls

            const server = this.createServerFromRequest(req, res)
            //do voodoo
            const response = cb(server)
            response.send(res)
        }
    }

    protected prefixApiURLs(url : string | string[])
    {
        if(url instanceof Array) {
            return url.map(u => {
                if(u[0] !== '/') {
                    u = '/' + u
                }
                return this.config('apiPrefix') + u
            })
        }

        let u = url
        if(u[0] !== '/') {
            u = '/' + u
        }

        return this.config('apiPrefix') + u
    }

    protected registerRoutes(urls : string | string[], component : React.JSXElementConstructor<any>)
    {
        if(urls instanceof Array) {
            for(let i in urls) {
                this.registerRoutes(urls[i], component)
            }
        }

        this._routes[urls as string] = component

        return this
    }
}

const createNox = (contextConstructor : { new() : any}, config : Partial<NoxConfiguration> = {}) => {
    return new Nox(contextConstructor, config)
}

export default createNox

export {
    useSDK,

    // Layout
    Layout,

    // WEB
    Response,
    JSONResponse,
}
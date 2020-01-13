import * as express from 'express'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import {Route, StaticRouter, Switch} from "react-router-dom"
import Response from './response'
import {LayoutContext} from 'layout'
import SDK, {SDKContext} from 'client/sdk'
import ClientContext from 'client/context'
import {MetaWrapper, MetaContext} from 'layout/meta'

const NOX_AUTH_HEADER = 'NOX_AUTH'

interface AppContext
{
    dump() : object
}

class Server
{
    request : express.Request
    response : express.Response
    routes : object

    constructor(req : express.Request, res : express.Response, routes : object)
    {
        this.request = req
        this.response = res
        this.routes = routes
    }

    render(component : React.ReactElement, context : AppContext) : Response
    {
        let layout = null
        const setContext = (node) => {
            layout = node
        }

        //setup auth for SDK through JWT
        const sdk = new SDK()
        let meta = null

        const componentOutput = ReactDOMServer.renderToString(
            <MetaWrapper>
                <ClientContext.Provider value={context}>
                    <SDKContext.Provider value={sdk}>
                        <MetaContext.Consumer>
                            {metaContext => {
                                meta = metaContext
                                return <LayoutContext.Provider value={[null, setContext]}>
                                    <StaticRouter location={this.request.url}>
                                        <Switch>
                                            <Route path={this.request.routeUrls}>
                                                {React.cloneElement(component, {
                                                    ...component.props,
                                                    metaContext: metaContext
                                                })}
                                            </Route>
                                            {this.getAdditionalRoutes()}
                                        </Switch>
                                    </StaticRouter>
                                </LayoutContext.Provider>
                            }}
                        </MetaContext.Consumer>
                    </SDKContext.Provider>
                </ClientContext.Provider>
            </MetaWrapper>)

        const componentProps = JSON.stringify(context.dump())

        const output = layout.getHTML(meta, componentOutput, componentProps)

        return new Response(output)
    }

    getAdditionalRoutes()
    {
        let routes = []
        for(let url in this.routes) {
            if(this.request.routeUrls.indexOf(url) !== -1) {
                continue
            }

            let Component = this.routes[url]
            routes.push(<Route key={url} path={url} component={Component} />)
        }

        return routes
    }
}


export default Server

export {
    NOX_AUTH_HEADER
}
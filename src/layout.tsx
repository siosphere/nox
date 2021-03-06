import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import Meta, { MetaContext } from 'layout/meta'
const LayoutContext = React.createContext([null, null])

interface LayoutProps
{
    head : React.ReactElement
    layoutRef ?: React.Ref<any>
    metaContext ?: Meta
}


class Layout extends React.PureComponent<LayoutProps, {}>
{
    static contextType = LayoutContext

    constructor(props : LayoutProps)
    {
        super(props)
    }

    getHead(meta : Meta) : string
    {
        return ReactDOMServer.renderToStaticMarkup(<MetaContext.Provider value={meta}>{this.props.head}</MetaContext.Provider>)
    }

    getHTML(meta : Meta, componentOutput : string, componentProps : string)
    {
        const server = process.env['NODE_ENV'] === 'development' ? 'http://localhost:8888' : '/dist'
        const scripts = []

        if(process.env['NODE_ENV'] === 'production') {
            const assets = require(`${process.cwd()}/webpack-assets.json`)
            Object.keys(assets).forEach(asset => {
                if(asset !== "") {
                    scripts.push(assets[asset].js)
                }
            })
        } else {
            scripts.push(`${server}/bundle.js`)
        }

        const scriptString = scripts.map(path => {
            return `<script type="text/javascript" defer src="${path}"></script>`
        }).join("\n")

        return `<!doctype html>
<!--[if !IE]><!--->
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<!--<![endif]-->
<!--[if IE]>
<html class="ie" lang="en" xmlns="http://www.w3.org/1999/xhtml">
<![endif]-->
<html>
${this.getHead(meta)}
<body>
<div id="app">${componentOutput}</div>
<script type="text/javascript">
    window.__NOX_INITIAL_STATE__ = ${componentProps.replace(/</g, '\\u003c')}
</script>
${scriptString}
</body>
</html>`
    }

    render()
    {
        const [layout, setLayout] = this.context
        
        if(layout === null) {
            setLayout(this)
        }

        return this.props.children
    }
}

export default Layout

export {
    LayoutContext,
    LayoutProps
}
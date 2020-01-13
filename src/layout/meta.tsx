import * as React from 'react'

class Meta
{
    _change : (...any) => void

    title : string

    setTitle(title : string)
    {
        if(title === this.title) {
            return this
        }

        if(typeof document !== 'undefined' && document.title) {
            document.title = title
        }

        this.title = title

        //otherwise what?
        this.triggerChange()
        
        return this
    }

    getTitle() : string
    {
        return this.title
    }

    onChange(cb : (...any) => void)
    {
        this._change = cb
    }

    private triggerChange()
    {
        if (this._change) {
            this._change()
        }
    }
}

const MetaContext = React.createContext(new Meta)

const MetaWrapper = ( props : any) => {
    const [meta, setMeta] = React.useState(new Meta)

    meta.onChange(() => setMeta(meta))

    return <MetaContext.Provider value={meta}>
        {props.children}
    </MetaContext.Provider>
}

export default Meta

export {
    MetaContext,
    MetaWrapper
}
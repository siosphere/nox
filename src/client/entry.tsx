import * as React from 'react'
import ClientContext from './context'

interface EntryProps
{
    context : any /* context constructor */
    children ?: any
}

const Entry = (props : EntryProps) => {
    const context = new props.context(window['__NOX_INITIAL_STATE__'])

    return <ClientContext.Provider value={context}>
        {props.children}
    </ClientContext.Provider>
}

export default Entry
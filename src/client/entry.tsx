import * as React from 'react'
import ClientContext from './context'
import Layout, {LayoutContext} from '../layout'
import {MetaWrapper} from '../layout/meta'

interface EntryProps
{
    context : any /* context constructor */
    children ?: any
}

const Entry = (props : EntryProps) => {
    const context = new props.context(window['__NOX_INITIAL_STATE__'])

    return <ClientContext.Provider value={context}>
        <MetaWrapper>
            {props.children}
        </MetaWrapper>
    </ClientContext.Provider>
}

export default Entry
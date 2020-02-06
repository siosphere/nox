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
    const [context, setContext] = React.useState(new props.context(window['__NOX_INITIAL_STATE__']))

    context.setContext = setContext

    React.useEffect(() => {
        return () => {
            if(context) {
                context.close()
            }
        }
    }, [])

    const Wrapper = context.wrapper

    return <ClientContext.Provider value={context}>
        <MetaWrapper>
            <Wrapper>
                {props.children}
            </Wrapper>
        </MetaWrapper>
    </ClientContext.Provider>
}

export default Entry
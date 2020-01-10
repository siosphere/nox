import * as React from 'react'
import {BrowserRouter, NavLink, Link, Redirect} from 'react-router-dom'
import {Route, Switch} from "react-router"
import ClientContext from 'client/context'
import Entry from 'client/entry'

export default {
    Wrap: (component, name, path) => {

        component.componentName = name
        component.path = path

        return component
    },
    ClientContext: ClientContext,
    useContext: () => React.useContext(ClientContext)
}

export {
    BrowserRouter,
    NavLink,
    Link,
    Redirect,
    Route,
    Switch,
    Entry
}
import * as React from 'react'
import {BrowserRouter, NavLink, Link, Redirect, useLocation, useHistory, useRouteMatch, useParams} from 'react-router-dom'
import {Route, Switch} from "react-router"
import ClientContext from 'client/context'
import Entry from 'client/entry'
import {MetaContext} from 'layout/meta'

export default {
    Wrap: (component, name, path) => {

        component.componentName = name
        component.path = path

        return component
    },
    ClientContext: ClientContext,
    useContext: () => React.useContext(ClientContext)
}

const useMeta = () => {
    return React.useContext(MetaContext)
}

export {
    BrowserRouter,
    NavLink,
    Link,
    Redirect,
    Route,
    Switch,
    Entry,
    MetaContext,
    useMeta,
    useLocation,
    useHistory,
    useRouteMatch,
    useParams
}
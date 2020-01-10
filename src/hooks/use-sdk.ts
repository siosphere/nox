import * as React from 'react'
import {SDKContext} from '../client/sdk'

const useSDK = () => {
    return React.useContext(SDKContext)
}

export default useSDK
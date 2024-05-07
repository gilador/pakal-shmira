import AsyncStorageManager from '@app/services/AsyncStorageManager'
import { useEffect, useState } from 'react'

function useSyncedState<T>(key: string, defaultValue: T): [T, (newValue: T | ((prevState: T) => T)) => void] {
    const [state, setState] = useState<T>(defaultValue)

    console.log('useSyncedState->state:', state)

    useEffect(() => {
        console.log('useSyncedState->useEffect')
        initFromStorage(key, defaultValue, setState).then((value) => {
            setState(value)
        })
    }, [])

    useEffect(() => {
        return () => {
            console.log('useSyncedState->useEffect->cleanup')
            AsyncStorageManager.removeObserver(key, setState)
        }
    }, [])

    const setSyncState = (newValue: T | ((prevState: T) => T)) => {
        // console.log('useSyncedState->setSyncState->newValue:', newValue, "state:", state)
        const valueToStore = newValue instanceof Function ? newValue(state ? state : defaultValue) : newValue
        const serializedValue = JSON.stringify(valueToStore)
        console.log('useSyncedState->setSyncState->serializedValue:', serializedValue)

        AsyncStorageManager.setItem(key, serializedValue, setState)
    }

    return [state, setSyncState]
}

async function initFromStorage<T>(key: string, initValue: T, cb: (val: T) => void): Promise<Awaited<T>> {
    let returnValue = await AsyncStorageManager.getItem(key, cb)
    if (!returnValue) {
        returnValue = JSON.stringify(initValue)
    }
    return JSON.parse(returnValue)
}

export default useSyncedState

import { useEffect, useState } from 'react'

import AsyncStorageManager from '@app/services/AsyncStorageManager'

function useSyncedState<T>(
    key: string,
    defaultValue?: T
): [T | undefined, (newValue: (T | undefined) | ((prevState: T | undefined) => T | undefined)) => void] {
    const [state, setState] = useState<T | undefined>(defaultValue)

    useEffect(() => {
        initFromStorage(key, setState, defaultValue).then((value) => {
            setState(value)
        })
    }, [])

    useEffect(() => {
        return () => {
            AsyncStorageManager.removeObserver(key, setState)
        }
    }, [])

    const setSyncState = (newValue: (T | undefined) | ((prevState: T | undefined) => T | undefined)) => {
        //
        const valueToStore = newValue instanceof Function ? newValue(state ? state : defaultValue) : newValue
        const serializedValue = JSON.stringify(valueToStore)

        AsyncStorageManager.setItem(key, serializedValue, setState)
    }

    return [state, setSyncState]
}

async function initFromStorage<T>(key: string, cb: (val: T) => void, initValue?: T): Promise<T | undefined> {
    let storedValue = await AsyncStorageManager.getItem(key, cb)
    let returnValue: T | undefined = initValue
    if (storedValue) {
        returnValue = JSON.parse(storedValue) as T
    }
    return returnValue
}

export default useSyncedState

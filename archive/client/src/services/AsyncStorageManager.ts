import AsyncStorage from '@react-native-async-storage/async-storage'

class AsyncStorageManager {
    private observables: Map<string, ((value: any) => void)[]>
    constructor() {
        this.observables = new Map()
    }

    public async setItem(key: string, value: string, onValueChangeCB?: (value: any) => void) {
        try {
            await AsyncStorage.setItem(key, value)
            const observers = this.observables.get(key) || []
            onValueChangeCB && observers.push(onValueChangeCB)
            observers.forEach((observer) => {
                observer(JSON.parse(value))
            })
            this.observables.set(key, observers)
        } catch (e) {
            //TODO handle error
        }
    }

    public async getItem(key: string, onValueChangeCB?: (value: any) => void): Promise<any> {
        let ret
        try {
            ret = await AsyncStorage.getItem(key)
            if (onValueChangeCB) {
                const observers = this.observables.get(key) || []
                if (!observers.includes(onValueChangeCB)) {
                    observers.push(onValueChangeCB)
                    this.observables.set(key, observers)
                } else {
                }
            }
        } catch (e) {
            //TODO handle error
        }

        return ret
    }

    public removeObserver(key: string, onValueChange: (value: any) => void) {
        const observers = this.observables.get(key)
        if (!observers) {
            return
        }
        const index = observers.indexOf(onValueChange)
        if (index !== -1) {
            observers.splice(index, 1)
            this.observables.set(key, observers)
        }
        const observerssum = this.observables.get(key)?.length || 0
    }

    // private onValueChange(key: string, value: any) {
    //     const observers = this.observables.get(key) || []
    //     observers.forEach((observer) => {
    //         observer(value)
    //     })
    // }
}

export default new AsyncStorageManager()

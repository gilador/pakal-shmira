import { loadPyodide, type PyodideInterface } from 'pyodide'

import optimizerCode from './python/shift_optimizer.py'

export class PyodideService {
    private static instance: PyodideInterface | null = null

    static async initialize(): Promise<PyodideInterface> {
        if (!this.instance) {
            try {
                console.log('Initializing Pyodide...')
                this.instance = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
                })

                await this.loadDependencies()
                await this.loadOptimizerCode()

                console.log('Pyodide initialization complete!')
            } catch (error) {
                console.error('Failed to initialize Pyodide:', error)
                this.instance = null
                throw error
            }
        }
        return this.instance
    }

    private static async loadDependencies(): Promise<void> {
        if (!this.instance) throw new Error('Pyodide not initialized')

        console.log('Installing dependencies...')
        await this.instance.loadPackage('micropip')
        const micropip = this.instance.pyimport('micropip')
        await micropip.install(['pulp', 'pydantic'])
    }

    private static async loadOptimizerCode(): Promise<void> {
        if (!this.instance) throw new Error('Pyodide not initialized')

        console.log('Loading optimizer code...')
        await this.instance.runPython(optimizerCode)
    }

    static async checkDependencies(): Promise<boolean> {
        if (!this.instance) throw new Error('Pyodide not initialized')

        const result = await this.instance.runPython(`
            import sys
            import json
            
            required_packages = ['pulp', 'pydantic']
            installed_packages = [pkg for pkg in sys.modules.keys()]
            
            json.dumps({
                'all_installed': all(pkg in installed_packages for pkg in required_packages),
                'installed': installed_packages
            })
        `)

        const status = JSON.parse(result)
        if (!status.all_installed) {
            console.warn('Missing some required packages')
        }
        return status.all_installed
    }
}

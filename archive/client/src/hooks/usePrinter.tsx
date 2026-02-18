import React, { MutableRefObject, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { StyleSheet } from 'react-native'

import { AntDesign } from '@expo/vector-icons'

export default function usePrint(printRef: React.RefObject<Node>): {
    print: () => void
    printIcon: JSX.Element
} {
    useEffect(() => {
        const handleKeyDown = (event: {
            preventDefault: () => void
            which: any
            keyCode: any
            ctrlKey: any
            metaKey: any
        }) => {
            const code = event.which || event.keyCode

            let charCode = String.fromCharCode(code).toLowerCase()
            if ((event.ctrlKey || event.metaKey) && charCode === 'p') {
                event.preventDefault()
                callPrint()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const callPrint = useReactToPrint({
        content: () => {
            const cpy = printRef.current?.cloneNode(true) as HTMLElement

            if (cpy.style !== undefined) {
                cpy.style.alignSelf = 'center'
                cpy.style.width = '100%'
                cpy.style.height = '100%'
                ;(cpy.childNodes[0] as HTMLElement).style.borderWidth = '0'
            }

            return cpy as React.ReactInstance
        },
        documentTitle: 'DafAvo Exercise',
    })

    return {
        print: () => {
            callPrint()
        },
        printIcon: <AntDesign name="printer" size={50} color="black" onPress={callPrint} style={styles.print} />,
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    signsTitle: {
        fontSize: 17,
        lineHeight: 24,
        alignSelf: 'flex-start',
        flexGrow: 10,
        flexShrink: 10,
    },
    trackStyle: {
        width: 400,
        height: 20,
        borderRadius: 60,
    },
    thumbStyle: {
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 60,
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 1,
        textAlign: 'center',
        justifyContent: 'center',
    },
    print: {
        paddingTop: 40,
        alignSelf: 'center',
    },
})

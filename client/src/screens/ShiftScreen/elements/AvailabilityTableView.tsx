import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import { StyleSheet, View } from 'react-native'
import React, { useMemo } from 'react'

import withLogs from '@app/common/components/HOC/withLogs'
import AvailabilityCellView from './AvailabilityCellView'
import { transposeMat } from '../../../common/utils'
import { Constraint, UniqueString } from '../models'
import TableView from './common/TableView'

type AvailabilityTableProp = {
    hours: UniqueString[]
    posts: UniqueString[]
    availabilityData?: Constraint[][]
    onConstraintsChanged: (data: Constraint[][]) => void
}

const AvailabilityTableView = ({
    posts,
    hours,
    availabilityData = [],
    onConstraintsChanged,
}: AvailabilityTableProp) => {
    console.log(`AvailabilityTableView->availabilityData: ${JSON.stringify(availabilityData)}`)

    const transposedMatrix: Constraint[][] = useMemo(() => {
        // console.log(`AvailabilityTableView->transposedMatrix: ${JSON.stringify(availabilityData)}`)
        return transposeMat(availabilityData)
    }, [availabilityData])

    const cb = (availability: boolean, index: [number, number]) => {
        const newData: Constraint[][] = JSON.parse(JSON.stringify(availabilityData))
        newData[index[0]][index[1]].availability = !availability
        onConstraintsChanged(newData)
    }

    const shiftDataNamesElements = useMemo(() => {
        return transposedMatrix.map((array, postIndex) =>
            array.map((availability, hourIndex) => {
                console.log(`AvailabilityTableView->availability: ${JSON.stringify(availability)}`)
                if (availability === undefined) {
                    console.log('undefined availability')
                }

                return (
                    <AvailabilityCellView
                        availability={availability.availability}
                        index={[postIndex, hourIndex]}
                        cb={cb}
                    />
                )
            })
        )
    }, [transposedMatrix])

    return (
        <View style={styles.container}>
            <TableView
                horizontalHeaderViews={posts}
                verticalHeaderViews={hours}
                tableElementViews={shiftDataNamesElements}
            />
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 10,
        padding: 16,
        paddingTop: 30,
        backgroundColor: '#fff',
    },
})

export default withLogs(AvailabilityTableView)

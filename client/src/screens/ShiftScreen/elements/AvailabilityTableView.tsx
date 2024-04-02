import { StyleSheet, View } from 'react-native'
import React, { useMemo } from 'react'

import { generateHeaderViews, transposeMat } from '../../../common/utils'
import withLogs from '@app/common/components/HOC/withLogs'
import AvailabilityCellView from './AvailabilityCellView'
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
    const postHeaderViews = useMemo(
        () => generateHeaderViews([{ id: 'fakePostForSpace', value: '' }, ...posts]),
        [JSON.stringify(posts)]
    )
    const hoursHeaderViews = useMemo(() => generateHeaderViews(hours), [JSON.stringify(hours)])
    const transposedMatrix: Constraint[][] = useMemo(() => {
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
                horizontalHeaderViews={postHeaderViews}
                verticalHeaderViews={hoursHeaderViews}
                tableElementViews={shiftDataNamesElements}
                style={{ paddingHorizontal: 100 }}
            />
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexShrink: 1,
        padding: 16,
        paddingTop: 30,
        overflow: 'scroll',
    },
})

export default withLogs(AvailabilityTableView)

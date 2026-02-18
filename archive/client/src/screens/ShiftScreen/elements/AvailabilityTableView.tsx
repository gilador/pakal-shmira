import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import React, { useEffect, useMemo } from 'react'

import { generateHeaderViews, transposeMat } from '@app/common/utils'
import withLogs from '@app/common/components/HOC/withLogs'
import AvailabilityCellView from './AvailabilityCellView'
import { Constraint, UniqueString } from '../models'
import TableView from './common/TableView'

type AvailabilityTableProp = {
    hours: UniqueString[]
    posts: UniqueString[]
    availabilityData?: Constraint[][]
    onConstraintsChanged: (data: Constraint[][]) => void
    style?: StyleProp<ViewStyle>
}

const AvailabilityTableView = ({
    posts,
    hours,
    availabilityData = [],
    onConstraintsChanged,
    style,
}: AvailabilityTableProp) => {
    const postHeaderViews = useMemo(() => {
        return generateHeaderViews(posts)
    }, [posts])
    const hoursHeaderViews = useMemo(() => generateHeaderViews(hours), [hours])
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
        <View style={[styles.container]}>
            <TableView
                horizontalHeaderViews={postHeaderViews}
                verticalHeaderViews={hoursHeaderViews}
                tableElementViews={shiftDataNamesElements}
                style={[styles.table, style]}
            />
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        overflow: 'scroll',
        width: '100%',
        height: '100%',
    },
    table: { position: 'absolute', top: 0, left: 0, width: '100%' },
})

export default withLogs(AvailabilityTableView)

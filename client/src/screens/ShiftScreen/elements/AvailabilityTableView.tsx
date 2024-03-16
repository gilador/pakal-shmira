import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import { StyleSheet, View } from 'react-native'
import React, { useMemo } from 'react'

import AvailabilityCellView from './AvailabilityCellView'
import { transposeMat } from '../../../common/utils'
import { Constraint, UniqueString } from '../models'
import withLogs from '@app/components/HOC/withLogs'

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

    const transposedMatrix: Constraint[][] = useMemo(() => {
        console.log(`AvailabilityTableView->transposedMatrix: ${JSON.stringify(transposedMatrix)}`)
        return transposeMat(availabilityData)
    }, [availabilityData])
    // const transposedMatrix = transposeMat(availabilityData);
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

    const postsElements = useMemo(() => [undefined, ...posts].map((post) => post?.value ?? ''), [posts])
    const hoursElements = useMemo(() => hours.map((post) => post.value), [hours])
    const flexHeadArray = useMemo(() => Array(postsElements.length).fill(1), [posts])

    return (
        <View style={styles.container}>
            <Table borderStyle={{ borderWidth: 1 }}>
                <Row data={postsElements} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
                <TableWrapper style={styles.wrapper}>
                    <Col data={hoursElements} style={styles.title} textStyle={styles.text} />
                    <Rows
                        data={shiftDataNamesElements}
                        flexArr={flexHeadArray.slice(0, -1)}
                        style={styles.row}
                        textStyle={styles.text}
                    />
                </TableWrapper>
            </Table>
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
    head: { height: 50, backgroundColor: '#f1f8ff', textAlign: 'center' },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: { height: 50 },
    text: { textAlign: 'center' },
    wrapper: { flexDirection: 'row' },
})

export default withLogs(AvailabilityTableView)

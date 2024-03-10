import {
    createContext,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { Button, IconButton } from 'react-native-paper'
import { StyleSheet, View, Text } from 'react-native'

import { optimize } from '@app/services/optimizeService/OptimizeService'
import AvailabilityTableView from './elements/AvailabilityTableView'
import useShiftUsersListView from './hooks/useShiftUsersListView'
import SplitScreenComp from '@app/components/SplitScreenComp'
import { ShiftBoard, User, UserShiftData } from './models'
import ShiftTableView from './elements/ShiftTableView'
import withLogs from '@app/components/HOC/withLogs'

import useShiftTableView from './hooks/useShiftTableView'
import useEditAddButton from './hooks/useEditAddButton'
import { getEmptyMatrix } from '../../common/utils'
import { index } from 'mathjs'

const ShiftScreen = () => {
    const { isEditing, EditAddButtonView } = useEditAddButton({})

    const {
        list: names,
        selectedNameId,
        view: namesListView,
    } = useShiftUsersListView(isEditing)

    const [constraints, setConstraints] = useState<boolean[][][]>()
    const { posts, hours, isOptimized, ShiftTableView, onOptimize } =
        useShiftTableView(
            selectedNameId,
            isEditing,
            names,
            optimize,
            constraints
        )

    useEffect(() => {
        // if(!constraints){
        setConstraints(
            getDefaultConstraints(names.length, posts.length - 1, hours.length)
        )
        // }
    }, [names, posts, hours])

    //FIXME
    const selectedIndex = useMemo(() => {
        let retIndex = -1
        retIndex = names.findIndex((ele) => ele.id === selectedNameId)
        console.log(`selectedIndex->retIndex:${retIndex}, selectedNameId:${selectedNameId}`)
        return retIndex
    }, [selectedNameId, names])

    const rightView = useMemo(
        () => (
            <View>
                <ShiftTableView />
                {constraints && selectedIndex >= 0 && (
                    <AvailabilityTableView
                        availabilityData={constraints[selectedIndex]}
                        hours={hours}
                        posts={posts}
                        onConstraintsChanged={function (
                            data: boolean[][]
                        ): void {
                            setConstraints(() => {
                                const newConstraints = JSON.parse(
                                    JSON.stringify(constraints)
                                )
                                newConstraints[selectedIndex] = data
                                return newConstraints
                            })
                        }}
                    />
                )}
            </View>
        ),
        [selectedNameId, hours, posts, , isEditing, ShiftTableView]
    )

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <EditAddButtonView style={{ width: '100%', flexGrow: 0 }} />
            </View>
            <SplitScreenComp
                leftPanel={namesListView}
                rightPanel={rightView}
                style={styles.body}
            />
            <Button style={styles.bottom} onPress={onOptimize}>
                optimize
            </Button>
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------
const getDefaultConstraints = (
    userAmount: number,
    postAmount: number,
    hoursAmount: number
): boolean[][][] => {
    const defHoursCons = Array(hoursAmount).fill(true)
    const defPostsCon = Array(postAmount).fill(defHoursCons)
    const defUserCons = Array(userAmount).fill(defPostsCon)

    console.log(
        `getDefaultConstraints-> defUserCons: ${JSON.stringify(defUserCons)}`
    )
    return defUserCons
}
//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flexShrink: 1,
        flexGrow: 1,
        flexBasis: 'auto',
        backgroundColor: 'white',
        padding: 2,
    },
    top: {
        flexDirection: 'row',
        flexGrow: 0,
        flexShrink: 0,
        marginTop: 10,
    },
    body: {
        flexGrow: 1,
        flexBasis: 'auto',
        flexShrink: 1,
        backgroundColor: 'lightblue',
        margin: 5,
    },
    bottom: {
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 30,
        flexBasis: 'auto',
        width: 300,
        alignSelf: 'flex-start',
        backgroundColor: 'lightgreen',
    },
    rightContainer: {
        flexDirection: 'column',
    },
})

export default memo(withLogs(ShiftScreen))

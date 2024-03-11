import { memo, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'

import { optimize } from '@app/services/optimizeService/OptimizeService'
import AvailabilityTableView from './elements/AvailabilityTableView'
import useShiftUsersListView from './hooks/useShiftUsersListView'
import SplitScreenComp from '@app/components/SplitScreenComp'
import withLogs from '@app/components/HOC/withLogs'

import useShiftTableView from './hooks/useShiftTableView'
import useEditAddButton from './hooks/useEditAddButton'
import { UserShiftData } from './models'

const ShiftScreen = () => {
    const [derivedConstraints, setDerivedConstraints] = useState<boolean[][][]>()
    const [usersDataMap, setUsersDataMap] = useState<Map<string, UserShiftData>>(new Map())
    const { isEditing, EditAddButtonView } = useEditAddButton({})
    const { list: names, selectedNameId, view: namesListView } = useShiftUsersListView(isEditing)

    const { posts, hours, isOptimized, ShiftTableView, onOptimize } = useShiftTableView(
        selectedNameId,
        isEditing,
        names,
        optimize,
        derivedConstraints
    )

    const defaultConstraints = useMemo(
        () => getDefaultConstraints(posts.length - 1, hours.length),
        [names, posts, hours]
    )

    const isPopulated = [...usersDataMap.keys()].length > 0

    useEffect(() => {
        setUsersDataMap((oldMap) => {
            const newMap = new Map<string, UserShiftData>()
            let oldVal
            names.forEach((name) => {
                const defaultUserData = {
                    user: name,
                    constraints: defaultConstraints,
                    totalAssignments: 0,
                }
                oldVal = oldMap.get(name.id)
                const newVal = oldVal ?? defaultUserData
                newMap.set(name.id, newVal)
                newMap.set('d', newVal)
            })
            return newMap
        })
    }, [names, hours, posts])

    useEffect(() => {
        if ([...usersDataMap.keys()].length == 0) {
            return
        }

        const newDerivedConstraints = names.reduce((accumulator, current, index) => {
            accumulator.push(usersDataMap.get(current.id)?.constraints)
            return accumulator
        }, [])

        setDerivedConstraints(newDerivedConstraints)
    }, [usersDataMap])

    const selectedIndex = useMemo(() => {
        let retIndex = -1
        retIndex = names.findIndex((ele) => ele.id === selectedNameId)
        console.log(`selectedIndex->retIndex:${retIndex}, selectedNameId:${selectedNameId}`)
        return retIndex
    }, [selectedNameId, names])

    isPopulated &&
        selectedIndex >= 0 &&
        console.log(
            `teee-> names[selectedIndex].id: ${JSON.stringify(names[selectedIndex].id)}, usersDataMap.get(names[selectedIndex].id)?.constraints: ${JSON.stringify(usersDataMap.get(names[selectedIndex].id)?.constraints)}`
        )
    const rightView = (
        <View>
            {isPopulated && <ShiftTableView />}
            {selectedIndex >= 0 && (
                <AvailabilityTableView
                    availabilityData={usersDataMap.get(names[selectedIndex].id)?.constraints}
                    hours={hours}
                    posts={posts}
                    onConstraintsChanged={function (newConstraints: boolean[][]): void {
                        console.log('test')
                        const newUsersDataMap = new Map(usersDataMap)
                        const userData = newUsersDataMap.get(names[selectedIndex].id)
                        if (userData) {
                            userData.constraints = newConstraints
                            setUsersDataMap(newUsersDataMap)
                        }
                        // setConstraints(() => {
                        //     const newConstraints = JSON.parse(JSON.stringify(constraints))
                        //     newConstraints[selectedIndex] = data
                        //     return newConstraints
                        // })
                    }}
                />
            )}
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <EditAddButtonView style={{ width: '100%', flexGrow: 0 }} />
            </View>
            <SplitScreenComp leftPanel={namesListView} rightPanel={rightView} style={styles.body} />
            <Button style={styles.bottom} onPress={onOptimize}>
                optimize
            </Button>
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------
const getDefaultConstraints = (postAmount: number, hoursAmount: number): boolean[][] => {
    const defHoursCons = Array(hoursAmount).fill(true)
    const defPostsCon = Array(postAmount).fill(defHoursCons)

    // console.log(`getDefaultConstraints-> defUserCons: ${JSON.stringify(defUserCons)}`)
    return defPostsCon
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

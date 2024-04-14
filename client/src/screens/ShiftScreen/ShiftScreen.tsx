import { memo, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'

import { optimize } from '@app/services/optimizeService/OptimizeService'
import SplitScreenComp from '@app/common/components/SplitScreenComp'
import AvailabilityTableView from './elements/AvailabilityTableView'
import useShiftUsersListView from './hooks/useShiftUsersListView'
import withLogs from '@app/common/components/HOC/withLogs'

import { Constraint, ShiftMap, UniqueString, User, UserShiftData } from './models'
import useShiftTableView from './hooks/useShiftTableView'
import useEditModeButton from './hooks/useEditModeButton'
import { colors } from '@app/styles'

const ShiftScreen = () => {
    const [shiftMap, setShiftMap] = useState<ShiftMap>(new ShiftMap())
    const { isEditing, EditAddButtonView } = useEditModeButton(true)
    const { list: names, selectedNameId, view: namesListView } = useShiftUsersListView(isEditing)
    const {
        posts,
        hours,
        ShiftTable: ShiftTableView,
        onOptimize,
    } = useShiftTableView(selectedNameId, isEditing, names, () => {
        return optimize(getDerivedConstraints(names, shiftMap))
    })
    const defaultConstraints: Constraint[][] = useMemo(() => getDefaultConstraints(posts, hours), [names, posts, hours])

    useEffect(() => {
        setShiftMap((oldMap) => {
            return deriveUserDataMap(names, defaultConstraints, oldMap)
        })
    }, [JSON.stringify(names), hours, posts])

    const selectedIndex = useMemo(() => {
        let retIndex = -1
        retIndex = names.findIndex((ele) => ele.id === selectedNameId)
        return retIndex
    }, [selectedNameId, JSON.stringify(names)])

    const rightView = ( //TODO memoize
        <View style={{ flexDirection: 'column', flexShrink: 1 }}>
            {shiftMap.usersSize() > 0 && names.length > 0 && ShiftTableView}

            {selectedIndex >= 0 && (
                <AvailabilityTableView
                    style={{ marginTop: 30, flex: 1 }}
                    availabilityData={JSON.parse(
                        JSON.stringify(shiftMap.getUser(names[selectedIndex].id)?.constraints)
                    )}
                    hours={hours}
                    posts={posts}
                    onConstraintsChanged={(newConstraints: Constraint[][]) => {
                        setShiftMap((prev) => {
                            const newShiftMap = prev.copy()
                            const uerShiftData = prev.getUser(names[selectedIndex].id)
                            if (uerShiftData) {
                                uerShiftData.constraints = newConstraints
                                newShiftMap.updateUser(uerShiftData)
                            }
                            return newShiftMap
                        })
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
            <Button style={styles.bottom} onPress={onOptimize} textColor={colors.white}>
                optimize
            </Button>
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------
export function deriveUserDataMap(names: User[], defaultConstraints: Constraint[][], oldMap: ShiftMap): ShiftMap {
    const newMap = new ShiftMap()
    // Loop through each name
    names.forEach(({ id: userId, name }) => {
        // Get existing shift data if present
        const existingShiftData = oldMap.getUser(userId)
        // let userConstraints = defaultConstraints
        let newUserConstraints = JSON.parse(JSON.stringify(defaultConstraints))

        newUserConstraints.forEach((newHourConstraint: Constraint[]) => {
            newHourConstraint.forEach((newPostConstraint) => {
                const id = userId + newPostConstraint.postID + newPostConstraint.hourID
                const oldShift = oldMap.getShift(id)
                newPostConstraint.availability = (oldShift && oldShift.availability) ?? newPostConstraint.availability
            })
        })

        // Determine total assignments
        const totalAssignments = existingShiftData ? existingShiftData.totalAssignments : 0

        // Create user shift data
        const userData: UserShiftData = {
            user: { id: userId, name },
            constraints: newUserConstraints,
            totalAssignments,
        }

        // Add user shift data to result map
        //FIXME: no need to recrate the map, just the constraints
        newMap.addUser(userData)
    })

    return newMap
}

function getDefaultConstraints(posts: UniqueString[], hours: UniqueString[]): Constraint[][] {
    const defaultConstraints: Constraint[][] = []
    posts.forEach((post) => {
        const defaultPostsConstraints: Constraint[] = []
        hours.forEach((hour) => {
            defaultPostsConstraints.push({ availability: true, postID: post.id, hourID: hour.id })
        })
        defaultConstraints.push(defaultPostsConstraints)
    })
    return defaultConstraints
}

function getDerivedConstraints(names: User[], shiftMap: ShiftMap): Constraint[][][] {
    return names.reduce(
        (accumulator, current) => {
            accumulator.push(shiftMap.getUser(current.id)?.constraints ?? ([] as Constraint[][]))
            return accumulator
        },
        [] as Constraint[][][]
    )
}
//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flexShrink: 1,
        flexGrow: 1,
        flexBasis: 'auto',
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
        flexShrink: 2,
        margin: 5,
    },
    bottom: {
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 30,
        flexBasis: 'auto',
        width: 300,
        alignSelf: 'flex-start',
        backgroundColor: colors.military_green,
    },
    rightContainer: {
        flexDirection: 'column',
    },
})

export default memo(withLogs(ShiftScreen))

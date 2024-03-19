import { memo, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'

import { optimize } from '@app/services/optimizeService/OptimizeService'
import AvailabilityTableView from './elements/AvailabilityTableView'
import useShiftUsersListView from './hooks/useShiftUsersListView'
import SplitScreenComp from '@app/components/SplitScreenComp'
import withLogs from '@app/components/HOC/withLogs'

import { Constraint, UniqueString, User, UserShiftData } from './models'
import useShiftTableView from './hooks/useShiftTableView'
import useEditModeButton from './hooks/useEditModeButton'
const ShiftScreen = () => {
    const [derivedConstraints, setDerivedConstraints] = useState<Constraint[][][]>()
    const [usersDataMap, setUsersDataMap] = useState<Map<string, UserShiftData>>(new Map())
    const { isEditing, EditAddButtonView } = useEditModeButton({})
    const { list: names, selectedNameId, view: namesListView } = useShiftUsersListView(isEditing)

    const {
        posts,
        hours,
        ShiftTable: ShiftTableView,
        onOptimize,
    } = useShiftTableView(selectedNameId, isEditing, names, () => {
        return optimize(derivedConstraints)
    })

    const defaultConstraints: Constraint[][] = useMemo(() => getDefaultConstraints(posts, hours), [names, posts, hours])

    const isPopulated = [...usersDataMap.keys()].length > 0 //useMemo

    useEffect(() => {
        setUsersDataMap((oldMap) => {
            return deriveUserDataMap(names, defaultConstraints, oldMap)
        })
    }, [names, hours, posts])

    useEffect(() => {
        if ([...usersDataMap.keys()].length == 0) {
            return
        }
        const newDerivedConstraints = names.reduce(
            (accumulator, current) => {
                accumulator.push(usersDataMap.get(current.id)?.constraints ?? ([] as Constraint[][]))
                return accumulator
            },
            [] as Constraint[][][]
        )
        console.log('newDerivedConstraints: ', newDerivedConstraints)
        setDerivedConstraints(newDerivedConstraints)
    }, [usersDataMap])

    const selectedIndex = useMemo(() => {
        let retIndex = -1
        retIndex = names.findIndex((ele) => ele.id === selectedNameId)
        // console.log(`selectedIndex->retIndex:${retIndex}, selectedNameId:${selectedNameId}`)
        return retIndex
    }, [selectedNameId, names])

    // console.log(
    //     `ShiftScreen->user const:${JSON.stringify(usersDataMap.get(names[selectedIndex].id)?.constraints)}, selectedIndex:${selectedIndex}`
    // )

    const rightView = (
        <View>
            {isPopulated && names.length > 0 && ShiftTableView}
            {selectedIndex >= 0 && (
                <AvailabilityTableView
                    availabilityData={usersDataMap.get(names[selectedIndex].id)?.constraints}
                    hours={hours}
                    posts={posts}
                    onConstraintsChanged={function (newConstraints: Constraint[][]): void {
                        console.log('test')
                        const newUsersDataMap = new Map(usersDataMap)
                        const userData = newUsersDataMap.get(names[selectedIndex].id)
                        if (userData) {
                            userData.constraints = newConstraints
                            setUsersDataMap(newUsersDataMap)
                        }
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
export function deriveUserDataMap(
    names: User[],
    defaultConstraints: Constraint[][],
    oldMap: Map<string, UserShiftData>
) {
    const result = new Map<string, UserShiftData>()

    // Loop through each name
    names.forEach(({ id, name }) => {
        // Get existing shift data if present
        const existingShiftData = oldMap.get(id)
        let userConstraints = defaultConstraints

        //Intersect exiting constraints with the new default constraints
        if (existingShiftData) {
            userConstraints = existingShiftData.constraints.reduce((acc, userConstraintArr) => {
                const intersectionArr = userConstraintArr.filter((userConstraintItem) => {
                    return defaultConstraints.some((defaultConstraint) => {
                        return defaultConstraint.some((defaultConstraintItem) => {
                            return (
                                userConstraintItem.postID === defaultConstraintItem.postID &&
                                userConstraintItem.hourID === defaultConstraintItem.hourID
                            )
                        })
                    })
                })
                intersectionArr && intersectionArr.length > 0 && acc.push(intersectionArr)
                return acc
            }, [] as Constraint[][])
        }

        // Determine total assignments
        const totalAssignments = existingShiftData ? existingShiftData.totalAssignments : 0

        // Create user shift data
        const userData: UserShiftData = {
            user: { id, name },
            constraints: userConstraints,
            totalAssignments,
        }

        // Add user shift data to result map
        result.set(id, userData)
    })

    return result
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
    // console.log(`getDefaultConstraints-> defUserCons: ${JSON.stringify(defUserCons)}`)
    return defaultConstraints
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

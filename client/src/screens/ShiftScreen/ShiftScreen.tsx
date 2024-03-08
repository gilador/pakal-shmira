import {
  createContext,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Button, IconButton } from "react-native-paper"
import { StyleSheet, View, Text } from "react-native"

import { optimize } from "@app/services/optimizeService/OptimizeService"
import AvailabilityTableView from "./elements/AvailabilityTableView"
import useShiftUsersListView from "./hooks/useShiftUsersListView"
import SplitScreenComp from "@app/components/SplitScreenComp"
import { ShiftBoard, User, UserShiftData } from "./models"
import ShiftTableView from "./elements/ShiftTableView"
import withLogs from "@app/components/HOC/withLogs"

import useEditAddButton from "./hooks/useEditAddButton"
import { getEmptyMatrix } from "../../common/utils"

const ShiftScreen = () => {
  const { isEditing, EditAddButtonView } = useEditAddButton({})

  const {
    list: names,
    selectedNameId,
    view: namesListView,
  } = useShiftUsersListView(isEditing)

  const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names))

  const selectedUser = useMemo(() => {
    if (!selectedNameId) return undefined
    const selected = shiftData.users.find(
      (val) => val.user.id === selectedNameId,
    )
    return selected
  }, [selectedNameId, shiftData])

  const handleOptimize = useCallback(async () => {
    try {
      // Optimize user shifts asynchronously
      const optimizedShift: UserShiftData[] = await optimize(shiftData.users)

      // Update shift data
      setShiftData((prev: ShiftBoard) => {
        // const shifts = emptyCellsForSkeleton.slice();
        const shifts = getEmptyMatrix<User>(
          shiftData.hours.length,
          shiftData.posts.length - 1,
          { name: "", id: "" },
        )

        optimizedShift.forEach((userShift, index) => {
          let total = 0
          userShift.assignments.forEach((hourArray, hourIndex) => {
            hourArray.forEach((post, postIndex) => {
              if (post) {
                shifts[postIndex][hourIndex] = userShift.user
                total++
              }
            })
          })
          userShift.totalAssignments = total
        })
        const newShiftBoard: ShiftBoard = {
          users: optimizedShift,
          shifts,
          hours: prev.hours,
          posts: prev.posts,
        }

        return newShiftBoard
      })
    } catch (error) {
      console.error("Error occurred while optimizing shifts:", error)
      // Handle error appropriately, e.g., show error message to the user
    }
  }, [shiftData])

  useEffect(() => {
    setShiftData(getShiftBoardDataMock(names))
  }, [names])

  const rightView = useMemo(
    () => (
      <View>
        <ShiftTableView
          selectedNameId={selectedNameId}
          shifts={shiftData.shifts}
          hours={shiftData.hours}
          posts={shiftData.posts}
          isEditing={isEditing}
        />
        {!selectedNameId && !selectedUser ? null : (
          <AvailabilityTableView
            availabilityData={selectedUser?.constraints}
            hours={shiftData.hours}
            posts={shiftData.posts}
            onConstraintsChanged={function (data: boolean[][]): void {
              setShiftData((pre) => {
                const newState = JSON.parse(JSON.stringify(pre))
                const newUser = newState.users.find(
                  (val: UserShiftData) => val.user.id === selectedNameId,
                ) || { constraints: [] }
                newUser.constraints = data
                return newState
              })
            }}
          />
        )}
      </View>
    ),
    [selectedNameId, shiftData, selectedUser],
  )

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <EditAddButtonView style={{ width: "100%", flexGrow: 0 }} />
      </View>
      <SplitScreenComp
        leftPanel={namesListView}
        rightPanel={rightView}
        style={styles.body}
      />
      <Button style={styles.bottom} onPress={handleOptimize}>
        optimize
      </Button>
    </View>
  )
}

//------------------------------------------functions--------------------------------------------------------

function getShiftBoardDataMock(users: User[]): ShiftBoard {
  const posts = [undefined, "ש.ג1", "ש.ג2", "מערבי", "מזרחי"]
  const hours = [
    "0600-1000",
    "1000-1400",
    "1400-1600",
    "1600-2000",
    "2000-2400",
    "0000-0400",
  ]

  const sharedConstraints = posts.slice(1).reduce((acumPosts, post) => {
    const origRet: boolean[] = hours.reduce((acumeHours, hour) => {
      ;(acumeHours as boolean[]).push(true)
      return acumeHours
    }, [])
    ;(acumPosts as boolean[][]).push(origRet)
    return acumPosts
  }, [])

  const usersConst = users?.reduce((acum, user, index) => {
    let userCon: UserShiftData = {
      user: user,
      assignments: [],
      totalAssignments: 0,
      constraints: sharedConstraints,
    }
    ;(acum as UserShiftData[]).push(userCon)
    return acum
  }, [])

  const mockShiftBoard = {
    users: usersConst,
    posts,
    hours,
    shifts: undefined,
  }
  return mockShiftBoard
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: "auto",
    backgroundColor: "white",
    padding: 2,
  },
  top: {
    flexDirection: "row",
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 10,
  },
  body: {
    flexGrow: 1,
    flexBasis: "auto",
    flexShrink: 1,
    backgroundColor: "lightblue",
    margin: 5,
  },
  bottom: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 30,
    flexBasis: "auto",
    width: 300,
    alignSelf: "flex-start",
    backgroundColor: "lightgreen",
  },
  rightContainer: {
    flexDirection: "column",
  },
})

export default memo(withLogs(ShiftScreen))

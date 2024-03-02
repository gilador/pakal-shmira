import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";

import { optimize } from "@app/services/optimizeService/OptimizieService";
import ShiftTableView from "./elements/ShiftTableView";
import SplitScreenComp from "./elements/SplitScreenComp";
import useShiftUsersListView from "./hooks/useShiftUsersListView";
import { ShiftBoard, User, UserShiftData } from "./models";
import { getEmptyMatrix } from "./utils";
import UseAvailabilityTable from "./hooks/useAvailabilityTable";

export default function ShiftScreen() {
  console.log("ShiftScreen");

  const {
    list: names,
    selectedNameId,
    view: namesListView,
  } = useShiftUsersListView();
  const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names));
  //FIXME too complex, needs to
  const emptyCellsForSkeleton: User[][] = useMemo(() => {
    return getEmptyMatrix<User>(
      shiftData.hours.length,
      shiftData.posts.length - 1,
      { name: "", id: "" }
    );
  }, [shiftData]);

  const handleOptimize = useCallback(async () => {
    try {
      // Optimize user shifts asynchronously
      const optimizedShift: UserShiftData[] = await optimize(shiftData.users);

      // Update shift data
      setShiftData((prev: ShiftBoard) => {
        // const shifts = emptyCellsForSkeleton.slice();
        const shifts = getEmptyMatrix<User>(
          shiftData.hours.length,
          shiftData.posts.length - 1,
          { name: "", id: "" })

        optimizedShift.forEach((userShift, index) => {
          let total = 0;
          userShift.assignments.forEach((hourArray, hourIndex) => {
            hourArray.forEach((post, postIndex) => {
              // console.log(`handleOptimize-> ${userShift.user.name},[${hourIndex}][${postIndex}]= ${post}`);
              if (post) {
                shifts[postIndex][hourIndex] = {
                  name: userShift.user.name,
                  id: `${userShift.user.name}+${index}`,
                };
                total++;
              }
            });
          });
          userShift.totalAssignments = total;
        });
        const newShiftBoard: ShiftBoard = {
          users: optimizedShift,
          shifts,
          hours: prev.hours,
          posts: prev.posts,
        };

        // console.log(`newShiftBoar: ${JSON.stringify(newShiftBoard)}`)
        return newShiftBoard;
      });
    } catch (error) {
      console.error("Error occurred while optimizing shifts:", error);
      // Handle error appropriately, e.g., show error message to the user
    }
  }, [shiftData]);

  const rightView = useMemo(
    () => (
      <View>
        <ShiftTableView
          selectedNameId={selectedNameId}
          shifts={shiftData.shifts}
          hours={shiftData.hours}
          posts={shiftData.posts}
        />
        {!selectedNameId ? null : (
          <UseAvailabilityTable
            data={shiftData.users[0].constraints}
            hours={shiftData.hours}
            posts={shiftData.posts}
            onConstraintsChanged={function (data: boolean[][]): void {
              setShiftData((pre) => {
                console.log(`gigo ->before-> data: ${data}, pre.users[0].constraints : ${JSON.stringify(pre.users[0].constraints )} `)
                pre.users[0].constraints = data;
                console.log(`gigo ->after-> data: ${data}, pre.users[0].constraints : ${JSON.stringify(pre.users[0].constraints )} `)
                return { ...pre };
              });
            }}
          />
        )}
      </View>
    ),
    [selectedNameId, shiftData]
  );

  return (
    <View style={styles.container}>
      {SplitScreenComp({
        leftPanel: namesListView,
        rightPanel: rightView,
        style: styles.top,
      })}
      <Button style={styles.bottom} onPress={handleOptimize}>
        optimize
      </Button>
    </View>
  );
}

//------------------------------------------functions--------------------------------------------------------

function getShiftBoardDataMock(users: User[]): ShiftBoard {
  const posts = ["", "ש.ג1", "ש.ג2", "מערבי", "מזרחי"];
  const hours = [
    "0600-1000",
    "1000-1400",
    "1400-1600",
    "1600-2000",
    "2000-2400",
    "0000-0400",
  ];

  const sharedConstraints = posts.slice(1).reduce((acumPosts, post) => {
    const origRet: boolean[] = hours.reduce((acumeHours, hour) => {
      (acumeHours as boolean[]).push(true);
      return acumeHours;
    }, []);
    (acumPosts as boolean[][]).push(origRet);
    return acumPosts;
  }, []);

  const usersConst = users?.reduce((acum, user, index) => {
    let userCon: UserShiftData = {
      user: { name: user.name || "", id: `${user.name}+${index}` },
      assignments: [],
      totalAssignments: 0,
      constraints: sharedConstraints,
    };
    (acum as UserShiftData[]).push(userCon);
    return acum;
  }, []);

  const mockShiftBoard = {
    users: usersConst,
    posts,
    hours,
    shifts: undefined,
  };
  return mockShiftBoard;
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flexShrink: 1,
    flexGrow: 1,
    backgroundColor: "white",
    padding: 2,
  },
  top: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: "lightblue",
    margin: 5,
  },
  bottom: {
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: 30,
    width: 300,
    alignSelf: "flex-start",
    backgroundColor: "lightgreen",
  },
  rightContainer: {
    flexDirection: "column",
  },
});

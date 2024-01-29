export function createObjectList(arr: string[]): { label: string, value: string }[] {
    let objList: { label: string, value: string }[] = [];
    for (let i = 0; i < arr.length; i++) {
        let obj = {
            label: arr[i],
            value: arr[i]
        };
        objList.push(obj);
    }
    return objList;
}

import auth from "@react-native-firebase/auth"

export default class NagaUtils {
  static isSignedInWithPassword() {
    let providerData = auth().currentUser?.providerData

    if (providerData == undefined || providerData == null) {
      console.warn("Current user is null or undefined");
    }

    for (let data of providerData) {
      if (data.providerId === "password") {
        return true;
      }
    }

    return false;
  }

  static sortTodoComparator(a, b, sortBy) {
    function compareDueDate() {

      let x = new Date(a.dueDate);
      x.setHours(0,0,0,0);

      let y = new Date(b.dueDate);
      y.setHours(0,0,0,0);

      if (a.allDay && b.allDay) { 
        if (x.getTime() == y.getTime()) //Same day
          return a.createdAt > b.createdAt;
        else 
          return x > y;
      } else if (a.allDay)
        return x.getTime() - 1 > b.dueDate;
      else if (b.allDay)
        return a.dueDate > y.getTime() - 1; //Take away one so that all days always appear before other todos, even 12:00AM ones
      else 
        return a.dueDate > b.dueDate;
    }

    function compare() {
      if (sortBy === 'creation date') {
        return a.createdAt > b.createdAt;
      } else if (sortBy === 'due date') {
        if (a.dueDate == null && b.dueDate == null)
          return a.createdAt > b.createdAt;
        else if (a.dueDate == null)
          return true
        else if (b.dueDate == null)
          return false
        else
          return compareDueDate()
      } else if (sortBy === 'title') {
        let res = a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })
        if (res === 0)
          return a.createdAt > b.createdAt;
        return res;
      } else {
        console.warn("sortBy not recognized: " + sortBy);
      }
    }

    return (
      (a.pinned && b.pinned)
      ? compare()
      : a.pinned
      ? false
      : b.pinned
      ? true 
      : compare()
    )
  }

  static getNumberOfOptions(u) {
    let n;
    switch(u) {
      case "minutes":
        n = 60;
        break;
      case "hours":
        n = 24;
        break;
      case "days":
        n = 28;
        break;
      case "weeks":
        n = 4;
        break;
      default:
        console.warn("Units not recognized in getNumberOfOptions(units)");
        break;
    }
    return n;
  }
}
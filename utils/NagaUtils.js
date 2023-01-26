export default class NagaUtils {
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
        return x.getTime() > b.dueDate;
      else if (b.allDay)
        return a.dueDate > y.getTime();
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
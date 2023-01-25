export default class Todo {
  constructor(title, description, color = 'green', dueDate = null) {
    this.title = title;
    this.description = description;
    this.color = color;
    this.dueDate = dueDate?.getTime();
    this.pinned = false;
    this.complete = false;
    this.createdAt = Date.now();

    this.reminder = "none";
    this.customReminder = "30 minutes";
  }
}
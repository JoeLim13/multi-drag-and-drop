// @flow
import type { Column, Entities, Id, Task, TaskMap } from "./types";

const tabNames = [
  "Branch",
  "Buyer 2",
  "Buyer",
  "Created by",
  "Customer ID",
  "Customer Name",
  "Customer PO",
  "Expected completion date",
  "Expected delv date",
  "Expected pick up date",
  "Expected receipt date",
  "Expected schedule date",
  "Expected ship date",
  "In use",
  "Job number",
  "Last accessed",
  "MISC 1",
  "MISC 10",
  "MISC 11",
  "MISC 12",
  "Order date",
  "Ordered by",
  "Origin type",
  "Original tran",
  "Parent PO #",
  "PO label",
  "Purchase type",
  "Quoted for",
  "Reference",
  "Reference",
  "Related CM",
  "Reman type",
  "Route (order)",
  "Sale type",
  "Ship via",
  "Ship-from address 1",
  "Ship-to name",
  "Ship-to seq #",
  "Source",
  "Staging status",
  "Status",
  "Tran ID",
  "Tran type"
];

const tasks: Task[] = Array.from({ length: 20 }, (v, k) => k).map(
  (val: number): Task => ({
    id: `task-${val}`,
    content: tabNames[val]
  })
);

const taskMap: TaskMap = tasks.reduce(
  (previous: TaskMap, current: Task): TaskMap => {
    previous[current.id] = current;
    return previous;
  },
  {}
);

const todo: Column = {
  id: "todo",
  title: "Available columns",
  taskIds: tasks.map((task: Task): Id => task.id)
};

const done: Column = {
  id: "done",
  title: "Show these columns in this order",
  taskIds: []
};

const entities: Entities = {
  columnOrder: [todo.id, done.id],
  columns: {
    [todo.id]: todo,
    [done.id]: done
  },
  tasks: taskMap
};

export default entities;

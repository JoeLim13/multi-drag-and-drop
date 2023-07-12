import React, { Component } from "react";
import styled from "@emotion/styled";
import memoizeOne from "memoize-one";
import { colors } from "@atlaskit/theme";
import { Droppable } from "react-beautiful-dnd";
import Task from "./task";
import type {
  DroppableProvided,
  DroppableStateSnapshot
} from "react-beautiful-dnd";
import type { Column as ColumnType, Task as TaskType, Id } from "./types";

type Props = {
  column: ColumnType;
  tasks: TaskType[];
  selectedTaskIds: Id[];
  draggingTaskId?: Id;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id, fromTaskId?: Id) => void;
};

const Container = styled.div`
  /* we want the column to take up its full height */
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-weight: bold;
  padding: 8px;
  padding-bottom: 0;
  margin-bottom: 0;
`;

const TaskList = styled.div<any>`
  width: 260px;
  margin: 8px;
  border-radius: 4px;
  border: 1px solid ${colors.N100};
  padding: 8px;
  min-height: 200px;
  flex-grow: 1;
  transition: background-color 0.2s ease;
  ${(props) =>
    props.isDraggingOver ? `background-color: ${colors.N200}` : ""};
`;

type TaskIdMap = {
  [taskId: string]: true;
};

const getSelectedMap = memoizeOne((selectedTaskIds: Id[]) =>
  selectedTaskIds.reduce((previous: TaskIdMap, current: Id): TaskIdMap => {
    previous[current] = true;
    return previous;
  }, {})
);

export default class Column extends Component<Props> {
  taskRefs: { [taskId: string]: React.RefObject<any> } = {};

  state = {
    columnHasFocus: false
  };
  focusFirst = () => {
    const task = this.props.tasks[0];
    if (task) {
      this.taskRefs[task.id].current.focus();
    }
  };

  focusLast = () => {
    const task = this.props.tasks[this.props.tasks.length - 1];
    if (task) {
      this.taskRefs[task.id].current.focus();
    }
  };

  focusNext = (taskId: string, select?: boolean) => {
    const idx = this.props.tasks.findIndex((task) => task.id === taskId);
    if (idx > -1 && this.props.tasks[idx + 1]) {
      const nextId = this.props.tasks[idx + 1];
      this.taskRefs[nextId.id].current.focus();
      if (select) {
        if (!this.props.selectedTaskIds.includes(taskId)) {
          this.props.toggleSelectionInGroup(taskId);
        }
        if (!this.props.selectedTaskIds.includes(nextId.id)) {
          this.props.toggleSelectionInGroup(nextId.id);
        }
      }
    }
  };

  focusPrev = (taskId: string, select?: boolean) => {
    const idx = this.props.tasks.findIndex((task) => task.id === taskId);
    if (idx > -1 && this.props.tasks[idx - 1]) {
      const prevId = this.props.tasks[idx - 1];
      this.taskRefs[prevId.id].current.focus();
      if (select) {
        if (!this.props.selectedTaskIds.includes(taskId)) {
          this.props.toggleSelectionInGroup(taskId);
        }
        if (!this.props.selectedTaskIds.includes(prevId.id)) {
          this.props.toggleSelectionInGroup(prevId.id);
        }
      }
    }
  };

  multiSelectToFirst = (fromTaskId: Id) => {
    const task = this.props.tasks[0];
    if (task) {
      this.taskRefs[task.id].current.focus();
      this.props.multiSelectTo(task.id, fromTaskId);
    }
  };

  multiSelectToLast = (fromTaskId: Id) => {
    const task = this.props.tasks[this.props.tasks.length - 1];
    if (task) {
      this.taskRefs[task.id].current.focus();
      this.props.multiSelectTo(task.id, fromTaskId);
    }
  };

  toggleColumn = () => {
    const willSelect = !this.props.tasks.every((task) =>
      this.props.selectedTaskIds.includes(task.id)
    );

    this.props.tasks.forEach((task) => {
      if (this.props.selectedTaskIds.includes(task.id) !== willSelect) {
        console.log("toggling", task.id);
        this.props.toggleSelectionInGroup(task.id);
      } else {
        console.log("not toggling", task.id);
      }
    });
  };

  onBlur = () => {
    this.setState({ columnHasFocus: false });
  };

  render() {
    const column: ColumnType = this.props.column;
    const tasks: TaskType[] = this.props.tasks;
    const selectedTaskIds: Id[] = this.props.selectedTaskIds;
    const draggingTaskId = this.props.draggingTaskId;
    return (
      <Container
        onFocus={() => this.setState({ columnHasFocus: true })}
        onBlur={this.onBlur}
      >
        <Title>{column.title}</Title>
        <Droppable droppableId={column.id}>
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <TaskList
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
              {...provided.droppableProps}
            >
              {tasks.map((task: TaskType, index: number) => {
                this.taskRefs[task.id] = React.createRef();
                const isSelected: boolean = Boolean(
                  getSelectedMap(selectedTaskIds)[task.id]
                );
                const isGhosting: boolean =
                  isSelected &&
                  Boolean(draggingTaskId) &&
                  draggingTaskId !== task.id;
                return (
                  <Task
                    innerRef={this.taskRefs[task.id]}
                    task={task}
                    index={index}
                    key={task.id}
                    isSelected={isSelected}
                    isGhosting={isGhosting}
                    selectionCount={selectedTaskIds.length}
                    tabIndex={
                      index === 0 && !this.state.columnHasFocus ? 0 : -1
                    }
                    toggleSelection={this.props.toggleSelection}
                    toggleSelectionInGroup={this.props.toggleSelectionInGroup}
                    multiSelectTo={this.props.multiSelectTo}
                    multiSelectToFirst={this.multiSelectToFirst}
                    multiSelectToLast={this.multiSelectToLast}
                    focusNext={this.focusNext}
                    focusPrev={this.focusPrev}
                    focusFirst={this.focusFirst}
                    focusLast={this.focusLast}
                    toggleColumn={this.toggleColumn}
                  />
                );
              })}
              {provided.placeholder}
            </TaskList>
          )}
        </Droppable>
      </Container>
    );
  }
}

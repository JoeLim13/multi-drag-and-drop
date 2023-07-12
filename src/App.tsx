// Don't look at me, I'm hideous!

import React, { Component } from "react";
import styled from "@emotion/styled";
import {
  DragDropContext,
  useMouseSensor,
  useTouchSensor
} from "react-beautiful-dnd";
import initial from "./data";
import Column from "./column";
import type { Result as ReorderResult } from "./utils";
import { mutliDragAwareReorder, multiSelectTo as multiSelect } from "./utils";
import type { DragStart, DropResult } from "react-beautiful-dnd";
import type { Entities, Task, Id } from "./types";
import useCustomKeyboard from "./use-custom-keyboard-sensor";
import KeyboardDocs from "./KeyboardDocs";

import {
  boxesIntersect,
  SelectionBox,
  useSelectionContainer
} from "react-drag-to-select";

import MouseSelection from "./MouseSelection";
type KeyICareAbout = "SHIFT" | "CTRL";
type DragType = "NORMAL" | KeyICareAbout;

type State = {
  entities: Entities;
  selectedTaskIds: Id[];
  draggingTaskId?: Id;
};

const Wrapper = styled.div`
  margin-left: 60px;
  margin-bottom: 50px;
`;

const Container = styled.div`
  display: flex;
  user-select: none;
`;

const getTasks = (entities: Entities, columnId: Id): Task[] =>
  entities.columns[columnId].taskIds.map(
    (taskId: Id): Task => entities.tasks[taskId]
  );

export default class TaskApp extends Component<any, State> {
  columnRefs: React.RefObject<any>[] = [];

  state: State = {
    entities: initial,
    selectedTaskIds: [],
    draggingTaskId: undefined
  };

  componentDidMount() {
    //window.addEventListener("click", this.onWindowClick as any);
    window.addEventListener("keydown", this.onWindowKeyDown);
    window.addEventListener("touchend", this.onWindowTouchEnd);
  }

  componentWillUnmount() {
    //window.removeEventListener("click", this.onWindowClick as any);
    window.removeEventListener("keydown", this.onWindowKeyDown);
    window.removeEventListener("touchend", this.onWindowTouchEnd);
  }

  onDragStart = (start: DragStart) => {
    const id = start.draggableId;
    const selected = this.state.selectedTaskIds.find(
      (taskId: Id): boolean => taskId === id
    );

    // if dragging an item that is not selected - unselect all items
    if (!selected) {
      this.unselectAll();
    }
    this.setState({
      draggingTaskId: start.draggableId
    });
  };

  onDragEnd = (result: DropResult) => {
    const destination = result.destination;
    const source = result.source;

    if (
      destination?.droppableId &&
      destination.droppableId !== source.droppableId
    ) {
      if (source.droppableId === "todo") {
        this.columnRefs[0].current.onBlur();
      } else {
        this.columnRefs[1].current.onBlur();
      }
    }
    // nothing to do
    if (!destination || result.reason === "CANCEL") {
      this.setState({
        draggingTaskId: undefined
      });
      return;
    }

    const processed: ReorderResult = mutliDragAwareReorder({
      entities: this.state.entities,
      selectedTaskIds: this.state.selectedTaskIds,
      source,
      destination
    });

    this.setState({
      ...processed,
      draggingTaskId: undefined
    });
  };

  onWindowKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape") {
      this.unselectAll();
    }
  };

  onWindowClick = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    this.unselectAll();
  };

  onWindowTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    this.unselectAll();
  };

  toggleSelection = (taskId: Id) => {
    const selectedTaskIds: Id[] = this.state.selectedTaskIds;
    const wasSelected: boolean = selectedTaskIds.includes(taskId);

    const newTaskIds: Id[] = (() => {
      // Task was not previously selected
      // now will be the only selected item
      if (!wasSelected) {
        return [taskId];
      }

      // Task was part of a selected group
      // will now become the only selected item
      if (selectedTaskIds.length > 1) {
        return [taskId];
      }

      // task was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    this.setState({
      selectedTaskIds: newTaskIds
    });
  };

  toggleSelectionInGroup = (taskId: Id) => {
    this.setState((prevState) => {
      const selectedTaskIds: Id[] = prevState.selectedTaskIds;
      const index: number = selectedTaskIds.indexOf(taskId);

      let newSelectedTaskIds = selectedTaskIds;
      // if not selected - add it to the selected items
      if (index === -1) {
        newSelectedTaskIds = [...selectedTaskIds, taskId];
      } else {
        // it was previously selected and now needs to be removed from the group
        const shallow: Id[] = [...selectedTaskIds];
        shallow.splice(index, 1);
        newSelectedTaskIds = shallow;
      }
      return {
        ...prevState,
        selectedTaskIds: newSelectedTaskIds
      };
    });
  };

  // This behaviour matches the MacOSX finder selection
  multiSelectTo = (newTaskId: Id, fromTaskId?: Id) => {
    const updated: Id[] = multiSelect(
      this.state.entities,
      this.state.selectedTaskIds,
      newTaskId,
      fromTaskId
    );

    if (updated == null) {
      return;
    }

    this.setState({
      selectedTaskIds: updated
    });
  };

  unselect = () => {
    this.unselectAll();
  };

  unselectAll = () => {
    this.setState({
      selectedTaskIds: []
    });
  };

  focusNext = (taskId: Id) => {};

  handleSelectionChange = () => {
    // setSelectionBox(box);
  };

  handleSelectionEnd = (box: SelectionBox, dragType: DragType) => {
    let elements: { [taskId: string]: Element } = {};
    this.columnRefs.forEach((columnRef) => {
      Object.keys(columnRef.current.taskRefs).forEach((taskId) => {
        const task = columnRef.current.taskRefs[taskId].current;
        if (!!task) {
          elements[taskId] = task;
        }
      });
    });

    console.log(this.state.selectedTaskIds);
    let tasksToSelect =
      dragType === "CTRL" ? this.state.selectedTaskIds.slice() : [];
    let firstItem = true;
    let toggleOn = true;
    Object.keys(elements).forEach((taskId) => {
      const item = elements[taskId];
      const boundingBox = item.getBoundingClientRect();
      if (boxesIntersect(box, boundingBox)) {
        console.log("intersect");
        if (dragType === "CTRL") {
          if (firstItem) {
            firstItem = false;
            toggleOn = !tasksToSelect.includes(taskId);
          }
          if (toggleOn) {
            tasksToSelect.push(taskId);
          } else {
            tasksToSelect = tasksToSelect.filter(
              (selectedTaskId) => selectedTaskId !== taskId
            );
          }
        } else {
          tasksToSelect.push(taskId);
        }
      }
    });
    console.log(tasksToSelect);
    this.setState({ selectedTaskIds: tasksToSelect });
  };

  render() {
    const entities: Entities = this.state.entities;
    const selected: Id[] = this.state.selectedTaskIds;
    return (
      <Wrapper>
        <div style={{ position: "relative" }}>
          <MouseSelection
            onSelectionChange={this.handleSelectionChange}
            onSelectionEnd={this.handleSelectionEnd}
          />
        </div>
        <DragDropContext
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          enableDefaultSensors={false}
          sensors={[useMouseSensor, useCustomKeyboard, useTouchSensor]}
        >
          <Container>
            {entities.columnOrder.map((columnId: Id, i) => {
              this.columnRefs[i] = React.createRef();

              return (
                <Column
                  ref={this.columnRefs[i]}
                  column={entities.columns[columnId]}
                  tasks={getTasks(entities, columnId)}
                  selectedTaskIds={selected}
                  key={columnId}
                  draggingTaskId={this.state.draggingTaskId}
                  toggleSelection={this.toggleSelection}
                  toggleSelectionInGroup={this.toggleSelectionInGroup}
                  multiSelectTo={this.multiSelectTo}
                />
              );
            })}
          </Container>
        </DragDropContext>
        <div>
          <KeyboardDocs />
        </div>
      </Wrapper>
    );
  }
}

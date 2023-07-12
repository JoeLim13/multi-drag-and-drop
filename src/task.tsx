import React, { Component } from "react";
import styled from "@emotion/styled";
import { colors } from "@atlaskit/theme";
import { Draggable } from "react-beautiful-dnd";
import type {
  DraggableProvided,
  DraggableStateSnapshot
} from "react-beautiful-dnd";
import type { Id, Task as TaskType } from "./types";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const primaryButton = 0;

type Props = {
  innerRef: React.MutableRefObject<HTMLDivElement | null>;
  task: TaskType;
  index: number;
  isSelected: boolean;
  isGhosting: boolean;
  selectionCount: number;
  tabIndex: number;
  toggleSelection: (taskId: Id) => void;
  toggleSelectionInGroup: (taskId: Id) => void;
  multiSelectTo: (taskId: Id) => void;
  multiSelectToLast: (fromTaskId: Id) => void;
  multiSelectToFirst: (fromTaskId: Id) => void;
  focusNext: (taskId: Id, select?: boolean) => void;
  focusPrev: (taskId: Id, select?: boolean) => void;
  focusFirst: () => void;
  focusLast: () => void;
  toggleColumn: () => void;
};

type GetBackgroundColorArgs = {
  isSelected: boolean;
  isDragging: boolean;
  isGhosting: boolean;
};

const getBackgroundColor = ({
  isSelected,
  isGhosting
}: GetBackgroundColorArgs): string => {
  if (isGhosting) {
    return colors.N10;
  }

  if (isSelected) {
    return colors.B50;
  }

  return colors.N10;
};

const getColor = ({
  isSelected,
  isGhosting
}: {
  isSelected: boolean;
  isGhosting: boolean;
}): string => {
  if (isGhosting) {
    return "darkgrey";
  }
  if (isSelected) {
    return colors.B200;
  }
  return colors.N900;
};

const Container = styled.div<any>`
  background-color: ${(props) => getBackgroundColor(props)};
  color: ${(props) => getColor(props)};
  padding: 6px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 16px;
  border: 1px solid ${colors.N90};
  ${(props) =>
    props.isDragging ? `box-shadow: 2px 2px 1px ${colors.N90};` : ""}
  ${(props) =>
    props.isGhosting
      ? "opacity: 0.8;"
      : ""}

  /* needed for SelectionCount */
  position: relative;

  /* avoid default outline which looks lame with the position: absolute; */
  &:focus {
    outline: none;
    border-color: rgb(0, 117, 196);
    box-shadow: 0 0 4px 1px rgb(0, 117, 196);
  }
`;
/* stylelint-disable block-no-empty */
const Content = styled.div``;
/* stylelint-enable */
const size: number = 30;

const SelectionCount = styled.div`
  right: -8px;
  top: -8px;
  color: ${colors.N0};
  background: ${colors.N200};
  border-radius: 50%;
  height: ${size}px;
  width: ${size}px;
  line-height: ${size}px;
  position: absolute;
  text-align: center;
  font-size: 0.8rem;
`;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
  home: 36,
  end: 35,
  a: 65
};

export default class Task extends Component<Props> {
  onKeyDown = (
    event: KeyboardEvent,
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot
  ) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode === keyCodes.arrowDown) {
      event.preventDefault();
      this.props.focusNext(
        this.props.task.id,
        this.wasMultiSelectKeyUsed(event)
      );
    }

    if (event.keyCode === keyCodes.arrowUp) {
      event.preventDefault();
      this.props.focusPrev(
        this.props.task.id,
        this.wasMultiSelectKeyUsed(event)
      );
    }

    if (event.keyCode === keyCodes.home) {
      event.preventDefault();

      if (this.wasMultiSelectKeyUsed(event)) {
        this.props.multiSelectToFirst(this.props.task.id);
      } else {
        this.props.focusFirst();
      }
    }

    if (event.keyCode === keyCodes.end) {
      event.preventDefault();
      if (this.wasMultiSelectKeyUsed(event)) {
        this.props.multiSelectToLast(this.props.task.id);
      } else {
        this.props.focusLast();
      }
    }

    if (event.keyCode === keyCodes.enter) {
      event.preventDefault();
      this.performAction(event);
    }

    if (
      event.keyCode === keyCodes.a &&
      this.wasToggleInSelectionGroupKeyUsed(event)
    ) {
      event.preventDefault();
      this.props.toggleColumn();
    }
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    this.performAction(event);
  };

  onTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    this.props.toggleSelectionInGroup(this.props.task.id);
  };

  // Determines if the platform specific toggle selection in group key was used
  wasToggleInSelectionGroupKeyUsed = (event: MouseEvent | KeyboardEvent) => {
    const isUsingWindows = navigator.platform.indexOf("Win") >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  // Determines if the multiSelect key was used
  wasMultiSelectKeyUsed = (event: MouseEvent | KeyboardEvent) => event.shiftKey;

  performAction = (event: MouseEvent | KeyboardEvent) => {
    const {
      task,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo
    } = this.props;

    if (this.wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(task.id);
      return;
    }

    if (this.wasMultiSelectKeyUsed(event)) {
      multiSelectTo(task.id);
      return;
    }

    toggleSelection(task.id);
  };

  render() {
    const task: TaskType = this.props.task;
    const index: number = this.props.index;
    const isSelected: boolean = this.props.isSelected;
    const selectionCount: number = this.props.selectionCount;
    const isGhosting: boolean = this.props.isGhosting;
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
          const shouldShowSelection: boolean =
            snapshot.isDragging && selectionCount > 1;

          return (
            <Container
              ref={(ref) => {
                // keep a reference to the dom ref as an instance property
                this.props.innerRef.current = ref;
                // give the dom ref to react-beautiful-dnd
                provided.innerRef(ref);
              }}
              data-draggable
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              tabIndex={this.props.tabIndex}
              onClick={this.onClick as any}
              onTouchEnd={this.onTouchEnd as any}
              onKeyDown={(event: any) =>
                this.onKeyDown(event, provided, snapshot)
              }
              isDragging={snapshot.isDragging}
              isSelected={isSelected}
              isGhosting={isGhosting}
            >
              <Content>{task.content}</Content>
              {shouldShowSelection ? (
                <SelectionCount>{selectionCount}</SelectionCount>
              ) : null}
            </Container>
          );
        }}
      </Draggable>
    );
  }
}

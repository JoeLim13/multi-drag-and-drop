import React, { useRef, useEffect } from "react";
import { SelectionBox, useSelectionContainer } from "react-drag-to-select";

type KeyICareAbout = "SHIFT" | "CTRL";
type DragType = "NORMAL" | KeyICareAbout;

// Don't look in here, seriously.
const MouseSelection = React.memo(
  ({ eventsElement, onSelectionChange, onSelectionEnd }: any) => {
    const selection = useRef({} as SelectionBox);
    const dragType = useRef<DragType>("NORMAL");
    const keysDown = useRef<KeyICareAbout[]>([]);

    // OK, so this code has made me wary of using this library.
    // It would be infinitely easier to check for a modifier key
    // on the click event that started the drag, instead of this
    // keydown tracking.  Maybe we can fork it.
    useEffect(() => {
      const keyDownListener = (e: KeyboardEvent) => {
        if (e.shiftKey) {
          if (!keysDown.current.includes("SHIFT")) {
            keysDown.current.push("SHIFT");
          }
        }
        if (e.ctrlKey || e.metaKey) {
          if (!keysDown.current.includes("CTRL")) {
            keysDown.current.push("CTRL");
          }
        }
      };
      const keyUpListener = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
          keysDown.current = keysDown.current.filter((key) => key !== "SHIFT");
        }
        if (e.key === "Meta" || e.key === "Control") {
          keysDown.current = keysDown.current.filter((key) => key !== "CTRL");
        }
      };

      document.addEventListener("keydown", keyDownListener);
      document.addEventListener("keyup", keyUpListener);

      return () => {
        document.removeEventListener("keydown", keyDownListener);
        document.removeEventListener("keyup", keyUpListener);
      };
    }, []);

    const { DragSelection } = useSelectionContainer({
      onSelectionChange: (box) => {
        selection.current = box;
        onSelectionChange(box, dragType.current);
      },
      onSelectionStart: () => {
        if (keysDown.current.includes("SHIFT")) {
          dragType.current = "SHIFT";
        } else if (keysDown.current.includes("CTRL")) {
          dragType.current = "CTRL";
        } else {
          dragType.current = "NORMAL";
        }
      },
      onSelectionEnd: () => {
        if (selection.current?.height >= 5) {
          onSelectionEnd(selection.current, dragType.current);
          selection.current = {} as SelectionBox;
        }
      },
      eventsElement
    });

    return <DragSelection />;
  }
);

export default MouseSelection;

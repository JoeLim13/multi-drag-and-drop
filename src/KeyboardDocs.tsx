import React from "react";
import styled from "@emotion/styled";

const isMac = window.navigator.platform.toLowerCase().includes("mac");

const Wrapper = styled.div`
  margin: 8px;
  margin-top: 30px;
`;

const Kbd = styled.kbd`
  background-color: #eee;
  border-radius: 3px;
  border: 1px solid #b4b4b4;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
    0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
  color: #333;
  display: inline-block;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
`;

const Table = styled.table``;

const KeyCell = styled.td`
  min-width: 175px;
`;

const Summary = styled.summary`
  font-weight: 700;
  font-size: 18px;
`;

const Subheader = styled.h4`
  padding-top: 10px;
  margin-bottom: 0;
`;

const KeyboardDocs = () => {
  return (
    <Wrapper>
      <details>
        <Summary>Keyboard Commands Reference</Summary>
        <Table>
          <tbody>
            <tr>
              <KeyCell>
                <Kbd>Up</Kbd> / <Kbd>Down</Kbd>
              </KeyCell>
              <td>Moves focus to the previous/next item</td>
            </tr>
            <tr>
              <KeyCell>
                <Kbd>Enter</Kbd>
              </KeyCell>
              <td>Selects/deselects focused item</td>
            </tr>
            <tr>
              <KeyCell>
                <Kbd>Home</Kbd> / <Kbd>End</Kbd>
              </KeyCell>
              <td>Moves focus to the first/last option</td>
            </tr>
            <tr>
              <KeyCell>
                <Kbd>Shift</Kbd> + <Kbd>Up</Kbd> / <Kbd>Down</Kbd>
              </KeyCell>
              <td>Moves focus and selects additional, consecutive options</td>
            </tr>
            <tr>
              <KeyCell>
                {isMac ? <Kbd>⌘ Cmd</Kbd> : <Kbd>Ctrl</Kbd>} + <Kbd>A</Kbd>
              </KeyCell>
              <td>Selects/deselects all options in the list</td>
            </tr>
            <tr>
              <KeyCell>
                <Kbd>Shift</Kbd> + <Kbd>Home</Kbd> / <Kbd>End</Kbd>
              </KeyCell>
              <td>
                Selects the focused option and all options to the first/last
                option
              </td>
            </tr>

            <tr>
              <KeyCell>
                <Kbd>Space</Kbd>
              </KeyCell>
              <td>Toggles on/off Drag and Drop Mode</td>
            </tr>
            <tr>
              <td colSpan={2}>
                <Subheader>While in Drag & Drop Mode</Subheader>
              </td>
            </tr>
            <tr>
              <KeyCell>
                <Kbd>Up</Kbd> / <Kbd>Down</Kbd>
              </KeyCell>
              <td>Moves the selected options within the list</td>
            </tr>
            <tr>
              <KeyCell>
                <Kbd>Left</Kbd> / <Kbd>Right</Kbd>
              </KeyCell>
              <td>Moves the selected items different list (if applicable)</td>
            </tr>
          </tbody>
        </Table>
      </details>
    </Wrapper>
  );
};

export default KeyboardDocs;

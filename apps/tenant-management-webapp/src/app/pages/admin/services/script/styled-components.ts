import styled, { createGlobalStyle } from 'styled-components';

export const IdField = styled.div`
  min-height: 2.1rem;
  background-color: #dcdcdc;
`;

export const TableDiv = styled.div`
  word-wrap: break-word;
  table-layout: fixed;
  & th:nth-child(3) {
    min-width: 160px;
  }

  & td:nth-child(3) {
    min-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
export const UseServiceAccountWrapper = styled.div`
  line-height: 2.5em;
  display: flex;
`;

export const HeadingDiv = styled.div`
  display: flex;
  column-gap: 0.6rem;

  img {
    margin-bottom: 4px;
  }
`;

export const DataTableWrapper = styled.div`
  .goa-checkbox input[type='checkbox'] {
    display: none !important;
  }

  .goa-checkbox {
    margin-left: 10px;
    min-height: calc(3rem - 10px);
  }

  th {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: white;
    padding-left: 0em !important;
  }
  thead,
  tbody {
    display: block;
  }

  tbody {
    overflow-y: hidden;
    overflow-x: hidden;
  }

  .role-name {
    width: 35em;
  }
  .role-label {
    width: 29em;
  }
  .role-checkbox {
    width: 4em;
    text-align: center;
  }

  .role {
    width: 4em;
    text-align: center;
  }

  td {
    padding: 0em !important;
  }

  table {
    border-collapse: collapse !important;
    width: 100%;
  }

  th {
    white-space: pre-wrap;
  }

  thead {
    padding-top: 1.25rem;
  }
`;
export const BodyGlobalStyles = createGlobalStyle<{ hideOverflow: boolean }>`
  body {
    overflow:  ${(props) => (props.hideOverflow ? `hidden` : `auto`)};
  }
`;
export const Modal = styled.div<{ open: boolean }>`
  display: ${(props) => (props.open ? `block` : `none`)};
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 10000;
  width: 100%;
`;
export const ModalContent = styled.div`
  background: white;
`;
export const MonacoDiv = styled.div`
  display: flex;
  border: 1px solid var(--color-gray-700);
  border-radius: 3px;
  padding: 0.15rem 0.15rem;
`;
export const MonacoDivBody = styled.div`
  display: flex;
  border: 1px solid var(--color-gray-700);
  border-radius: 3px;
  padding: 0.15rem 0.15rem;
  min-height: 65px;
  height: calc(92vh - 310px);
`;
export const TestInputDivBody = styled.div`
  display: flex;
  border: 1px solid var(--color-gray-700);
  border-radius: 3px;
  padding: 0.15rem 0.15rem;
  min-height: 65px;
  height: calc(60vh - 310px);
`;
export const ScriptPanelContainer = styled.div`
  display: flex;
  flex: auto;
  padding-left: 3rem;
  width: 90%;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
`;
export const EditScriptActions = styled.div`
  display: flex;
  justify-content: right;
  gap: 1rem;
  padding-top: 1rem;
`;

export const ScriptEditorContainer = styled.div`
  width: 50%;
  padding-right: 1rem;
  padding-left: 1rem;
  overflow: hidden;
  &:hover {
    overflow: auto;
  }

  @media (min-width: 1279px) {
    .mobile {
      display: none;
    }
  }

  @media (max-width: 1280px) {
    .desktop {
      display: none;
    }

    .mobile > div {
      padding: 2px 0 2px 3px;
    }
  }
`;
export const EditModalStyle = styled.div`
  width: 100%;
  display: flex;
  padding-top: 1rem;
  .half-width {
    width: 50%;
    display: flex;
    height: 100%;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }

  .flex-one {
    flex: 1;
  }

  .full-height {
    height: 100%;
  }

  .flex {
    display: flex;
  }

  .mt-2 {
    padding-top: 10px;
  }

  .execute-button {
    margin: 0 0 10px 10px;
    display: flex;
    justify-content: right;
  }

  .pt-1 {
    padding-top: 2px;
  }
  .responseLabel {
    display: block;
    font-weight: bold;
    color: #333;
    font-size: var(--fs-base);
    line-height: calc(var(--fs-base) + 1rem);
  }
`;

export const SpinnerPadding = styled.div`
  float: right;
  padding: 3px 0 0 4px;
`;

export const ScriptPane = styled.div`
  height: 100%;
  width: 100%;

  white-space: pre-wrap;

  padding-left: 24px;
  padding-right: 24px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

export const ReplacePadding = styled.div`
  padding: 12px 11px 11px 11px;
`;
export const ResponseTableStyles = styled.div`
  height: calc(87vh - 310px);
  table-layout: fixed;
  word-wrap: break-word;
  padding-top: 1.5rem;
  min-height: 100px;
  overflow: hidden;
  & th:nth-child(3) {
    min-width: 180px;
    width: 20%;
  }

  & td:nth-child(3) {
    min-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 20%;
  }

  & th:nth-child(2) {
    min-width: 160px;
    width: 30%;
  }

  & td:nth-child(2) {
    min-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 30%;
  }

  .flex-horizontal {
    display: flex;
    flex-direction: row;
  }

  .flex {
    flex: 1;
  }

  .mt-1 {
    margin-top: 2px;
  }

  .mt-2 {
    margin-top: 4px;
  }
  .mt-3 {
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;

import styled from 'styled-components';
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
    overflow-y: auto;
    overflow-x: hidden;
  }

  .role-name {
    width: 40em;
  }

  .role {
    width: 3em;
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
import styled from 'styled-components';

export const PRE = styled.div`
  background: #f3f3f3;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: var(--goa-font-size-1);
  line-height: var(--goa-line-height-05);
  padding: var(--goa-space-m);
  margin-top: var(--goa-space-s);
`;

export const UrlWrapper = styled.div`
  display: flex;
  width: 100%;
`;
export const DropdownWrapper = styled.div`
  width: 120px;
`;
export const TableDiv = styled.div`
  .noPadding {
    padding: 0;
  }
  word-wrap: break-word;
  table-layout: fixed;
  & td:first-child {
    width: 323px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
  }
  & td:nth-child(2) {
    width: 270px;
    word-wrap: break-word;
    word-break: break-word;
  }

  & th:last-child {
    text-align: center;
  }
  & td:last-child {
    width: 128px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
  & .meta {
    padding: 0;
  }
`;

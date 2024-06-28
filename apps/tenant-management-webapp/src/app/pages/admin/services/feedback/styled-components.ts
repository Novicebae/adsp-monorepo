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
export const FeedbackOverviewSection = styled.div`
  p {
    line-height: 28px;
  }
`;
export const modelSpacingWrapper = styled.div`
  padding: 4px, 0px, 0px, 0px;
`;
export const FeedbackSubHeading = styled.div`
  font: var(--goa-typography-heading-s);
  margin-top: var(--goa-space-m);
  margin-bottom: var(--goa-space-xs);
`;
export const TableDiv = styled.div`
  .noPadding {
    padding: 0;
  }
  margin-top: var(--goa-space-m);
  word-wrap: break-word;

  small {
    font-weight: 400;
    line-height: 20px;
    padding-top: 18px;
  }
`;
export const CheckboxSpaceWrapper = styled.div`
  display: flex;
  margin-left: var(--goa-space-3xs);
  margin-top: var(--goa-space-l);
`;
export const HelpText = styled.div`
  font: var(--goa-typography-body-xs);
  display: flex;
  display-direction: row;
  justify-content: space-between;
  padding-left: var(--goa-space-xl);
`;
export const DeleteGap = styled.div`
  column-gap: 40px;
  padding-bottom: var(--goa-space-s);
`;

export const Buttons = styled.div`
  margin-top: var(--goa-space-xs);

  text-align: left;
`;
export const Heading = styled.div`
  font: var(--goa-typography-heading-m);
  margin-top: var(--goa-space-2xl);
  margin-bottom: var(--goa-space-m);
`;

export const HeaderFont = styled.div`
  font: var(--goa-typography-heading-m);
  padding-bottom: var(--goa-space-2xs);
`;

export const MoreDetails = styled.div`
   {
    background-color: var(--goa-color-greyscale-100);
    padding: var(--goa-space-s) var(--goa-space-l) var(--goa-space-l) var(--goa-space-l);
    width: 100%;
    text-align: left;
    p {
      font: var(--goa-typography-heading-xs);
      color: var(--goa-color-text-secondary);
      margin-bottom: var(--goa-space-m);
    }
    h2 {
      font: var(--goa-typography-heading-s);
      padding-left: var(--goa-space-none);

      margin-bottom: var(--goa-space-2xs);
    }
    span {
      font: var(--goa-typography-body-m);
    }
  }
`;

export const IconDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  goa-icon-button {
    margin: 0 4px;
  }
`;
export const ProgressWrapper = styled.div`
  margin-left: 30%;
`;

export const URL = styled.div`
  line-break: anywhere;
`;
export const ButtonPadding = styled.div`
  padding-bottom: var(--goa-space-l);
  padding-top: var(--goa-space-l);
`;

export const ExportDates = styled.div`
  display: flex;
  margin-top: var(--goa-space-l);
  margin-bottom: var(--goa-space-l);
  gap: var(--goa-space-xl);
`;
export const FeedbackFilterError = styled.span`
  color: var(--goa-color-emergency-default);
  padding-left: 5px;
  display: inline-flex;
  line-height: 2.5rem;
  position: relative;
  top: -3px;
`;

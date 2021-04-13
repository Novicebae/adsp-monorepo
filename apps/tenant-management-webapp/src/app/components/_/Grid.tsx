import styled from 'styled-components';

const Grid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
`;

export interface GridItemProps {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;

  spacing?: number;
}

const GridItem = styled.div<GridItemProps>`
  margin-bottom: 1.5rem;

  > div {
    height: 100% !important;
    width: 100% !important;
  }

  > img {
    width: 100%;
  }

  flex: 0 1 ${(props: GridItemProps) =>
    props.sm === 12 || props.sm === undefined
      ? '100%'
      : `calc(${100 * (props?.sm ?? 12) /  12}% - ${props.spacing ?? 4}px)`
  };

  @media (min-width: 768px) {
    flex-basis: ${(props: GridItemProps) =>
      props.md === 12
        ? '100%'
        : `calc(${100 * (props?.md ?? props.sm ?? 12) / 12}% - ${props.spacing ?? 4}px)`
    };
  }
  @media (min-width: 1024px) {
    flex-basis: ${(props: GridItemProps) =>
      props.lg === 12
        ? '100%'
        : `calc(${100 * (props?.lg ?? props?.md ?? props.sm ?? 12) /  12}% - ${props.spacing ?? 4}px)`
    };
  }
  @media (min-width: 1280px) {
    flex-basis: ${(props: GridItemProps) =>
      props.xl === 12
        ? '100%'
        : `calc(${100 * (props?.xl ?? props?.md ?? props.sm ?? 12) /  12}% - ${props.spacing ?? 4}px)`
    };
  }
`;

export { Grid, GridItem };

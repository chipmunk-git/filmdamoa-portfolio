import React from 'react';
import styled, { css } from 'styled-components';
import { lighten } from 'polished';

const sizes = {
  great: '0.5rem 1rem',
  large: '0.5rem 1rem',
  regular: '0.375rem 1rem',
  medium: '0.375rem 1rem',
  small: '0.25rem 1rem',
  little: '0.25rem 1rem'
};

const sizeStyles = css`
  ${({ theme, styleProps }) => css`
    font-size: ${theme.fontSize[styleProps.size] || theme.fontSize['regular']};
    padding: ${sizes[styleProps.size] || sizes['regular']};

    ${styleProps.margin &&
      css`
        margin: ${styleProps.margin};
      `
    }

    ${styleProps.width &&
      styleProps.width === '100%' ?
        css`
          display: flex;
          width: ${styleProps.width};
        ` :
        css`
          width: ${styleProps.width};
        `
    }
  `}
`

const colorStyles = css`
  ${({ theme, styleProps, inAction }) => {
    const color = styleProps.color ||
      styleProps.transparent ? [theme.colors['black'], 0.85, 0.8] : [theme.colors['freshRed'], 0.15, 0.1];

    const selected = color[0];

    // background-color에 대해 기본적인 스타일이 적용되며, styleProps의 프로퍼티 및 inAction 값에 따라 스타일이 변경됨
    return css`
      background-color: ${selected};

      &:hover {
        background-color: ${lighten(color[1], selected)};
      }

      &:active {
        background-color: ${lighten(color[2], selected)};
      }

      ${styleProps.transparent && // transparent가 true인 경우
        css`
          color: ${selected};
          background-color: transparent;

          ${styleProps.outline && // transparent와 더불어 outline도 true인 경우
            css`
              border: 1px solid ${selected};
            `
          }
        `
      }

      ${styleProps.outline && !styleProps.transparent && // outline은 true, transparent는 false인 경우
        css`
          color: ${selected};
          background-color: transparent;
          border: 1px solid ${selected};

          &:hover {
            color: white;
            border: 1px solid ${lighten(color[1], selected)};
          }

          &:active {
            color: white;
            border: 1px solid ${lighten(color[2], selected)};
          }

          ${inAction &&
            css`
              color: white;
              border: 1px solid ${lighten(color[1], selected)};
            `
          }
        `
      }

      ${inAction &&
        css`
          background-color: ${lighten(color[1], selected)};
        `
      }
    `
  }}
`

const StyledButton = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 0.25rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: .2s all;

  ${sizeStyles}

  ${colorStyles}
`

// 다양한 스타일이 적용될 수 있는 버튼 컴포넌트
const UtilityButton = ({ children, styleProps, ...rest }) => {
  return (
    <StyledButton styleProps={styleProps} {...rest}>
      {children}
    </StyledButton>
  );
}

UtilityButton.defaultProps = {
  styleProps: {}
};

export default React.memo(UtilityButton);
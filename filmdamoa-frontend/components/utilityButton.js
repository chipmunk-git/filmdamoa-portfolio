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
  ${({ theme, styleProps }) => {
    const color = styleProps.color ||
      styleProps.transparent ? [theme.colors['black'], 0.85, 0.8] : [theme.colors['freshRed'], 0.15, 0.1];
    
    const selected = color[0];

    return css`
      background-color: ${selected};

      &:hover {
        background-color: ${lighten(color[1], selected)};
      }

      &:active {
        background-color: ${lighten(color[2], selected)};
      }

      ${styleProps.transparent &&
        css`
          color: ${selected};
          background-color: transparent;

          ${styleProps.outline &&
            css`
              border: 1px solid ${selected};
            `
          }
        `
      }

      ${styleProps.outline && !styleProps.transparent &&
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
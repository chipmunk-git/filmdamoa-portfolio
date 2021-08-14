import styled, { css } from 'styled-components';
import { transitions } from './styleUtils';

export const StyledArticle = styled.article`
  width: 100%;
`

export const AuthErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 2.375rem;
  margin: 1rem 0;
  color: ${({ theme }) => theme.colors.red};
  font-size: ${({ theme }) => theme.fontSize.medium};
  text-align: center;
  animation: ${transitions.shake} 0.3s ease-in;
  animation-fill-mode: forwards;
`

export const scrollable = css`
  ${({ theme, horizontal }) => {
    const trackBg = theme.colors.trackBg;
    const thumbBg = theme.colors.thumbBg;

    return css`
      /* IE */
      @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
        /* IE scrollbar color properties */
        scrollbar-base-color: ${trackBg};
        scrollbar-face-color: ${thumbBg};
        scrollbar-3dlight-color: ${thumbBg};
        scrollbar-highlight-color: ${thumbBg};
        scrollbar-track-color: ${trackBg};
        scrollbar-arrow-color: ${thumbBg};
        scrollbar-shadow-color: ${thumbBg};
        scrollbar-dark-shadow-color: ${thumbBg};
      }

      /* Firefox */
      /* From version 64 - https://drafts.csswg.org/css-scrollbars-1/ */
      scrollbar-width: thin;
      scrollbar-color: ${thumbBg} ${trackBg};

      /* Chrome */
      &::-webkit-scrollbar-track {
        background-color: ${trackBg};
        ${horizontal ?
            css`
              height: 4px;
            ` :
            css`
              width: 4px;
            `
        }
      }

      &::-webkit-scrollbar-thumb {
        background-color: ${thumbBg};
        border: 1px solid transparent;
        background-clip: content-box;
      }

      &::-webkit-scrollbar {
        ${horizontal ?
            css`
              height: 8px;
            ` :
            css`
              width: 8px;
            `
        }
      }
    `
  }}
`
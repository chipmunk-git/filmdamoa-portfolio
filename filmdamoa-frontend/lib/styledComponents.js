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
  ${({ theme }) => {
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
        width: 4px;
        height: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: ${thumbBg};
        border: 1px solid transparent;
        background-clip: content-box;
      }

      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
    `
  }}
`

export const StyledWrapper = styled.div`
  display: flex;

  @media ${({ theme }) => theme.media.laptop} {
    flex-direction: column;
  }
`

export const MovieSeatBox = styled.div`
  width: calc(70% - 1.25rem);
  margin-right: 1.25rem;
  border-top: 1px solid black;

  @media ${({ theme }) => theme.media.laptop} {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1.25rem;
  }
`

export const MovieInfoBox = styled.div`
  width: 30%;
  border-radius: 0.625rem;
  background-color: #333;
  color: white;

  @media ${({ theme }) => theme.media.laptop} {
    width: 100%;
  }
`

export const TitleWrapper = styled.div`
  display: flex;
  padding: 0.75rem 0;
  margin: 0 1.25rem;
  border-bottom: 1px solid #434343;

  span {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url(${({ movieRating }) => movieRating});
    background-position: center;
    background-repeat: no-repeat;
  }

  div {
    width: calc(100% - 20px - 6px);
    margin-left: 6px;
  }

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.regular};
    font-weight: normal;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  i {
    margin-top: 0.375rem;
    color: #aaa;
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-style: normal;
  }
`
import styled from 'styled-components';
import { transitions } from './styleUtils';

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
import Link from 'next/link';
import styled from 'styled-components';
import { shadow } from '../lib/styleUtils';

const Background = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.greyBg};
`

const Positioner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const ShadowedBox = styled.div`
  width: 30rem;
  ${shadow(2)}

  @media ${({ theme }) => theme.media.mobile} {
    width: 100vw;
  }
`

const LogoWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.red};
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Logo = styled.a`
  color: white;
  font-size: 2.4rem;
  font-weight: bold;
  text-decoration: none;
`

const Contents = styled.div`
  background-color: white;
  padding: 2rem;
  height: auto;

  @media ${({ theme }) => theme.media.mobile} {
    height: calc(100vh - 5rem);

    > div {
      h2 {
        margin: 0 0 1.375rem;
      }

      > div, button {
        margin: 1.375rem 0;
      }
    }
  }
`

const withAuth = (WrappedComponent) => ({ ...props }) => {
  return (
    <Background>
      <Positioner>
        <ShadowedBox>
          <LogoWrapper>
            <Link href="/" passHref>
              <Logo>FILMDAMOA</Logo>
            </Link>
          </LogoWrapper>
          <Contents>
            <WrappedComponent {...props} />
          </Contents>
        </ShadowedBox>
      </Positioner>
    </Background>
  );
}

export default withAuth;
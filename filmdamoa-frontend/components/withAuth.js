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
    height: 100vh;
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
    min-height: calc(100vh - 5rem);

    h2 {
      margin: 0 0 1.375rem;
    }

    > div {
      > div, button {
        margin: 1.375rem 0;

        &:last-child {
          margin: 1.375rem 0 0;
        }
      }
    }
  }
`

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 1rem;
`

const withAuth = (WrappedComponent, title) => {
  const WithAuth = props => {
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
              <Title>{title}</Title>
              <WrappedComponent {...props} />
            </Contents>
          </ShadowedBox>
        </Positioner>
      </Background>
    );
  }

  return WithAuth;
}

export default withAuth;
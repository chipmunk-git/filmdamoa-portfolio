import Link from 'next/link';
import styled from 'styled-components';
import { lighten, darken } from 'polished';

const StyledHeader = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
`

const Logo = styled.a`
  display: block;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.black};
  font-size: 2.75rem;
  font-weight: bold;
`

const StyledNav = styled.nav`
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.black};
`

const StyledUl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: inline-block;

    &:hover {
      background-color: ${({ theme }) => lighten(0.1, theme.colors.black)};
    }
  }

  a {
    display: block;
    padding: 0 3.5rem;
    margin: 0.625rem 0;
    text-decoration: none;
    color: white;
    cursor: pointer;

    @media ${({ theme }) => theme.media.tablet} {
      padding: 0 2.25rem;
    }

    @media ${({ theme }) => theme.media.mobile} {
      padding: 0 4vw;
    }
  }

  li:not(:last-child) {
    a {
      border-right: 1px solid ${({ theme }) => theme.colors.greyDark};
    }
  }
`

const StyledSection = styled.section`
  padding: 3.625rem;
  min-height: 76vh;

  @media ${({ theme }) => theme.media.tablet} {
    padding: 2rem;
  }

  @media ${({ theme }) => theme.media.mobile} {
    padding: 0.375rem;
  }
`

const StyledFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 7.5rem;
  font-size: ${({ theme }) => theme.fontSize.medium};

  @media ${({ theme }) => theme.media.tablet} {
    padding: 0.5rem 2rem;

    ul {
      flex-wrap: wrap;
      width: 54vw;
    }
  }
`

const FooterUl = styled(StyledUl)`
  display: flex;
  margin: 0.75rem 0;

  li {
    &:hover {
      background-color: ${darken(0.05, 'white')};
      border-radius: 0.25rem;
    }
  }

  a {
    padding: 0 0.75rem;
    margin: 0.5rem 0;
    color: ${({ theme }) => theme.colors.black};

    @media ${({ theme }) => theme.media.tablet} {
      padding: 0 0.75rem;
    }

    @media ${({ theme }) => theme.media.mobile} {
      padding: 0 0.75rem;
    }
  }
`

const Copyright = styled.div`
  padding: 0.5rem 0.75rem;
  margin: 0.75rem 0;
  color: ${({ theme }) => theme.colors.black};
`

const withLayout = (WrappedComponent) => ({ ...props }) => {
  return (
    <>
      <StyledHeader>
        <Link href="/" passHref>
          <Logo tabIndex="0">FILMDAMOA</Logo>
        </Link>
      </StyledHeader>
      <StyledNav>
        <StyledUl>
          <li>
            <Link href="/movie">
              <a tabIndex="0">영화</a>
            </Link>
          </li>
          <li>
            <Link href="/booking">
              <a tabIndex="0">예매</a>
            </Link>
          </li>
          <li>
            <Link href="/event">
              <a tabIndex="0">이벤트</a>
            </Link>
          </li>
          <li>
            <Link href="/community">
              <a tabIndex="0">커뮤니티</a>
            </Link>
          </li>
        </StyledUl>
      </StyledNav>
      <StyledSection>
        <WrappedComponent {...props} />
      </StyledSection>
      <StyledFooter>
        <FooterUl>
          <li>
            <Link href="/info">
              <a tabIndex="0">소개</a>
            </Link>
          </li>
          <li>
            <Link href="/inquire">
              <a tabIndex="0">문의하기</a>
            </Link>
          </li>
          <li>
            <Link href="/agreement">
              <a tabIndex="0">이용약관</a>
            </Link>
          </li>
          <li>
            <Link href="/privacy">
              <a tabIndex="0">개인정보 취급방침</a>
            </Link>
          </li>
        </FooterUl>
        <Copyright>© FILMDAMOA</Copyright>
      </StyledFooter>
    </>
  );
}

export default withLayout;
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { lighten } from 'polished';
import { useSelector, useDispatch } from 'react-redux';
import storage from '../lib/storage';
import { logout, maintainAuth } from '../store/user/action';

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.5rem 0;

  @media ${({ theme }) => theme.media.mobile} {
    flex-wrap: wrap;
  }
`

const Logo = styled.a`
  display: block;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.black};
  font-size: 2.75rem;
  font-weight: bold;

  @media ${({ theme }) => theme.media.tablet} {
    padding-left: 2rem;
  }

  @media ${({ theme }) => theme.media.mobile} {
    padding-left: 0.375rem;
  }
`

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 15rem;
  padding-right: 3.625rem;
  font-size: ${({ theme }) => theme.fontSize.medium};

  @media ${({ theme }) => theme.media.tablet} {
    width: 12.125rem;
    padding-right: 2rem;
  }

  @media ${({ theme }) => theme.media.mobile} {
    width: 100%;
    padding-right: 0.375rem;
  }
`

const Faker = styled(Wrapper)`
  @media ${({ theme }) => theme.media.tablet} {
    display: none;
  }
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
    a, button {
      border-right: 1px solid ${({ theme }) => theme.colors.greyDark};
    }
  }
`

const HeaderUl = styled(StyledUl)`
  li {
    &:hover {
      background-color: transparent;
    }
  }

  a, button {
    padding: 0 0.75rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.black};

    &:hover {
      text-decoration: underline;
    }

    @media ${({ theme }) => theme.media.tablet} {
      padding: 0 0.75rem;
    }

    @media ${({ theme }) => theme.media.mobile} {
      padding: 0 0.75rem;
    }
  }

  button {
    border: none;
    background-color: transparent;
    cursor: pointer;

    &:active {
      text-decoration: underline;
    }
  }
`

const StyledSection = styled.section`
  min-height: calc(100vh - 11.625rem);
  padding: 3.625rem calc(50vw - 37.5rem);
  position: relative;

  @media ${({ theme }) => theme.media.desktop} {
    padding: 3.625rem;
  }

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

const FooterUl = styled(HeaderUl)`
  display: flex;
  margin: 0.75rem 0;

  a {
    margin: 0.5rem 0;
  }
`

const Copyright = styled.div`
  padding: 0.5rem 0.75rem;
  margin: 0.75rem 0;
  color: ${({ theme }) => theme.colors.black};
`

// 통상적인 화면의 레이아웃 디자인에 이용되는 HOC
const withLayout = WrappedComponent => {
  const WithLayout = props => {
    // 리덕스에서 아이디 확보. 로그인을 하지 않았다면 null이 할당됨
    const { username } = useSelector(state => ({
      username: state.user.username
    }));

    const router = useRouter();

    const dispatch = useDispatch();

    // 로그인과 관련된 값들을 제거한 후 페이지 새로고침
    const handleLogout = async () => {
      await dispatch(logout());
      storage.remove('destination');
      router.reload();
    }

    // 로그인 상태 유지와 관련된 로직 수행
    useEffect(() => {
      dispatch(maintainAuth());
    }, [dispatch]);

    // header, nav, section 및 footer가 포함됨
    return (
      <>
        <StyledHeader>
          <Faker />
          <Link href="/" passHref>
            <Logo>FILMDAMOA</Logo>
          </Link>
          <Wrapper>
            <HeaderUl>
              {username
                ? <>
                    <li>
                      <button onClick={handleLogout}>로그아웃</button>
                    </li>
                    <li>
                      <Link href="/mypage">
                        <a>{username} 님</a>
                      </Link>
                    </li>
                  </>
                : <>
                    <li>
                      <Link href="/login">
                        <a>로그인</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/join">
                        <a>회원가입</a>
                      </Link>
                    </li>
                  </>
              }
            </HeaderUl>
          </Wrapper>
        </StyledHeader>
        <StyledNav>
          <StyledUl>
            <li>
              <Link href="/movie">
                <a>영화</a>
              </Link>
            </li>
            <li>
              <Link href="/booking">
                <a>예매</a>
              </Link>
            </li>
            <li>
              {/* <Link href="/event"> */}
                <a>이벤트</a>
              {/* </Link> */}
            </li>
            <li>
              {/* <Link href="/community"> */}
                <a>커뮤니티</a>
              {/* </Link> */}
            </li>
          </StyledUl>
        </StyledNav>
        <StyledSection>
          <WrappedComponent {...props} />
        </StyledSection>
        <StyledFooter>
          <FooterUl>
            <li>
              {/* <Link href="/info"> */}
                <a>소개</a>
              {/* </Link> */}
            </li>
            <li>
              {/* <Link href="/inquire"> */}
                <a>문의하기</a>
              {/* </Link> */}
            </li>
            <li>
              {/* <Link href="/agreement"> */}
                <a>이용약관</a>
              {/* </Link> */}
            </li>
            <li>
              {/* <Link href="/privacy"> */}
                <a>개인정보 취급방침</a>
              {/* </Link> */}
            </li>
          </FooterUl>
          <Copyright>© FILMDAMOA</Copyright>
        </StyledFooter>
      </>
    );
  }

  return WithLayout;
}

export default withLayout;
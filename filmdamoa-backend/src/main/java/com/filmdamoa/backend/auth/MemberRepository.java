package com.filmdamoa.backend.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
	Optional<Member> findByUsername(String username); // 아이디를 기준으로 조회
	Optional<Member> findByEmail(String email); // 이메일을 기준으로 조회
	List<Member> findByUsernameOrEmail(String username, String email); // 아이디 또는 이메일을 기준으로 조회
}

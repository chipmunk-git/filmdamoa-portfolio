package com.filmdamoa.backend.util;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

@Component
public class RedisUtil {
	// 코드 출처: https://github.com/ehdrms2034/SpringBootWithJava/blob/master/Spring_React_Login/backend/src/src/main/java/com/donggeun/springSecurity/service/RedisUtil.java 기반
	@Autowired
	private StringRedisTemplate stringRedisTemplate;
	
	// 레디스에서 key에 해당되는 데이터 조회
	public String getData(String key) {
		ValueOperations<String, String> valueOperations = stringRedisTemplate.opsForValue();
		return valueOperations.get(key);
	}
	
	// 레디스에 key-value pair 데이터 저장
	public void setData(String key, String value) {
		ValueOperations<String, String> valueOperations = stringRedisTemplate.opsForValue();
		valueOperations.set(key, value);
	}
	
	// duration 이후에 자동으로 삭제되도록 key-value pair 데이터 저장
	public void setDataExpire(String key, String value, long duration) {
		ValueOperations<String, String> valueOperations = stringRedisTemplate.opsForValue();
		Duration expireDuration = Duration.ofSeconds(duration);
		valueOperations.set(key, value, expireDuration);
	}
	
	// 레디스에서 key에 해당되는 데이터 삭제
	public void deleteData(String key) {
		stringRedisTemplate.delete(key);
	}
}

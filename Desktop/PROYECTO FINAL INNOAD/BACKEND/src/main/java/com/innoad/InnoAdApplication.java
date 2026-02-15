package com.innoad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.innoad")
@EnableCaching
@EnableAsync
@EnableScheduling
public class InnoAdApplication {

    public static void main(String[] args) {
        SpringApplication.run(InnoAdApplication.class, args);
    }
}

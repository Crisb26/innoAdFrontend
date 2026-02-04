package com.innoad.modules.mantenimiento.config;

import com.innoad.modules.mantenimiento.filtro.FiltroMantenimiento;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ConfiguracionMantenimiento {
    
    private final FiltroMantenimiento filtroMantenimiento;
    
    @Bean
    public FilterRegistrationBean<FiltroMantenimiento> registrarFiltroMantenimiento() {
        FilterRegistrationBean<FiltroMantenimiento> bean = new FilterRegistrationBean<>(filtroMantenimiento);
        bean.addUrlPatterns("/api/*");
        bean.setOrder(1); // Ejecutar primero
        return bean;
    }
}

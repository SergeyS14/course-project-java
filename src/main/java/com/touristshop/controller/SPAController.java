package com.touristshop.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class SPAController {

    @GetMapping(value = {
        "/",
        "/products",
        "/products/**",
        "/admin",
        "/admin/**",
        "/cart",
        "/orders",
        "/login",
        "/register"
    })
    public ResponseEntity<Resource> index(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path != null && path.startsWith("/api/")) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            Resource resource = new ClassPathResource("/static/200.html");
            if (!resource.exists() || !resource.isReadable()) {
                resource = new ClassPathResource("/static/index.html");
            }
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_HTML)
                        .body(resource);
            }
        } catch (Exception e) {
        }
        
        try {
            Resource indexHtml = new ClassPathResource("/static/index.html");
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(indexHtml);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}


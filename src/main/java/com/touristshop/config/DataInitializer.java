package com.touristshop.config;

import com.touristshop.model.Category;
import com.touristshop.model.Product;
import com.touristshop.model.Role;
import com.touristshop.model.User;
import com.touristshop.repository.CategoryRepository;
import com.touristshop.repository.ProductRepository;
import com.touristshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            initializeData();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Transactional
    private void initializeData() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@touristshop.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("manager").isEmpty()) {
            User manager = new User();
            manager.setUsername("manager");
            manager.setEmail("manager@touristshop.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setFirstName("Manager");
            manager.setLastName("User");
            manager.setRole(Role.ROLE_MANAGER);
            manager.setEnabled(true);
            userRepository.save(manager);
        }
        Category jackets = categoryRepository.findByName("Куртки")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Куртки");
                    cat.setDescription("Теплые куртки для походов и активного отдыха");
                    return categoryRepository.save(cat);
                });

        Category pants = categoryRepository.findByName("Брюки")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Брюки");
                    cat.setDescription("Удобные брюки для туризма");
                    return categoryRepository.save(cat);
                });

        Category shoes = categoryRepository.findByName("Обувь")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Обувь");
                    cat.setDescription("Туристическая обувь");
                    return categoryRepository.save(cat);
                });

        Category backpacks = categoryRepository.findByName("Рюкзаки")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Рюкзаки");
                    cat.setDescription("Туристические рюкзаки");
                    return categoryRepository.save(cat);
                });
    }
}

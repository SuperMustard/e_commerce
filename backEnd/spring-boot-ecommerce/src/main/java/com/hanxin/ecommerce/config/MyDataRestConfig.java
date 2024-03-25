package com.hanxin.ecommerce.config;

import com.hanxin.ecommerce.entity.Product;
import com.hanxin.ecommerce.entity.ProductCategory;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        RepositoryRestConfigurer.super.configureRepositoryRestConfiguration(config, cors);
        HttpMethod[] theUnsupportedActions = {HttpMethod.PUT, HttpMethod.POST, HttpMethod.DELETE};
        //disable HTTP method for product
        config.getExposureConfiguration()
                .forDomainType(Product.class)
                .withItemExposure((metdata, httpMethods)-> httpMethods.disable(theUnsupportedActions))
                .withCollectionExposure((metdata, httpMethods)->httpMethods.disable((theUnsupportedActions)));


        //disable HTTP method for product category
        config.getExposureConfiguration()
                .forDomainType(ProductCategory.class)
                .withItemExposure((metdata, httpMethods)-> httpMethods.disable(theUnsupportedActions))
                .withCollectionExposure((metdata, httpMethods)->httpMethods.disable((theUnsupportedActions)));
    }
}

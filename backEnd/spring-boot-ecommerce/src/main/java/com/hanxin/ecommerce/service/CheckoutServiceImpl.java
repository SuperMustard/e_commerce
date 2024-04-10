package com.hanxin.ecommerce.service;

import com.hanxin.ecommerce.dao.CustomerRepository;
import com.hanxin.ecommerce.dto.Purchase;
import com.hanxin.ecommerce.dto.PurchaseResponse;
import com.hanxin.ecommerce.entity.Order;
import com.hanxin.ecommerce.entity.OrderItem;
import com.hanxin.ecommerce.entity.Customer;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService{

    private CustomerRepository customerRepository;

    @Autowired
    public CheckoutServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        Order order = purchase.getOrder();

        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));

        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        Customer customer = purchase.getCustomer();
        String email = customer.getEmail();
        Customer customerFromDB = customerRepository.findByEmail(email);
        if (customerFromDB != null) {
            customer = customerFromDB;
        }

        customer.add(order);

        customerRepository.save(customer);


        return new PurchaseResponse(orderTrackingNumber);
    }

    private String generateOrderTrackingNumber() {
        //generate random UUID number

        return UUID.randomUUID().toString();
    }
}

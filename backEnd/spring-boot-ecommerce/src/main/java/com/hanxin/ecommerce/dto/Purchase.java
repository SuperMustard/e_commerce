package com.hanxin.ecommerce.dto;

import com.hanxin.ecommerce.entity.Address;
import com.hanxin.ecommerce.entity.Customer;
import com.hanxin.ecommerce.entity.Order;
import com.hanxin.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

}

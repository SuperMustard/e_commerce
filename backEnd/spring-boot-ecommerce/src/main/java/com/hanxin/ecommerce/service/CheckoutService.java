package com.hanxin.ecommerce.service;

import com.hanxin.ecommerce.dto.Purchase;
import com.hanxin.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}

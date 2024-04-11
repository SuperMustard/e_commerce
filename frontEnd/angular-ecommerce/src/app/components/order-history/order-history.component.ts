import { Component } from '@angular/core';
import { OrderHistoryService } from '../../services/order-history.service';
import { OrderHistory } from '../../common/order-history';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent {
  orderHistory: OrderHistory[] = [];
  storage: Storage = sessionStorage;
  constructor(private orderHistoryService : OrderHistoryService) {}

  ngOnInit() : void {
    const customerEmail = this.storage.getItem('customerEmail');
    if (customerEmail) {
      //console.log(customerEmail);
      this.orderHistoryService.getOrderHistory(customerEmail).subscribe(data => 
        this.orderHistory = data._embedded.orders);
    }

    
  }
}

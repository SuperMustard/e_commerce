import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';

@Component({
  selector: 'app-prooduct-list',
  templateUrl: './prooduct-list-table.component.html',
  //templateUrl: './prooduct-list.component.html',
  styleUrl: './prooduct-list.component.css'
})
export class ProoductListComponent {
  products: Product[] = [];
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.listProducts();
  }
  listProducts() {
    this.productService.getProductList().subscribe(
      data=> {
        this.products = data;
      }
    )
  }
}

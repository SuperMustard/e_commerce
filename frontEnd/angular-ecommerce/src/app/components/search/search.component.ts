import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  constructor(
    private router: Router,
    private productService: ProductService) {
  }

  doSearch(keyWord: string) {
    console.log(keyWord);
    this.router.navigateByUrl(`/search/${keyWord}`);
  }
}

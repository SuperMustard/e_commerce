import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShopformService } from '../../services/shopform.service';
import { throwError } from 'rxjs';
import { Countries } from '../../common/countries';
import { States } from '../../common/states';
import { ShopValidators } from '../../validators/shop-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  sessionStorage: Storage = sessionStorage;

  checkoutFormGroup!: FormGroup;

  localStorage: Storage = localStorage;

  totalPrice: number = 0;
  totalQuantity: number = 0;
  
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Countries[] = [];
  shippingStates: States[] = [];
  billingStates: States[] = [];

  constructor(private formBuilder: FormBuilder,
    private shopFormService: ShopformService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {
    this.updateCartStatus();

    const sessionEmail = this.sessionStorage.getItem('customerEmail');
    let theEmail : string = '';
    if (sessionEmail) {
      theEmail = sessionEmail;
    }

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard:  new FormControl('', [Validators.required, Validators.minLength(2), 
                                          ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    const startMonth: number = new Date().getMonth() + 1;

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(data => this.creditCardMonths = data);

    this.shopFormService.getCreditCardYears().subscribe(
      data => this.creditCardYears = data
    );
    
    this.shopFormService.getCountries().subscribe(data => this.countries = data);
  }

  updateCartStatus() {
    this.cartService.totalPrice.subscribe(data => this.totalPrice = data);
    this.cartService.totalQuantity.subscribe(data => this.totalQuantity = data);

    //this.cartService.computeCartTotals();
  }

  getStates(formName: string) {
    const modifiedFormGroup = this.checkoutFormGroup.get(formName);
    if (modifiedFormGroup) {
      const countryName = modifiedFormGroup.value.country;
      const countryIndex = this.countries.findIndex(item => item.name === countryName);
      if (countryIndex > -1) {
        const countryCode = this.countries[countryIndex].code;
        this.shopFormService.getStates(countryCode).subscribe(
          data => {
            if (formName === 'shippingAddress') {
              this.shippingStates = data;
            } else {
              this.billingStates = data;
            }
  
            modifiedFormGroup.get('state')?.setValue(data[0]);
          }
        );
      }
    }
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }

  copyShippingAddressToBillingAddress(event: any) {

    if (event.target.checked) {
      //@ts-ignore: Object is possibly 'null'
      this.checkoutFormGroup.controls.billingAddress
      //@ts-ignore: Object is possibly 'null'
            .setValue(this.checkoutFormGroup.controls.shippingAddress.value);
      
      this.billingStates = this.shippingStates;
    }
    else {
      //@ts-ignore: Object is possibly 'null'
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingStates = [];
    }
    
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    if (creditCardFormGroup === null) {
      return;
    }

    const selectYear: number = Number(creditCardFormGroup!.value.expirationYear);
    const currentYear: number = new Date().getFullYear();

    let startMonth: number = 1;
    if (selectYear === currentYear) {
      startMonth = new Date().getMonth() + 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(data => this.creditCardMonths = data);
  }

  onSubmit() {
    if (this.checkoutFormGroup) {
      if (this.checkoutFormGroup.invalid) {
        this.checkoutFormGroup.markAllAsTouched();
        return;
      }

      let order = new Order(this.totalQuantity, this.totalPrice);

      const cartItems = this.cartService.cartItems;

      let orderItems: OrderItem[] = cartItems.map(tempItem => new OrderItem(tempItem));

      const customer = this.checkoutFormGroup.controls['customer'].value;

      const shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
      const shippingState: States = JSON.parse(JSON.stringify(shippingAddress.state));
      const shippingCountry: Countries = JSON.parse(JSON.stringify(shippingAddress.country));
      shippingAddress.state = shippingState;
      shippingAddress.country = shippingCountry;

      const billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
      const billingState: States = JSON.parse(JSON.stringify(billingAddress.state));
      const billingCountry: Countries = JSON.parse(JSON.stringify(billingAddress.country));
      billingAddress.state = billingState;
      billingAddress.country = billingCountry;

      const purchase: Purchase = new Purchase(customer, shippingAddress, billingAddress, order, orderItems);
      // console.log(customer);
      // console.log(shippingAddress);
      // console.log(billingAddress);
      // console.log(order);
      // console.log(orderItems);
      // console.log(purchase.customer);

      this.checkoutService.placeOrder(purchase).subscribe(
        {
          next: response => {
            alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          
            //reset cart
            this.resetCart();
          },
          error: err => {
            alert(`There was an error: ${err.message}`);
          }
        }
      );

    }
  }

  resetCart() {
    //reset cart
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset the form
    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');

    this.localStorage.removeItem('cartItems');
    
  }
}

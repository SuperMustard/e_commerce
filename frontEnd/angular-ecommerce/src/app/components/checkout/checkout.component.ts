import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShopformService } from '../../services/shopform.service';
import { throwError } from 'rxjs';
import { Countries } from '../../common/countries';
import { States } from '../../common/states';
import { ShopValidators } from '../../validators/shop-validators';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;
  
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Countries[] = [];
  shippingStates: States[] = [];
  billingStates: States[] = [];

  constructor(private formBuilder: FormBuilder,
    private shopFormService: ShopformService,
    private cartService: CartService) { }

  ngOnInit(): void {
    this.updateCartStatus();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
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
      }
    }
  }
}

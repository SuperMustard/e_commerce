import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShopformService } from '../../services/shopform.service';
import { throwError } from 'rxjs';
import { Countries } from '../../common/countries';
import { States } from '../../common/states';

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
    private shopFormService: ShopformService) { }

  ngOnInit(): void {
    
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
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
      //@ts-ignore: Object is possibly 'null'
      console.log(this.checkoutFormGroup.get('customer').value);
    }
  }
}

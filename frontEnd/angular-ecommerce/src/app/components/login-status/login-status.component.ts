import { Component, Inject } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent {
  isAuthenticated: boolean = false;
  userFullName: string = '';

  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

    ngOnInit() : void {
      this.oktaAuthService.authState$.subscribe(
        (result)=>{
          this.isAuthenticated = result.isAuthenticated!;
          this.getUserDetail();
        }
      )
    }

    getUserDetail() {
      if (this.isAuthenticated) {
        //fetch the logged in user details
        this.oktaAuth.getUser().then(
          (res) => {
            this.userFullName = res.name as string;

            const theEmail = res.email;
            if (theEmail) {
              //console.log(theEmail);
              this.storage.setItem('customerEmail', theEmail);
            }
          }
        );
      }
    }

    logout() {
      this.oktaAuth.signOut();
    }
}

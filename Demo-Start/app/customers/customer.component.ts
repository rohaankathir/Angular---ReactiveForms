import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { Customer } from './customer';

/*
// Custom validation which does not accept parameters
// Calling => rating: ['', ratingRange],
function ratingRange (c: AbstractControl): {[key: string]: boolean} | null {
    if(c.value != undefined && (isNaN(c.value) || c.value < 1 || c.value > 5)){
        return {'range': true};
    }
    return null;
}
*/

// Custom validation which accepts parameters
// Calling => rating: ['', ratingRange(1,5)],
function ratingRange (min: number, max: number): ValidatorFn {
    return  (c: AbstractControl): {[key: string]: boolean} | null => {
        if(c.value != undefined && (isNaN(c.value) || c.value < min || c.value > max)){
            return {'range': true};
        }
        return null;
    }
}

// Email match validation
// Paramter : c: FormGroup
// Return :
// key and value pair. Key - name of the validation rule. In our case 'match', value : true 
function emailMatcher(c: AbstractControl){
    let emailControl = c.get('email');
    let confirmEmailControl = c.get('confirmEmail');
    // If the controls are not touched, we don't have to return error
    if(emailControl.pristine || confirmEmailControl.pristine){
        return null;
    }
    if(emailControl.value === confirmEmailControl.value){
        return null;
    }
    return { match: true }
}

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit  {
    customerForm: FormGroup;
    // This is a data model
    customer: Customer= new Customer();
    emailMessage: string;
    confirmEmailMessage: string;

    private validationMessages = {
        required: 'Please enter your email address.',
        pattern: 'Please enter a valid email address.'
    };

    constructor(private fb: FormBuilder){}
    
    ngOnInit(): void {
        this.customerForm = this.fb.group({
            firstName:['', [Validators.required, Validators.minLength(3)]],
            lastName:['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email:['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail:['', Validators.required],   
            }, { validator : emailMatcher }),                     
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(1,5)],
            sendCatalog: true
        });

        this.customerForm.get('notification').valueChanges
            .subscribe(value => this.setNotification(value));

        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.subscribe(value => this.setMessage(emailControl));
    }

    populateTestData(): void{
        this.customerForm.patchValue({
            firstName: 'Rohaan',
            lastName: 'Kathirgamathamby',
            //email: 'rkath@hays.com.au',
            sendCatalog: false
        });
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';
        if((c.touched || c.dirty) && c.errors){
            // key is the validation rule name
            this.emailMessage = Object.keys(c.errors).map(key=> 
                this.validationMessages[key]).join(' ');
        }
    }

    setNotification(notifyVia: string): void{
        const phoneControl = this.customerForm.get('phone');
        if(notifyVia === 'text'){
            phoneControl.setValidators(Validators.required);
        }
        else{
            phoneControl.clearValidators();
        }
        phoneControl.updateValueAndValidity();
    }
 }

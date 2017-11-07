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

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit  {
    customerForm: FormGroup;
    // This is a data model
    customer: Customer= new Customer();

    constructor(private fb: FormBuilder){}
    
    ngOnInit(): void {
        this.customerForm = this.fb.group({
            firstName:['', [Validators.required, Validators.minLength(3)]],
            lastName:['', [Validators.required, Validators.maxLength(50)]],
            email:['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(1,5)],
            sendCatalog: true
        });
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

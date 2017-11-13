import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
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

    get addresses(): FormArray {
        return <FormArray>this.customerForm.get('addresses');
    }

    // Validation messages are key and value pair. Keys should match
    private validationMessagesEmail = {
        required: 'Please enter your email address.',
        pattern: 'Please enter a valid email address.'
    };
/*
    private validationMessagesConfirmEmail = {
        required: 'Please confirm your email address.',
        match: 'The confirmation email does not match the email address'
    };
*/
    constructor(private fb: FormBuilder){}
    
    ngOnInit(): void {
        // Form Builder
        this.customerForm = this.fb.group({
            firstName:['', [Validators.required, Validators.minLength(3)]],
            lastName:['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email:['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail:['', [Validators.required]],   
            }, { validator : emailMatcher }),                     
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(1,5)],
            sendCatalog: true,
            addresses: this.fb.array([this.buildAddress()])         
        });

        this.customerForm.get('notification').valueChanges
            .subscribe(value => this.setNotification(value));

        const emailControl = this.customerForm.get('emailGroup.email');
        //const confirmEmailControl = this.customerForm.get('emailGroup.confirmEmail');
        emailControl.valueChanges.debounceTime(1000).subscribe(value => this.setMessage(emailControl));
        //confirmEmailControl.valueChanges.subscribe(value => this.setMessage(confirmEmailControl));
    }

    addAddress(): void{
        this.addresses.push(this.buildAddress());
    }

    buildAddress(): FormGroup{
        return this.fb.group({
            addressType: 'home',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: ''
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

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';
        //this.confirmEmailMessage = '';

        // key is the validation rule name
        if(c === this.customerForm.get('emailGroup.email')){
            if((c.touched || c.dirty) && c.errors){
                this.emailMessage = Object.keys(c.errors).map(key=> 
                    this.validationMessagesEmail[key]).join(' ');
            }
        }
        /*if(c === this.customerForm.get('emailGroup.confirmEmail')){
            if((c.touched || c.dirty) && (c.errors || this.customerForm.get('emailGroup').errors)){

                this.confirmEmailMessage = Object.keys(c.errors).map(key=> 
                    this.validationMessagesConfirmEmail[key]).join(' ');
            }
        }  */      
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

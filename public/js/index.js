/*eslint-disable */
import '@babel/polyfill';
import {login} from './login';
import {logout} from './login';
import {updateSetting} from './updateSettings';
import { bookTour } from './stripe';

const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour')

if(loginForm){
    loginForm.addEventListener('submit',e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
    // console.log(email);
        login(email,password);

});
}

if(logOutBtn){
    logOutBtn.addEventListener('click',logout)
}
if(userDataForm)
{
    userDataForm.addEventListener('submit',e =>{
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email',document.getElementById('email').value);
        form.append('photo',document.getElementById('photo').files[0]); 
        updateSetting(form,'data');
    });
}

if(userPasswordForm)
{
    userPasswordForm.addEventListener('submit',async e =>{
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const passwordcurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordconfirm = document.getElementById('password-confirm').value;
        await updateSetting({passwordcurrent,password,passwordconfirm},'password');

        document.querySelector('.btn--save-password').textContent = 'Save Password';
        document.getElementById('password-current').value='';
        document.getElementById('password').value='';
        document.getElementById('password-confirm').value='';

    })   
}

if(bookBtn)
 bookBtn.addEventListener('click',e=>{
     console.log("Start");
     e.target.textContent='Processing...';
     const tourId = e.target.dataset.tourId;
     console.log('Send');
     bookTour(tourId);
     console.log("received");
     
 })
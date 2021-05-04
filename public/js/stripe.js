import axios from "axios";
import {showAlert} from './alerts';

/*eslint-disable */
const stripe = Stripe('pk_test_51ImYbSSEFy7uH8deJ1P8vvYiaZDTV0fytWv3eSOs0LEBQE7tNCsi4t78yaECCKdGifQ3B6Qu0qhMbgJJi5hPJM6b00xtdTTfbl');

export const bookTour = async tourId =>{
    try{
    // 1)  Get checkout-session from API
       console.log('Reached');
       console.log(tourId);
      const session  = await axios(`http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`)
      console.log("worked");

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
        sessionId:session.data.session.id
    });
    }
    catch(err){

        console.log(err);
        console.log('stripe');
        showAlert('error',err);

    }
}
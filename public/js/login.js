/*eslint-disable */
import axios from 'axios'
import {showAlert} from './alerts'
export const login = async (email,password)=>{

    try{
    const res = await axios({
        method:'POST',
        url:'http://127.0.0.1:3000/api/v1/user/login',
        data:{
            email,
            password
        }
    });
    if(res.data.status == 'success'){
        showAlert('success',"Logged in successfully");
        window.setTimeout(()=>{
            location.assign('/');
        },1500);
    }
    //console.log(res);
    }
    catch(err){
        //console.log(err.response.data)
        showAlert('error',err.response.data.message)
    }

}

export const logout = async ()=>{
    try{
      const res = await axios({
          method:'Get',
          url:'http://127.0.0.1:3000/api/v1/user/logout'
      });
      if(res.data.status=='success'){location.reload();}
    }
    catch(err){
        showAlert('error','Error! Logging out! Try again')
    }
}
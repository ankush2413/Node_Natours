/*eslint-disable */
import axios from 'axios'
import { showAlert} from './alerts'

//type is either 'password' or 'data'
export const updateSetting = async (data,type)=>{
   try{
       const url = type=='password' ? 'http://127.0.0.1:3000/api/v1/user/updateMyPassword':'http://127.0.0.1:3000/api/v1/user/updateMe';
       const res = await axios({
           method:'PATCH',
           url,
           data
       });
       if(res.data.status =='success')
       {
           showAlert('success',`${type.toUpperCase()} Updated Successfully`);
       }
   }
   catch(err){
       console.log(err.response);
        showAlert('error',err.response.data.message)
   }
}

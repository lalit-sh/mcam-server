import axios from "axios";
import { SMS_ROUTE, SNS_KEY } from "../config/config";

export const sendSms = async ({to, message}) => {
    try{
        if(!to || !message){
            return false;
        }

        let res = await axios.post("https://www.fast2sms.com/dev/bulkV2",{
                "route": SMS_ROUTE,
                "numbers": to,
                "message": message,
                "language": "english"
        }, {
            headers: {
                Authorization: SNS_KEY,
            }
        });

        if(res.status == 200)
            return true;
        return false;
    }catch(err){
        console.log("Error occurred while sending sms");
        console.error(err);
        return false;
    }
}
import { FCM_API_KEY } from "../config/config";
import gcm from "node-gcm";


class FCMMiddleware {
    
    _fcm = new gcm.Sender(FCM_API_KEY);

    makeMessage = ({priority, data, notification}) => {
        let  o = {
            priority: priority || 'high'   
        };

        if(notification)
            o.notification = notification;
        
        if(data)
            o.data = data;

        var message = new gcm.Message(o);
        return message;
    }


    sendMessage = (message, registrationTokens, cb) => {
        this._fcm.send(message, {registrationTokens: registrationTokens}, cb || function (err, response) {
            if (err) {
                if (JSON.parse(err).results)
                    console.log(JSON.parse(err).results[0].error)
            }
        });
    }

    fcm = () => {
        //fcm getter
        return this._fcm;
    }

}


export default FCMMiddleware;
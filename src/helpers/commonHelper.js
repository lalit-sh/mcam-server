import moment from "moment";
import * as jwt from "jwt-simple";


export const genToken = (user) => {
    let token = jwt.encode({
        username: user.username
    }, process.env.JWT_SECRET);

    return {
        token: token,
        user: user.username
    };
}

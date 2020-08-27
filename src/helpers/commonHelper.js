import moment from "moment";
import * as jwt from "jwt-simple";


export const genToken = (user) => {
    let expires = moment().utc().add({ days: 7 }).unix();
    let token = jwt.encode({
        exp: expires,
        username: user.username
    }, process.env.JWT_SECRET);

    return {
        token: "JWT " + token,
        expires: moment.unix(expires).format(),
        user: user._id
    };
}

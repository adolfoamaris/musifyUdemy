'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_curso';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(), //capturar fecha de inicio de sesión
        exp: moment().add(30, 'days').unix //dias en que expira la sesión
    };

    return jwt.encode(payload, secret);
};
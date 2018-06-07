'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');


function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando una acción del controlador del usuario api rest con node y mongo'
    });
}

//Metodo de login
function loginUser(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        console.log(user);
        if (err) {
            res.status(500).send({ message: 'Error en la petición' })
        } else {
            if (!user) {
                res.status(404).send({ message: 'El usuario no existe' });
            } else {
                //Comprobar la contraseña
                bcrypt.compare(password, user.password, function (err, check) {
                    if (check) {
                        // Devolver datos del usuario logueado
                        if (params.gethash) {
                            //Devolver token jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            })
                        } else {
                            res.status(200).send({ user });
                        }
                    } else {
                        res.status(404).send({ message: 'El usuario no ha podido loguearse' });
                    }
                });
            }
        }
    });
}


//Metodo para guardar el usuario
function saveUser(req, res) {
    var user = new User();

    var params = req.body;

    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_ADMIN';
    user.image = 'null';

    if (params.password) {
        //Encriptar contraseña
        bcrypt.hash(params.password, null, null, function (err, hash) {
            user.password = hash;
            if (user.name != null && user.surname != null && user.email != null) {
                //Guardar usuario en bd
                user.save((err, userStored) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al guardar el usuario' });
                    } else {
                        if (!userStored) {
                            res.status(404).send({ message: 'No se ha registrado el usuario' });
                        } else {
                            res.status(200).send({ user: userStored });
                        }
                    }
                })
            } else {
                res.status(200).send({ message: 'Rellena todos los campos' })
            }
        });
    } else {
        res.status(200).send({ message: 'Introduce la contraseña' });
    }
}


function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar el usuario.' });
        } else {
            if (!userUpdated) {
                res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });
            } else {
                res.status(200).send({ user: userUpdated });
            }
        }
    });
}


function updateImage(req, res){
    var userId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_ext = path.extname(file_path)
        var file_name  = path.basename(file_path);

        if(file_ext == '.png' || file_ext == '.jpg' || file_ext == '.gif'){
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated)=>{
                if (!userUpdated) {
                    res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });
                } else {
                    res.status(200).send({image: file_name, user: userUpdated });
                }
            });
        }else{
            res.status(200).send({ message: 'Extensión del archivo no valida' });
        }
    }else{
        res.status(200).send({ message: 'No ha subido ninguna imagen' });
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/'+imageFile;

    fs.access(path_file, fs.constants.F_OK, (err) => {
        if(!err){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({ message: 'No existe la imagen' });
        }
                
    });      
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    updateImage,
    getImageFile
}
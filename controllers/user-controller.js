const userService = require('../service/user-service');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const ApiError = require('../exceptions/api-error');

class UserController {

    async getUsers(request, response, next) { 
        try {
            const users = await userService.module.getAllUsers();
            response.header('Access-Control-Allow-Origin', '*');
            response.header('Access-Control-Allow-Methods', '*');
            response.header('Access-Control-Allow-Headers', 'origin, content-type, accept');
            return response
                .status(200)
                .json(users);
        } catch (error) {
            next(error);
        }
    }

    async getReviews(request, response, next) {
        try {
            const reviews = await userService.module.getAllReviews();
            return response
                .status(200)
                .json(reviews);
        } catch (error) {
            next(error);
        }
    }
    
    async registration(request, response, next) {
        try {
            const errors = validationResult(request);
            if(!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }
            const {email, password} = request.body;
            const userData = await userService.module.registration(email, password);
            // response
            //     .cookie('refreshToken', userData.refreshToken, {
            //         maxAge: 2592000000,
            //         httpOnly: true,
            //     });
            response
                .status(201)
                .json(userData);
        } catch (error) {
            next(error);
        }
    }

    async login(request, response, next) {
        try {
            const {email, password} = request.body;
            const userData = await userService.module.login(email, password);
            // response.cookie('refreshToken', userData.refreshToken, {
            //     maxAge: 2592000000,
            //     httpOnly: true,
            // });
            response
                .status(200)
                .json(userData);
        } catch (error) {
            next(error);
        }
    }

    async logout(request, response, next) {
        try {
            // const {refreshToken} = request.cookies;
            const { refreshToken } = request.body;
            const token = await userService.module.logout(refreshToken);
            // response.clearCookie('refreshToken');
            return response
                .status(200)
                .json(token);
        } catch (error) {
            next(error);
        }
    } 

    async activate(request, response, next) {
        try {
            const activationLink = request.params.link;
            await userService.module.activate(activationLink);
            return response.redirect(process.env.CLIENT_URL);
        } catch (error) {
            next(error);
        }
    }

    async refresh(request, response, next) {
        try {
            const {refreshToken} = request.cookies;
            const userData = await userService.module.refresh(refreshToken);
            response.cookie('refreshToken', userData.refreshToken, {
                maxAge: 2592000000,
                httpOnly: true,
            });
            response.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async handleOptions(request, response, next) {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Server,Date,access-control-allow-methods,access-control-allow-origin');
        response.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS,PATCH');
        response.send('data');
    }

};

module.exports = new UserController();
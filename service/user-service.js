const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const UserModel = require('../models/user-model'); 
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const userModel = require('../models/user-model');
const reviewModel = require('../models/review-model');
const ApiError = require('../exceptions/api-error');

class UserService {
    async registration (email, password) {
        const candidate = await UserModel.findOne({email});
        if(candidate)
            throw ApiError.BadRequest(`User with email: ${email} already exists!`);
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();

        const user = await UserModel.create({email, password: hashPassword, activationLink});
        await mailService.module.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.module.generateTokens({...userDto});
        await tokenService.module.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        }; 
    }

    async activate(activationLink) {
        const user = await userModel.findOne({activationLink});
        if(!user)
            throw ApiError.BadRequest('Incorrect activation Link');
        user.isActivated = true;
        await user.save();
    };

    async login(email, password) {
        const user = await userModel.findOne({email});
        if(!user) 
            throw ApiError.BadRequest('User with this email was not found');
        const isPasswordEquals = await bcrypt.compare(password, user.password);
        if(!isPasswordEquals)
            throw ApiError.BadRequest('Incorrect password!');
        const userDto = new UserDto(user);
        const tokens = tokenService.module.generateTokens({...userDto});
        await tokenService.module.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        };
    }

    async logout (refreshToken) {
        const token = await tokenService.module.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = await tokenService.module.validateRefreshToken(refreshToken);
        const tokenFromDB = await tokenService.module.findToken(refreshToken);
        // if(!userData || !tokenFromDB) 
        //     throw ApiError.UnauthorizedError();
        if (!userData)
            throw ApiError.UnauthorizedError();
        if (!tokenFromDB)
            throw ApiError.UnauthorizedError();
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.module.generateTokens({...userDto});
        await tokenService.module.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        };
    }

    // async getAllUsers() {
    //     const users = await UserModel.find();
    //     return users;
    // }

    async getAllReviews () {
        const reviews = await reviewModel.find();
        return reviews;
    }
    
}

exports.module = new UserService(); 
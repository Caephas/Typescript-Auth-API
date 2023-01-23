/**
 * Test user Registration
 * Check if the username and password gets validated
 * verify that passwords must match
 * verify the handler handles any errors
 */
import mongoose from 'mongoose'
import * as UserService from '../service/user.service'
import supertest from 'supertest'
import createServer from '../utils/server'
import * as SessionService from '../service/session.service'
import { createSessionHandler } from '../controller/session.controller'
import { any } from 'zod'

const app = createServer()
const userId = new mongoose.Types.ObjectId().toString()

const userPayload: any = {
    _id: userId,
    email: "janeDoe@example.com",
    name: "Jane Doe",
}
//Mocking this out of the mongodb database
const sessionPayload: any = {
    _id: new mongoose.Types.ObjectId().toString(),
    user: userId,
    valid: true,
    userAgent: "PostmanRuntime/7.28.4",
    createdAt: new Date("2023-01 - 20T09: 39: 18.636+00: 00"),
    updatedAt: new Date('2023-01 - 20T09: 39: 18.636+00: 00'),
    __v: 0,
}
const userInput = {
    email: 'test@example.com',
    name: 'John Doe',
    password: 'Password1234',
    passwordConfirmation: 'Password1234'
}
describe('user registration', () => {

    describe('given the user name and password are valid', () => {
        it('should return the user payload', async () => {
            const createUserServiceMock = jest.spyOn(UserService, 'createUser')
                .mockReturnValueOnce(userPayload)

            const { statusCode, body } = await supertest(app)
                .post('/api/users')
                .send(userInput)

            expect(statusCode).toBe(200)
            expect(body).toEqual(userPayload)
            expect(createUserServiceMock).toHaveBeenCalledWith(userInput)
        })
    })
    describe('given the passwords do not match', () => {
        it('should returna 400', async () => {
            const createUserServiceMock = jest.spyOn(UserService, 'createUser')
                .mockReturnValueOnce(userPayload)

            const { statusCode } = await supertest(app)
                .post('/api/users')
                .send({ ...userInput, passwordConfirmation: "does not match" })

            expect(statusCode).toBe(400)

            expect(createUserServiceMock).not.toHaveBeenCalled()
        })
    })
    describe('given the user service throws', () => {
        it('should return a 409 error', async () => {

            const createUserServiceMock = jest.spyOn(UserService, 'createUser')
                .mockRejectedValueOnce("Not allowed😒")

            const { statusCode } = await supertest(app)
                .post('/api/users')
                .send(userInput)

            expect(statusCode).toBe(409)

            expect(createUserServiceMock).toHaveBeenCalled()
        })
    })
    /**
 * Creating user session
 * test a user can login with a valid email and password
 */
    describe('create user session', () => {

        describe('given the username and password are valid', () => {

            it('should return a signed accessToken and refresh Token', async () => {
                jest
                    .spyOn(UserService, "validatePassword")
                    .mockReturnValue(userPayload)

                jest
                    .spyOn(SessionService, "createSession")
                    .mockReturnValue(sessionPayload)

                const req: any = {
                    get: () => {
                        return "a user agent"
                    },
                    body: {
                        email: "test@example.com",
                        password: "Password123"
                    },
                }
                const send = jest.fn()
                const status = jest.fn().mockReturnThis()
                const json = jest.fn().mockReturnThis()

                const res = {
                    send,
                    status,
                    json

                }

                await createSessionHandler(await req, res)

                expect(send).toHaveBeenCalledWith({
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String)
                })
            })

        })
    })
})

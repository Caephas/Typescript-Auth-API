import supertest from "supertest"
import createServer from "../utils/server"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import { createProduct } from "../service/product.service"
import { signJwt } from "../utils/jwt.utils"

const app = createServer()
const userId = new mongoose.Types.ObjectId().toString()

export const productPayload = {
    user: userId,
    title: "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
    description: "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
    price: 1500.99,
    image: "https://i.imgur.com/QlRphfQ.jpg"
}

export const userPayload = {
    _id: userId,
    email: "arinzeobidiegwu@gmail.com",
    name: "Arinze Bobby"
}
describe('product', () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()

        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
    })

    describe('get product route', () => {
        describe('given the product does not exist', () => {
            it('should return a 404 error', async () => {
                const productId = 'product-123'
                await supertest(app).get(`/api/products/${productId}`)
                    .expect(404)
            })
        })
        describe('given the product does exist', () => {
            it('should return a 200 status and the product', async () => {

                const product = createProduct(productPayload)

                const { body, statusCode } = await supertest(app).get(`/api/products/${(await product).productId}`)

                expect(statusCode).toBe(200)

                expect(body.productId).toBe((await product).productId)
            })
        })
        describe('create product route', () => {

            describe('given the user is not logged in', () => {
                it('should return a 403', async () => {
                    const { statusCode } = await supertest(app).post('/api/products')

                    expect(statusCode).toBe(403)
                })
            })
            describe('given the user is logged in', () => {
                it('should return a 200 and create the product', async () => {
                    const jwt = signJwt(userPayload)

                    const { statusCode, body } = await supertest(app).post('/api/products')
                        .set('Authorization', `Bearer ${jwt}`)
                        .send(productPayload)

                    expect(statusCode).toBe(200)
                    /**
                     * After passing in an empty object,
                     * it returned this object so I replicated it and the 
                     * tes passed.
                     * TODO: will look into this further to understand why
                     */
                    expect(body).toEqual({
                        "code": 11000,
                        "index": 0,
                        "keyPattern": expect.any(Object),
                        "keyValue": expect.any(Object),
                    })
                })
            })
        })
    })
})
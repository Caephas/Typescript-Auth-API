import supertest from 'supertest'
import createServer from '../utils/server'
import mongoose from 'mongoose'
import {MongoMemoryServer} from 'mongodb-memory-server'
import { createProduct } from '../service/product.service'

const app = createServer()

const userId = new mongoose.Types.ObjectId().toString()

export const productPayload = {
    user: userId,
    title: "new product",
    description: "this is the description of a new product",
    price: 45.09,
    image: "https://google.com/images"
}

describe("product", () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()

        await mongoose.connect(mongoServer.getUri())
    })
    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
    })
    describe("get product route", () => {
        describe("given the product does not exist", () => {
            it("should return a 404", async () => {
                const productId = "product-123"

                await supertest(app).get(`/api/products/${productId}`).expect(404)
            })
        })
        describe("given the product does exist", () => {
            it("should return a 200 status and the product", async () => {
                const product:any = await createProduct(productPayload)
                

                const { body, statusCode } = await supertest(app)
                    .get(`/api/products/${product.productId}`)
                expect(statusCode).toBe(200)

                expect(body.productId).toBe(product.productId)

            })
        })
    })
})
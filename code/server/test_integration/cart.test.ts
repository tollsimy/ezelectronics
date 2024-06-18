import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { Category, Product } from "../src/components/product"
import { Cart, ProductInCart } from "../src/components/cart"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }

const exampleProduct1 = {model: "iPhone 12", category: Category.SMARTPHONE, quantity: 100, sellingPrice: 200, arrivalDate: "2024-06-12"};
const exampleProduct2 = {model: "iPhone 11", category: Category.SMARTPHONE, quantity: 100, sellingPrice: 150, arrivalDate: "2024-06-12"};
const exampleNotAvailableProduct = {model: "iPhone 10", category: Category.SMARTPHONE, quantity: 1, sellingPrice: 100, arrivalDate: "2024-06-12"};
const exampleProductInCart1 = new ProductInCart(exampleProduct1.model, 1, exampleProduct1.category, exampleProduct1.sellingPrice);
const exampleProductInCart2 = new ProductInCart(exampleProduct2.model, 1, exampleProduct2.category, exampleProduct2.sellingPrice);
const exampleNotAvailableProductInCart = new ProductInCart(exampleNotAvailableProduct.model, 1, exampleNotAvailableProduct.category, exampleNotAvailableProduct.sellingPrice);

const exampleCart: { customer: string, paid: boolean, paymentDate: Date | null, total: number, products: ProductInCart[] } = { 
    customer: "customer", 
    paid: false, 
    paymentDate: null, 
    total: 350, 
    products: [exampleProductInCart1, exampleProductInCart2] 
}

const exampleEmptyCart: { customer: string, paid: boolean, paymentDate: Date | null, total: number, products: ProductInCart[] } = { 
    customer: "customer", 
    paid: false, 
    paymentDate: null, 
    total: 0, 
    products: [] 
}

//Cookies for the users
let customerCookie: string
let adminCookie: string
let managerCookie: string

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
//Is an implicit test because it checks if the return code is successful
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}

const postProduct = async (product: any, cookie: any) => {
    await request(app)
        .post(`${routePath}/products`)
        .set('Cookie', cookie)
        .send(product)
        .expect(200)
}

const sellNProduct = async (product: any, cookie: any, quantity: any) => {
    await request(app)
        .patch(`${routePath}/products/${product.model}/sell`)
        .set('Cookie', cookie)
        .send({ quantity: quantity })
        .expect(200)
}

const addNProduct = async (product: any, cookie: any, quantity: any) => {
    await request(app)
        .patch(`${routePath}/products/${product.model}`)
        .set('Cookie', cookie)
        .send({ quantity: quantity })
        .expect(200)
}

const createNCarts = async (n: number) => {
    for (let i = 0; i < n; i++) {
        await request(app)
            .post(`${routePath}/carts`)
            .set('Cookie', customerCookie)
            .send({ model: exampleProduct1.model })
            .expect(200)
        await request(app)
            .patch(`${routePath}/carts`)
            .set('Cookie', customerCookie)
            .expect(200)
    }
}

//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                if (!res || !res.header["set-cookie"])
                    reject()
                else
                    resolve(res.header["set-cookie"][0])
            })
    })
}

jest.setTimeout(500000);

beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(manager)
    await postUser(customer)
    adminCookie = await login(admin)
    managerCookie = await login(manager)
    customerCookie = await login(customer)

    await postProduct(exampleProduct1, managerCookie)
    await postProduct(exampleProduct2, managerCookie)
    await postProduct(exampleNotAvailableProduct, managerCookie)
    await sellNProduct(exampleNotAvailableProduct, managerCookie, exampleNotAvailableProduct.quantity)
})

afterAll(async () => {
    await cleanup()
})

describe("Cart routes integration tests", () => {

    describe("GET /carts", () => {
        test("It should return a 200 success code and get an empty cart if user is customer and has no products in cart", async () => {
            await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
                .expect((res) => {
                    expect(JSON.stringify(res.body)).toEqual(JSON.stringify(exampleEmptyCart));
                })
        })
        test("It should return a 200 success code and get the cart if user is customer and has products a cart", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct2.model })
                .expect(200)
            await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
                .expect((res) => {
                    expect(JSON.stringify(res.body)).toEqual(JSON.stringify(exampleCart));
                })
        })
        test("Quantity in the cart should increment if the same product is added multiple times", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body.products[0].quantity).toEqual(2);
                })
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/carts`)
                .expect(401)
        })
        test("It should return a 401 access error if the user is admin", async () => {
            await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', adminCookie)
                .expect(401)
        })
        test("It should return a 401 access error if the user is manager", async () => {
            await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', managerCookie)
                .expect(401)
        })
    })

    describe("POST /carts", () => {
        test("It should return a 200 success code and add a product to the cart if user is customer", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .send({ model: exampleProduct1.model })
                .expect(401)
        })
        test("It should return a 401 access error if the user is admin", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', adminCookie)
                .send({ model: exampleProduct1.model })
                .expect(401)
        })
        test("It should return a 401 access error if the user is manager", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', managerCookie)
                .send({ model: exampleProduct1.model })
                .expect(401)
        })
        test("It should return a 404 not found error if the product does not exist", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: "unknown" })
                .expect(404)
        })
        test("It should return a 409 error if the model represent a product whose available quantity is 0", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleNotAvailableProduct.model })
                .expect(409)
        })
        test("It should return a 422 if the model is not provided", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({})
                .expect(422)
        })
    })

    describe("PATCH /carts", () => {
        test("It should return a 200 success code and set cart to payed if user is customer", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .patch(`${routePath}/carts`)
                .expect(401)
        })
        test("It should return a 401 access error if the user is admin", async () => {
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', adminCookie)
                .expect(401)
        })
        test("It should return a 401 access error if the user is manager", async () => {
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', managerCookie)
                .expect(401)
        })
        test("It should return a 404 not found error if there is no unpaid cart", async () => {
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(404)
        })
        test("It should return a 400 error if there is an unpaid cart but it is empty", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .set('Cookie', customerCookie)
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(400)
        })
        test("It should return a 409 error if there is at least one product in the cart that is not available", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await sellNProduct(exampleProduct1, managerCookie, exampleProduct1.quantity - 4)
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(409)
        })
        test("It should return 409 error if there is at least one product in the cart whose quantity is greater than the available quantity", async () => {
            await addNProduct(exampleProduct1, managerCookie, 2)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await sellNProduct(exampleProduct1, managerCookie, 1)
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(409)
        })
    })

    describe("GET /carts/history", () => {
        test("It should return a 200 success code and get the cart history if user is customer", async () => {
            const examplePaidCartHistory = [
                {
                    "customer": "customer",
                    "paid": true,
                    "paymentDate": new Date().toISOString().split('T')[0], 
                    "products": 
                    [
                        {
                            "category": "Smartphone",
                            "model": "iPhone 12", 
                            "price": 200, 
                            "quantity": 1
                        }, 
                        {
                            "category": "Smartphone",
                            "model": "iPhone 11", 
                            "price": 150, 
                            "quantity": 1
                        }
                    ], 
                    "total": 350
                }, 
                {
                    "customer": "customer",
                    "paid": true, 
                    "paymentDate": new Date().toISOString().split('T')[0], 
                    "products": 
                    [
                        {
                            "category": "Smartphone", 
                            "model": "iPhone 12", 
                            "price": 200, 
                            "quantity": 1
                        }
                    ], 
                    "total": 200
                }
            ]
            // delete all carts
            await request(app)
                .delete(`${routePath}/carts`)
                .set('Cookie', managerCookie)
                .expect(200)
            // create and pay a cart
            await addNProduct(exampleProduct1, managerCookie, 10)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct2.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
            // create and pay another cart
            await addNProduct(exampleProduct1, managerCookie, 10)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
            await request(app)
                .get(`${routePath}/carts/history`)
                .set('Cookie', customerCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(examplePaidCartHistory);
                })
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/carts/history`)
                .expect(401)
        })
        test("It should return a 401 access error if the user is admin", async () => {
            await request(app)
                .get(`${routePath}/carts/history`)
                .set('Cookie', adminCookie)
                .expect(401)
        })
        test("It should return a 401 access error if the user is manager", async () => {
            await request(app)
                .get(`${routePath}/carts/history`)
                .set('Cookie', managerCookie)
                .expect(401)
        })
    })

    describe("DELETE /carts/products/:model", () => {
        test("It should return a 200 success code and remove a product from the cart if user is customer, it must update cart total", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .set('Cookie', customerCookie)
                .expect(200)
            await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body.total).toEqual(0);
                })
                .expect((res) => {
                    expect(res.body.products.length).toEqual(0);
                })
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .expect(401)
        })
        test("It should return a 401 access error if the user is admin", async () => {
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .set('Cookie', adminCookie)
                .expect(401)
        })
        test("It should return a 401 access error if the user is manager", async () => {
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .set('Cookie', managerCookie)
                .expect(401)
        })
        test("It should return a 404 not found error if the product does not exist", async () => {
            await request(app)
                .delete(`${routePath}/carts/products/unknown`)
                .set('Cookie', customerCookie)
                .expect(404)
        })
        test("It should return a 404 not found error if the product is not in the cart", async () => {
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .set('Cookie', customerCookie)
                .expect(404)
        })
        test("It should return a 404 not found error if there is not unpaid cart", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .set('Cookie', customerCookie)
                .expect(404)
        })
        test("It should return a 404 not found error if the cart is empty", async () => {
            await request(app)
                .delete(`${routePath}/carts/products/${exampleProduct1.model}`)
                .set('Cookie', customerCookie)
                .expect(404)
        })
    })

    describe("DELETE /carts/current", () => {
        test("It should return a 200 success code and remove all products from the cart if user is customer", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct2.model })
                .expect(200)
            await request(app)
                .delete(`${routePath}/carts/current`)
                .set('Cookie', customerCookie)
                .expect(200)
            await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body.total).toEqual(0);
                })
                .expect((res) => {
                    expect(res.body.products.length).toEqual(0);
                })
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/carts/current`)
                .expect(401)
        })
        test("It should return a 401 access error if the user is admin", async () => {
            await request(app)
                .delete(`${routePath}/carts/current`)
                .set('Cookie', adminCookie)
                .expect(401)
        })
        test("It should return a 401 access error if the user is manager", async () => {
            await request(app)
                .delete(`${routePath}/carts/current`)
                .set('Cookie', managerCookie)
                .expect(401)
        })
        test("It should return a 404 not found error if there is no unpaid cart", async () => {
            await request(app)
                .delete(`${routePath}/carts`)
                .set('Cookie', managerCookie)
                .expect(200)
            await request(app)
                .delete(`${routePath}/carts/current`)
                .set('Cookie', customerCookie)
                .expect(404)
        })
    })

    describe("DELETE /carts", () => {
        test("It should return a 200 success code and delete all existing carts if the user is manager", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct2.model })
                .expect(200)
            await request(app)
                .delete(`${routePath}/carts`)
                .set('Cookie', managerCookie)
                .expect(200)
            const p=await request(app)
                .get(`${routePath}/carts/all`)
                .set('Cookie', adminCookie)
                .expect(200)
            expect(p.body.length).toBe(0);
        })
        test("It should return a 200 success code and delete all existing carts if the user is admin", async () => {
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct1.model })
                .expect(200)
            await request(app)
                .post(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .send({ model: exampleProduct2.model })
                .expect(200)
            await request(app)
                .delete(`${routePath}/carts`)
                .set('Cookie', adminCookie)
                .expect(200)
            const p=await request(app)
                .get(`${routePath}/carts/all`)
                .set('Cookie', adminCookie)
                .expect(200)
            expect(p.body.length).toBe(0);
            
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/carts`)
                .expect(401)
        })
        test("It should return a 401 access error if the user is customer", async () => {
            await request(app)
                .delete(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(401)
        })
    })

    describe("GET /carts/all", () => {
        test("It should return a 200 success code and get all carts if the user is admin", async () => {
            await createNCarts(5);
            await request(app)
                .get(`${routePath}/carts/all`)
                .set('Cookie', adminCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body.length).toBe(5);
                })
        })
        test("It should return a 200 success code and get all carts if the user is manager", async () => {
            await request(app)
                .get(`${routePath}/carts/all`)
                .set('Cookie', managerCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body.length).toBe(5)
                })
        })
        test("It should return a 401 access error if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/carts/all`)
                .expect(401)
        })
        test("It should return a 401 access error if the user is customer", async () => {
            await request(app)
                .get(`${routePath}/carts/all`)
                .set('Cookie', customerCookie)
                .expect(401)
        })
    })

})
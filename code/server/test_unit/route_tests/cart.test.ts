import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import { Product, Category } from "../../src/components/product"
import ErrorHandler from "../../src/helper"
import CartController from "../../src/controllers/cartController"
const baseURL = "/ezelectronics"


//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/cartController")
jest.mock("../../src/routers/auth")

let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

describe("Route cart unit tests", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    describe("GET /carts", () => {
        test("Should return 200 for a successful request", async () => {
            const cartTest = {customer: "customer", paid: false, paymentDate: " ", total: 200, products: [{model: "test", category: Category.SMARTPHONE, quantity: 1, price: 200}]}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(cartTest)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get(baseURL + "/carts")
            expect(response.status).toBe(200)
            expect(CartController.prototype.getCart).toHaveBeenCalled()
            expect(CartController.prototype.getCart).toHaveBeenCalledWith(undefined)
        })
    })

    describe("POST /carts", () => {
        test("Should return 200 for a successful request", async () => {
            const inputProduct = { model : "test"}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "addToCart").mockResolvedValueOnce(true)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).post(baseURL + "/carts").send(inputProduct)
            expect(response.status).toBe(200)
            expect(CartController.prototype.addToCart).toHaveBeenCalled()
            expect(CartController.prototype.addToCart).toHaveBeenCalledWith(undefined, "test")
        })
    })

    describe("Patch /carts", () => {
        test("Should return 200 for a successful request", async () => {
            const inputProduct = { quantity: 10, sellingDate: "2021-10-10"}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).patch(baseURL + "/carts").send()
            expect(response.status).toBe(200)
            expect(CartController.prototype.checkoutCart).toHaveBeenCalled()
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(undefined)
        })
    })

    describe("GET ezelectronics/carts/history", () => {
        test("Should return 200 for a successful request", async () => {
            
            const cartTest = {customer: "customer", paid: true, paymentDate: "2021-10-10", total: 200, products: [{model: "test", category: Category.SMARTPHONE, quantity: 1, price: 200}]}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce([cartTest])

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get(baseURL + "/carts/history")
            expect(response.status).toBe(200)
            expect(CartController.prototype.getCustomerCarts).toHaveBeenCalled()
            expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(undefined)
        })
    })
    
    describe("DELETE ezelectronics/carts/products/:model", () => {
        test("Should return 200 for a successful request", async () => {
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValueOnce(true)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).delete(baseURL + "/carts/products/test")
            expect(response.status).toBe(200)
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalled()
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(undefined, "test")
        })
    })

    describe("DELETE ezelectronics/carts/current", () => {
        test("Should return 200 for a successful request", async () => {
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "clearCart").mockResolvedValueOnce(true)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).delete(baseURL + "/carts/current")
            expect(response.status).toBe(200)
            expect(CartController.prototype.clearCart).toHaveBeenCalled()
            expect(CartController.prototype.clearCart).toHaveBeenCalledWith(undefined)
        })
    })

    describe("DELETE ezelectronics/carts", () => {
        test("Should return 200 for a successful request", async () => {
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValueOnce(true)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).delete(baseURL + "/carts")
            expect(response.status).toBe(200)
            expect(CartController.prototype.deleteAllCarts).toHaveBeenCalled()
        })
    })

    describe("GET ezelectronics/carts/all", () => {
        test("Should return 200 for a successful request", async () => {
            const cartTest = {customer : "customer", paid: false, paymentDate: " ", total: 200, products: [{model: "test", category: Category.SMARTPHONE, quantity: 1, price: 200}]}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce([cartTest])

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get(baseURL + "/carts/all")
            expect(response.status).toBe(200)
            expect(CartController.prototype.getAllCarts).toHaveBeenCalled()
        })
    })
})
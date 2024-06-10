import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import ProductController from "../../src/controllers/productController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import { Product, Category } from "../../src/components/product"
import ErrorHandler from "../../src/helper"
import e from "express"
import { param } from "express-validator"
const baseURL = "/ezelectronics"

//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/productController")
jest.mock("../../src/routers/auth")

let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

describe("Route unit tests", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    })

    describe("POST /products", () => {
        test("It should return a 200 success code", async () => {
            const inputProduct = { model: "test", details: "test", sellingPrice: 100, quantity: 10, category: "Smartphone", arrivalDate: "2021-10-10"}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                    
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce()

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).post(baseURL + "/products").send(inputProduct)
            expect(response.status).toBe(200)
            expect(ProductController.prototype.registerProducts).toHaveBeenCalled()
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(inputProduct.model, inputProduct.category, inputProduct.quantity, inputProduct.details, inputProduct.sellingPrice,inputProduct.arrivalDate)
            })
    })

    describe("Patch /products/:model", () => {
        test("It should return a 200 success code", async () => {
            const inputProduct = { quantity: 10, changeDate: "2021-10-10"}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).patch(baseURL + "/products/test").send(inputProduct)
            expect(response.status).toBe(200)
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalled()
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith("test", inputProduct.quantity, inputProduct.changeDate)
            })
    })

    describe("Patch /products/:model/sell", () => {
        test("It should return a 200 success code", async () => {
            const inputProduct = { quantity: 10, sellingDate: "2021-10-10"}
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(20)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).patch(baseURL + "/products/test/sell").send(inputProduct)
            expect(response.status).toBe(200)
            expect(ProductController.prototype.sellProduct).toHaveBeenCalled()
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith("test", inputProduct.quantity, inputProduct.sellingDate)
            })
    })

    describe("GET /products", () => {
        test("It should return a 200 success code", async () => {

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([{ model: "test", details: "test", sellingPrice: 100, quantity: 10, category: Category.SMARTPHONE, arrivalDate: "2021-10-10"}])

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).get(baseURL + "/products")
            expect(response.status).toBe(200)
            expect(ProductController.prototype.getProducts).toHaveBeenCalled()
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(undefined, undefined, undefined)
        })
    })

    describe("GET /products?grouping=category&category=Smartphone", () => {
        test("It should return a 200 success code", async () => {

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([{ model: "test", details: "test", sellingPrice: 100, quantity: 10, category: Category.SMARTPHONE, arrivalDate: "2021-10-10"}])

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).get(baseURL + "/products?grouping=category&category=Smartphone")
            expect(response.status).toBe(200)
            expect(ProductController.prototype.getProducts).toHaveBeenCalled()
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith("category", "Smartphone", undefined)
        })
    })

    describe("GET /products?grouping=model & model=test", () => {
        test("It should return a 200 success code", async () => {

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([{ model: "test", details: "test", sellingPrice: 100, quantity: 10, category: Category.SMARTPHONE, arrivalDate: "2021-10-10"}])

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).get(baseURL + "/products?grouping=model&model=test")
            expect(response.status).toBe(200)
            expect(ProductController.prototype.getProducts).toHaveBeenCalled()
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith("model",undefined, "test")
        })
    })

    describe("GET /products/available", () => {
        test("It should return a 200 success code", async () => {

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([{ model: "test", details: "test", sellingPrice: 100, quantity: 10, category: Category.SMARTPHONE, arrivalDate: "2021-10-10"}])

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).get(baseURL + "/products/available")
            expect(response.status).toBe(200)
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalled()
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(undefined, undefined, undefined)
        })
    })

    describe("DELETE /products/:model", () => {
        test("It should return a 200 success code", async () => {

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).delete(baseURL + "/products/test")
            expect(response.status).toBe(200)
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalled()
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("test")
        })
    })

    describe("DELETE /products", () => {
        test("It should return a 200 success code", async () => {

            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true)

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            
            const response = await request(app).delete(baseURL + "/products")
            expect(response.status).toBe(200)
            expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalled()
        })
    })



    
  
})

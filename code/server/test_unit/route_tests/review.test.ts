import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import ReviewController from "../../src/controllers/reviewController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import { ProductReview } from "../../src/components/review"
import { Product, Category } from "../../src/components/product"
import ErrorHandler from "../../src/helper"
import { param } from "express-validator"
const baseURL = "/ezelectronics"

jest.mock("../../src/controllers/reviewController")
jest.mock("../../src/routers/auth")

let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")
let product = { model: "iPhone 10", details: "test", sellingPrice: 100, quantity: 10, category: "Smartphone", arrivalDate: "2021-10-10"}

describe("Review Route Unit Tests", () => {
    
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe("POST /reviews/:model", () => {
        test("It should return 200 success code", async () => {
            const inputReview = { score: 5, comment: "A very cool smartphone!" }
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                    isInt: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce()
            const response = await request(app)
                .post(`${baseURL}/reviews/${product.model}`)
                .send(inputReview)
                .expect(200)
            expect(ReviewController.prototype.addReview).toHaveBeenCalled()
            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(product.model, inputReview.score, inputReview.comment, undefined)
        })
    })

    describe("GET /reviews/:model", () => {
        test("It should return 200 success code", async () => {
            const reviews: ProductReview[] = [
                { model: product.model, user: "customer", date: "2021-10-10", score: 5, comment: "A very cool smartphone!" },
                { model: product.model, user: "customer", date: "2021-10-10", score: 5, comment: "A very cool smartphone!" }
            ]
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce(reviews)
            const response = await request(app)
                .get(`${baseURL}/reviews/${product.model}`)
                .expect(200)
            expect(ReviewController.prototype.getProductReviews).toHaveBeenCalled()
            expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(product.model)
        })
    })

    describe("DELETE /reviews/:model", () => {
        test("It should return 200 success code", async () => {
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValue();
            await request(app)
                .delete(`${baseURL}/reviews/${product.model}`)
                .expect(200)
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalled()
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(product.model, undefined)
        })
    })

    describe("DELETE /reviews/:model/all", () => {
        test("It should return 200 success code", async () => {
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce()

            await request(app)
                .delete(`${baseURL}/reviews/${product.model}/all`)
                .expect(200)

            expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalled()
            expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(product.model)
        })
    })

    describe("DELETE /reviews", () => {  
        test("It should return 200 success code", async () => {        
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce()
            await request(app)
                .delete(`${baseURL}/reviews`)
                .expect(200)
            expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalled()
            expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledWith()
        })
    })

})
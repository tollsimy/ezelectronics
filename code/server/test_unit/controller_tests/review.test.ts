import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import ReviewController from "../../src/controllers/reviewController"
import { ProductReview } from "../../src/components/review"
import ReviewDAO from "../../src/dao/reviewDAO"
import { User, Role } from "../../src/components/user"

jest.mock("../../src/dao/reviewDAO")

describe("Controller unit test", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    })

    describe("Add review", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new ReviewController();
            const review = new ProductReview("model", "user", 5, "2000-04-05", "comment");
            jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValueOnce();
            const response = await controller.addReview(
                "model",
                5,
                "comment",
                new User(
                    "username",
                    "name",
                    "surname",
                    Role.CUSTOMER,
                    "",
                    ""
                )
            );
            expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
            expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(
                "model",
                "username",
                new Date().toISOString().split('T')[0],
                5,
                "comment"
            );
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new ReviewController();
            const error = new Error("Error");
            jest.spyOn(ReviewDAO.prototype, "addReview").mockRejectedValueOnce(error);
            try {
                await controller.addReview(
                    "model",
                    5,
                    "comment",
                    new User(
                        "username",
                        "name",
                        "surname",
                        Role.CUSTOMER,
                        "",
                        ""
                    )
                )
            } catch (e) {
                expect(e).toBe(error)
            }
        })
    })

    describe("Get product reviews", () => {
        test("It should resolve to an array of ProductReview when DAO resolves to an array of ProductReview", async () => {
            const controller = new ReviewController();
            const reviews = [
                new ProductReview("model", "user", 5, "2000-04-05", "comment")
            ]
            jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValueOnce(reviews);
            const response = await controller.getProductReviews("model");
            expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
            expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith("model");
            expect(response).toEqual(reviews)
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new ReviewController();
            const error = new Error("Error");
            jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockRejectedValueOnce(error);
            try {
                await controller.getProductReviews("model")
            } catch (e) {
                expect(e).toBe(error)
            }
        })
    })

    describe("Delete review", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new ReviewController();
            jest.spyOn(ReviewDAO.prototype, "deleteReview").mockResolvedValueOnce();
            const response = await controller.deleteReview("model", { username: "user" , role: Role.CUSTOMER, name: "name", surname: "surname", address: "", birthdate: ""});
            expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
            expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith("model", "user");
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new ReviewController();
            const error = new Error("Error");
            jest.spyOn(ReviewDAO.prototype, "deleteReview").mockRejectedValueOnce(error);
            try {
                await controller.deleteReview("model", { username: "user" , role: Role.CUSTOMER, name: "name", surname: "surname", address: "", birthdate: ""})
            } catch (e) {
                expect(e).toBe(error)
            }
        })
    })

    describe("Delete reviews of product", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new ReviewController();
            jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce();
            const response = await controller.deleteReviewsOfProduct("model");
            expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
            expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith("model");
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new ReviewController();
            const error = new Error("Error");
            jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct").mockRejectedValueOnce(error);
            try {
                await controller.deleteReviewsOfProduct("model")
            } catch (e) {
                expect(e).toBe(error)
            }
        })
    })

    describe("Delete all reviews", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new ReviewController();
            jest.spyOn(ReviewDAO.prototype, "deleteAllReviews").mockResolvedValueOnce();
            const response = await controller.deleteAllReviews();
            expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new ReviewController();
            const error = new Error("Error");
            jest.spyOn(ReviewDAO.prototype, "deleteAllReviews").mockRejectedValueOnce(error);
            try {
                await controller.deleteAllReviews()
            } catch (e) {
                expect(e).toBe(error)
            }
        })
    })

})
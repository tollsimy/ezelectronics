import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import ReviewController from "../../src/controllers/reviewController"
import ReviewDAO from "../../src/dao/reviewDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { get } from "http"

//TODO: help 
test("It should resolve if user add a review", async () => {
    const reviewDAO = new ReviewDAO()
    const mockDBGet = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await reviewDAO.addReview("model", "user", "date", 1, "comment")
    expect(mockDBGet).toHaveBeenCalled()
    expect(result).resolves
    mockDBGet.mockRestore()
}) 

test("It should resolve the reviews of a product", async () => {
    const reviewDAO = new ReviewDAO()
    const mockDBGet = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, [{ model: "model", user: "user", score: 1, date: "date", comment: "comment" }])
        return {} as Database
    });
    const result = await reviewDAO.getProductReviews("model")
    expect(result).toEqual([{ model: "model", user: "user", score: 1, date: "date", comment: "comment" }])
    mockDBGet.mockRestore()
})

test("It should resolve if a review is deleted given a model and a user", async () => {
    const reviewDAO = new ReviewDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { model: "model", user: "user" })
        return {} as Database
    });
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await reviewDAO.deleteReview("model", "user")
    expect(mockDBGet).toHaveBeenCalled()
    expect(mockDBRun).toHaveBeenCalled()
    expect(result).resolves
    mockDBGet.mockRestore()
    mockDBRun.mockRestore()
})

test("It should resolve if all the reviews of a specific model are deleted", async () => {
    const reviewDAO = new ReviewDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, [{ model: "model", user: "user" }])
        return {} as Database
    });
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await reviewDAO.deleteReviewsOfProduct("model")
    expect(mockDBGet).toHaveBeenCalled()
    expect(mockDBRun).toHaveBeenCalled()
    expect(result).resolves
    mockDBGet.mockRestore()
    mockDBRun.mockRestore()
})

test("It should resolve if all the reviews are deleted", async () => {
    const reviewDAO = new ReviewDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await reviewDAO.deleteAllReviews()
    expect(mockDBRun).toHaveBeenCalled()
    expect(result).resolves 
    mockDBRun.mockRestore()
})

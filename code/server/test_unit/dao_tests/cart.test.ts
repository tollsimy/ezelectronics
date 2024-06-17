import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { User, Role } from "../../src/components/user"

jest.mock("../../src/db/db.ts")

const cartDAO = new CartDAO()

beforeAll(() => {
    jest.restoreAllMocks()
})

afterAll(() => {
    jest.restoreAllMocks()
})


test("It should resolve true if a product is added to the user cart", async () => {
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, {product: "model"})
        return {} as Database
    });
    const result = await cartDAO.addToCart(new User("customer", "customer", "customer", Role.CUSTOMER, "address", "2020-03-03"), "model")
    expect(result).toBe(true)
})

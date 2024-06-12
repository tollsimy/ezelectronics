import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import CartController from "../../src/controllers/cartController"
import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { mock } from "node:test"


//getCart(user: User): Promise<Cart>
test("It should resolve the cart object if cart is retrieved by its user", async () => {
    const cartDAO = new CartDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null)  
        return {} as Database
    })
    const result = await cartDAO.getCart("username")
    expect(result).toBe({})
    mockDBGet.mockRestore()
});

//addToCart(user: User, product: string): Promise<Boolean>
test("It should resolve true if a product is added to the user cart", async () => {
    const cartDAO = new CartDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await cartDAO.addToCart("username", "model")
    expect(result).toBe(true)
    mockDBRun.mockRestore()
})

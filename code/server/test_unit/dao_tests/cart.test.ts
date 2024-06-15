import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import CartController from "../../src/controllers/cartController"
import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { User, Role } from "../../src/components/user"
import { Cart, ProductInCart } from "../../src/components/cart"
import { Category, Product } from "../../src/components/product"

jest.mock("../../src/db/db.ts")

const cartDAO = new CartDAO()

beforeAll(() => {
    jest.restoreAllMocks()
})

afterAll(() => {
    jest.restoreAllMocks()
})

/*
test("It should resolve the cart object if cart is retrieved by its user", async () => {
    const cart = new Cart(
        "customer",
        false,
        null,
        100,
        [new ProductInCart("iPhone", 100, Category.SMARTPHONE, 100,)],
    )
    jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, [cart])  
        return {} as Database
    })
    const result = await cartDAO.getCart(new User("customer", "customer", "customer", Role.CUSTOMER, "address", "2020-03-03"))
    expect(result).toEqual(cart)
});
*/

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

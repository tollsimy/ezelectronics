import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import CartController from "../../src/controllers/cartController"
import { Cart, ProductInCart } from "../../src/components/cart"
import CartDAO from "../../src/dao/cartDAO"
import { User, Role } from "../../src/components/user"
import { Category, Product } from "../../src/components/product"

jest.mock("../../src/dao/cartDAO")

describe("Controller unit test", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    })

    describe("Add to cart", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(true);
            const response = await controller.addToCart(user, "product");
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(user, "product");
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "addToCart").mockRejectedValueOnce(error);
            try {
                await controller.addToCart(user, "product");
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })

    describe("Get cart", () => {
        test("It should resolve to a cart when DAO resolve to a cart", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const cart = new Cart(user.username, false, "2000-04-05", 154.5, [new ProductInCart("model", 5, Category.APPLIANCE, 10)])
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(cart);
            const response = await controller.getCart(user);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(user);
            expect(response).toBe(cart);
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "getCart").mockRejectedValueOnce(error);
            try {
                await controller.getCart(user);
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })

    describe("Checkout cart", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValueOnce(true);
            const response = await controller.checkoutCart(user);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(user);
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "checkoutCart").mockRejectedValueOnce(error);
            try {
                await controller.checkoutCart(user);
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })

    describe("Get customer carts", () => {
        test("It should resolve to an array of carts when DAO resolve to an array of carts", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const carts = [
                new Cart(user.username, false, "2000-04-05", 154.5, [])
            ]
            jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockResolvedValueOnce(carts);
            const response = await controller.getCustomerCarts(user);
            expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledWith(user);
            expect(response).toEqual(carts)
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockRejectedValueOnce(error);
            try {
                await controller.getCustomerCarts(user);
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })

    describe("Remove from cart", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockResolvedValueOnce(true);
            const response = await controller.removeProductFromCart(user, "product");
            expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.removeProductFromCart).toHaveBeenCalledWith(user, "product");
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockRejectedValueOnce(error);
            try {
                await controller.removeProductFromCart(user, "product");
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })

    describe("clear cart", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(true);
            const response = await controller.clearCart(user);
            expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.clearCart).toHaveBeenCalledWith(user);
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "clearCart").mockRejectedValueOnce(error);
            try {
                await controller.clearCart(user);
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })

    describe("Delete all carts", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            jest.spyOn(CartDAO.prototype, "deleteAllCarts").mockResolvedValueOnce(true);
            const response = await controller.deleteAllCarts();
            expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledWith();
            expect(response).resolves
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const user = new User(
                "username",
                "name",
                "surname",
                Role.CUSTOMER,
                "",
                ""
            )
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "deleteAllCarts").mockRejectedValueOnce(error);
            try {
                await controller.deleteAllCarts();
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })

    describe("Get all carts", () => {
        test("It should resolve to an array of carts when DAO resolve to an array of carts", async () => {
            const controller = new CartController();
            const carts = [
                new Cart("username", false, "2000-04-05", 154.5, [])
            ]
            jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce(carts);
            const response = await controller.getAllCarts();
            expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
            expect(response).toEqual(carts)
        })
        test("It should reject when DAO rejects", async () => {
            const controller = new CartController();
            const error = new Error("Error");
            jest.spyOn(CartDAO.prototype, "getAllCarts").mockRejectedValueOnce(error);
            try {
                await controller.getAllCarts();
            } catch (e) {
                expect(e).toBe(error);
            }
        })
    })
})
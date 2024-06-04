import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import ProductController from "../../src/controllers/productController"
import { Product, Category } from "../../src/components/product"
import ProductDAO from "../../src/dao/productDAO"

jest.mock("../../src/dao/productDAO")

describe("Controller unit test", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    })

    describe("registerProducts", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const testProduct = new Product(
                550, 
                "iPhone13",
                Category.SMARTPHONE,
                "2024-06-04",
                "details",
                10
            )
            jest.spyOn(ProductDAO.prototype, "createProduct").mockResolvedValueOnce();
            const controller = new ProductController(); 
            const response = await controller.registerProducts(
                testProduct.model, 
                testProduct.category, 
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
            )
            expect(ProductDAO.prototype.createProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.createProduct).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.sellingPrice, 
                testProduct.category, 
                testProduct.arrivalDate,
                testProduct.details,
                testProduct.quantity,
            );
            expect(response).resolves
        });
        test("It should reject to err when DAO rejects error", async () => {
            const testProduct = new Product(
                550, 
                "iPhone13",
                Category.SMARTPHONE,
                "2024-06-04",
                "details",
                10
            )
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "createProduct").mockRejectedValueOnce(error);
            const controller = new ProductController();
            try {
                await controller.registerProducts(
                    testProduct.model, 
                    testProduct.category, 
                    testProduct.quantity, 
                    testProduct.details, 
                    testProduct.sellingPrice, 
                    testProduct.arrivalDate
                )
            } catch (err) {
                expect(ProductDAO.prototype.createProduct).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.createProduct).toHaveBeenCalledWith(
                    testProduct.model,
                    testProduct.sellingPrice, 
                    testProduct.category, 
                    testProduct.arrivalDate,
                    testProduct.details,
                    testProduct.quantity,
                );
            }
        });
        test("It should reject when date format error", async () => {
            const testProduct = new Product(
                550, 
                "iPhone13",
                Category.SMARTPHONE,
                "ABCDEFGHIJ",
                "details",
                10
            )
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "createProduct").mockResolvedValueOnce()
            const controller = new ProductController();
            try {
                await controller.registerProducts(
                    testProduct.model, 
                    testProduct.category, 
                    testProduct.quantity, 
                    testProduct.details, 
                    testProduct.sellingPrice, 
                    testProduct.arrivalDate
                )
            } catch (err) {
                expect(ProductDAO.prototype.createProduct).toHaveBeenCalledTimes(0);
            }
        });
        
    })
    describe("changeProductQuantity", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const testProduct = {
                model: "iPhone13",
                newQuantity: 10,
                changeDate: "2024-06-04"
            }
            jest.spyOn(ProductDAO.prototype, "addProductQuantity").mockResolvedValueOnce(20);
            jest.spyOn(ProductController.prototype, "isAfterOrTodayDate").mockResolvedValueOnce(true);
            const controller = new ProductController();
            const response = await controller.changeProductQuantity(
                testProduct.model,
                testProduct.newQuantity,
                testProduct.changeDate
            )
            expect(ProductDAO.prototype.addProductQuantity).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.addProductQuantity).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.newQuantity
            );
            expect(response).toEqual(20);
        });
        test("It should reject to error when DAO rejects error", async () => {
            const testProduct = {
                model: "iPhone13",
                newQuantity: 10,
                changeDate: "2024-06-04"
            }
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "addProductQuantity").mockRejectedValueOnce(error);
            jest.spyOn(ProductController.prototype, "isAfterOrTodayDate").mockResolvedValueOnce(true);
            const controller = new ProductController();
            try {
                await controller.changeProductQuantity(
                    testProduct.model,
                    testProduct.newQuantity,
                    testProduct.changeDate
                )
            } catch (err) {
                expect(ProductDAO.prototype.addProductQuantity).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.addProductQuantity).toHaveBeenCalledWith(
                    testProduct.model,
                    testProduct.newQuantity
                );
            }
        });
        test("It should reject when date format error", async () => {
            const testProduct = {
                model: "iPhone13",
                newQuantity: 10,
                changeDate: "ABCDEFGHIJ"
            }
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "addProductQuantity").mockResolvedValueOnce(20);
            jest.spyOn(ProductController.prototype, "isAfterOrTodayDate").mockResolvedValueOnce(true);
            const controller = new ProductController();
            try {
                await controller.changeProductQuantity(
                    testProduct.model,
                    testProduct.newQuantity,
                    testProduct.changeDate
                )
            } catch (err) {
                expect(ProductDAO.prototype.addProductQuantity).toHaveBeenCalledTimes(0);
            }
        });
    })
    describe("sellProduct", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const sellingQuantity = 10;
            const sellingDate = "2024-06-04";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
            }
            jest.spyOn(ProductDAO.prototype, "removeProductQuantity").mockResolvedValueOnce(testProduct.quantity - sellingQuantity);
            jest.spyOn(ProductController.prototype, "isAfterOrTodayDate").mockResolvedValueOnce(true);
            const controller = new ProductController();
            const response = await controller.sellProduct(
                testProduct.model,
                sellingQuantity,
                sellingDate,
            )
            expect(ProductDAO.prototype.removeProductQuantity).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.removeProductQuantity).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.quantity,
            );
            expect(response).resolves
        });
        test("It should reject to error when DAO rejects error", async () => {
            const sellingQuantity = 10;
            const sellingDate = "2024-06-04";
            const testProduct = {
                model: "iPhone13",
                quantity: 10
            }
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "removeProductQuantity").mockRejectedValueOnce(error);
            jest.spyOn(ProductController.prototype, "isAfterOrTodayDate").mockResolvedValueOnce(true);
            const controller = new ProductController();
            try {
                await controller.sellProduct(
                    testProduct.model,
                    testProduct.quantity,
                    sellingDate,
                )
            } catch (err) {
                expect(ProductDAO.prototype.removeProductQuantity).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.removeProductQuantity).toHaveBeenCalledWith(
                    testProduct.model,
                    testProduct.quantity,
                );
            }
        });
        test("It should reject when date format error", async () => {
            const sellingQuantity = 10;
            const sellingDate = "ABCDEFGHIJ";
            const testProduct = {
                model: "iPhone13",
                quantity: 10
            }
            jest.spyOn(ProductDAO.prototype, "removeProductQuantity").mockResolvedValueOnce(testProduct.quantity - sellingQuantity);
            jest.spyOn(ProductController.prototype, "isAfterOrTodayDate").mockResolvedValueOnce(true);
            const controller = new ProductController();
            try {
                await controller.sellProduct(
                    testProduct.model,
                    testProduct.quantity,
                    sellingDate,
                )
            } catch (err) {
                expect(ProductDAO.prototype.removeProductQuantity).toHaveBeenCalledTimes(0);
            }
        });
    })
    describe("getProducts", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const grouping = "model";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValueOnce([testProduct]);
            const controller = new ProductController();
            const response = await controller.getProducts(
                grouping,
                category,
                model
            )
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                model
            );
            expect(response).toEqual([testProduct]);
        });
        test("It should reject to error when DAO rejects error", async () => {
            const grouping = "model";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "getProductByModel").mockRejectedValueOnce(error);
            const controller = new ProductController();
            try {
                await controller.getProducts(
                    grouping,
                    category,
                    model
                )
            } catch (err) {
                expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                    model
                );
            }
        });
        test("It should resolve to true when DAO resolve to true and grouping category", async () => {
            const grouping = "category";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            jest.spyOn(ProductDAO.prototype, "getProductsByCategory").mockResolvedValueOnce([testProduct]);
            const controller = new ProductController();
            const response = await controller.getProducts(
                grouping,
                category,
                model
            )
            expect(ProductDAO.prototype.getProductsByCategory).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductsByCategory).toHaveBeenCalledWith(
                category
            );
            expect(response).toEqual([testProduct]);
        })
        test("It should reject to error when DAO rejects error and grouping category", async () => {
            const grouping = "category";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "getProductsByCategory").mockRejectedValueOnce(error);
            const controller = new ProductController();
            try {
                await controller.getProducts(
                    grouping,
                    category,
                    model
                )
            } catch (err) {
                expect(ProductDAO.prototype.getProductsByCategory).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.getProductsByCategory).toHaveBeenCalledWith(
                    category
                );
            }
        })
        test("It should getAllProducts when grouping is not model or category", async () => {
            const grouping = "not-valid";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce([testProduct]);
            const controller = new ProductController();
            const response = await controller.getProducts(
                grouping,
                null,
                null
            )
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct]);
        })
    })
    describe("getAvailableProducts", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const grouping = "model";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            jest.spyOn(ProductDAO.prototype, "getAvailableProductByModel").mockResolvedValueOnce([testProduct]);
            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                grouping,
                category,
                model
            )
            expect(ProductDAO.prototype.getAvailableProductByModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getAvailableProductByModel).toHaveBeenCalledWith(
                model
            );
            expect(response).toEqual([testProduct]);
        });
        test("It should reject to error when DAO rejects error", async () => {
            const grouping = "model";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "getAvailableProductByModel").mockRejectedValueOnce(error);
            const controller = new ProductController();
            try {
                await controller.getAvailableProducts(
                    grouping,
                    category,
                    model
                )
            } catch (err) {
                expect(ProductDAO.prototype.getAvailableProductByModel).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.getAvailableProductByModel).toHaveBeenCalledWith(
                    model
                );
            }
        });
        test("It should resolve to true when DAO resolve to true and grouping category", async () => {
            const grouping = "category";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            jest.spyOn(ProductDAO.prototype, "getAvailableProductsByCategory").mockResolvedValueOnce([testProduct]);
            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                grouping,
                category,
                model
            )
            expect(ProductDAO.prototype.getAvailableProductsByCategory).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getAvailableProductsByCategory).toHaveBeenCalledWith(
                category
            );
            expect(response).toEqual([testProduct]);
        })
        test("It should reject to error when DAO rejects error and grouping category", async () => {
            const grouping = "category";
            const category = "Smartphone";
            const model = "iPhone13";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "getAvailableProductsByCategory").mockRejectedValueOnce(error);
            const controller = new ProductController();
            try {
                await controller.getAvailableProducts(
                    grouping,
                    category,
                    model
                )
            } catch (err) {
                expect(ProductDAO.prototype.getAvailableProductsByCategory).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.getAvailableProductsByCategory).toHaveBeenCalledWith(
                    category
                );
            }
        })
        test("It should getAllProducts when grouping is not model or category", async () => {
            const grouping = "not-valid";
            const testProduct = {
                model: "iPhone13",
                quantity: 10,
                sellingPrice: 550,
                category: Category.SMARTPHONE,
                arrivalDate: "2024-06-04",
                details: "details",
            }
            jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce([testProduct]);
            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                grouping,
                null,
                null
            )
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct]);
        })
    })
    describe("deleteAllProducts", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValueOnce(true);
            const controller = new ProductController();
            const response = await controller.deleteAllProducts();
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
            expect(response).resolves
        });
        test("It should reject to error when DAO rejects error", async () => {
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockRejectedValueOnce(error);
            const controller = new ProductController();
            try {
                await controller.deleteAllProducts();
            } catch (err) {
                expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
            }
        });
    })
    describe("deleteProduct", () => {
        test("It should resolve to true when DAO resolve to true", async () => {
            const model = "iPhone13";
            jest.spyOn(ProductDAO.prototype, "deleteProductByModel").mockResolvedValueOnce(true);
            const controller = new ProductController();
            const response = await controller.deleteProduct(model);
            expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledWith(model);
            expect(response).resolves
        });
        test("It should reject to error when DAO rejects error", async () => {
            const model = "iPhone13";
            const error = new Error();
            jest.spyOn(ProductDAO.prototype, "deleteProductByModel").mockRejectedValueOnce(error);
            const controller = new ProductController();
            try {
                await controller.deleteProduct(model);
            } catch (err) {
                expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledTimes(1);
                expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledWith(model);
            }
        });
    })
})

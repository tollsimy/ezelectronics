import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"
import ProductController from "../../src/controllers/productController"
import ProductDAO from "../../src/dao/productDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { mock } from "node:test"
import { User, Role } from "../../src/components/user"
import { Category, Product } from "../../src/components/product"

jest.mock("../../src/db/db.ts")

beforeAll(() => {
    jest.restoreAllMocks()
})

afterAll(() => {
    jest.restoreAllMocks()
})

const product: { 
    model: string, 
    sellingPrice: number, 
    category: Category, 
    arrivalDate: string, 
    details: string, 
    quantity: number , 
    stock: number 
} = {
    sellingPrice: 100,
    model: "iPhone 10",
    category: Category.SMARTPHONE,
    arrivalDate: "2024-03-03",
    details: "details",
    quantity: 100,
    stock: 100
};

const productWithoutStock: {
    model: string,
    sellingPrice: number,
    category: Category,
    arrivalDate: string,
    details: string,
    quantity: number,
} = {
    sellingPrice: 100,
    model: "iPhone 10",
    category: Category.SMARTPHONE,
    arrivalDate: "2024-03-03",
    details: "details",
    quantity: 100,
};

test("It should resolve to an array of products object if products retrieved by model", async () => {
    const productDAO = new ProductDAO()
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, product)
        return {} as Database
    })
    const result = await productDAO.getProductByModel(product.model)
    const expectedProduct = { ...productWithoutStock}
    expect(result).toEqual([expectedProduct])
});

test("It should resolve true if a product is created", async () => {
    const productDAO = new ProductDAO()
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await productDAO.createProduct(product.model, product.sellingPrice, product.category, product.arrivalDate, product.details, product.quantity)
    expect(result).resolves
})

test("It should resolve to new quantity if quantity added to a product", async () => {
    const productDAO = new ProductDAO()
    const updatedProduct = { ...product }
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, updatedProduct)
        return {} as Database
    });
    const result = await productDAO.addProductQuantity(product.model, 10, new Date().toISOString().split("T")[0])
    expect(result).toEqual(updatedProduct.stock)
})

test("It should resolve to new quantity if quantity removed from a product", async () => {
    const productDAO = new ProductDAO()
    const updatedProduct = { ...product, stock: 90}
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, product)
        return {} as Database
    });
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await productDAO.removeProductQuantity(product.model, 10)
    expect(result).toEqual(updatedProduct.stock)
})

test("It should resolve to an array of products object if products retrieved by category", async () => {
    const productDAO = new ProductDAO()
    const productsInDB = [
        productWithoutStock, 
        productWithoutStock
    ]; // Mocked array of products
    jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, productsInDB)
        return {} as Database
    });
    const result = await productDAO.getProductsByCategory(product.category)
    const expectedProducts = productsInDB.map(p => ({ ...p, quantity: undefined}));
    expect(result).toEqual(expectedProducts)
});

test("It should resolve to an array of all products", async () => {
    const productDAO = new ProductDAO()
    const productsInDB = [
        productWithoutStock, 
        productWithoutStock
    ]; // Mocked array of products
    jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, productsInDB)
        return {} as Database
    });
    const result = await productDAO.getAllProducts()
    const expectedProducts = productsInDB.map(p => ({ ...p, quantity: undefined}));
    expect(result).toEqual(expectedProducts)
});

test("It should resolve true if a product is deleted by model", async () => {
    const productDAO = new ProductDAO()
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, product)
        return {} as Database
    });
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await productDAO.deleteProductByModel(product.model)
    expect(result).toBe(true)
});

test("It should resolve true if all products are deleted", async () => {
    const productDAO = new ProductDAO()
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await productDAO.deleteAllProducts()
    expect(result).toBe(true)
});

test("It should resolve to an array of available products", async () => {
    const productDAO = new ProductDAO()
    const productsInDB = [
        productWithoutStock,
        productWithoutStock
    ];
    jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, productsInDB)
        return {} as Database
    });
    const result = await productDAO.getAvailableProducts()
    const expectedProducts = productsInDB.map(p => ({ ...p, quantity: undefined}));
    expect(result).toEqual(expectedProducts)
});

test("It should resolve to an array of available products by category", async () => {
    const productDAO = new ProductDAO()
    const productsInDB = [
        productWithoutStock,
        productWithoutStock
    ];
    jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, productsInDB)
        return {} as Database
    });
    const result = await productDAO.getAvailableProductsByCategory(product.category)
    const expectedProducts = productsInDB.map(p => ({ ...p, quantity: undefined}));
    expect(result).toEqual(expectedProducts)
});

test("It should resolve to an array of products if available product retrieved by model", async () => {
    const productDAO = new ProductDAO()
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, product)
        return {} as Database
    });
    const result = await productDAO.getAvailableProductByModel(product.model)
    const expectedProduct = { ...productWithoutStock}
    expect(result).toEqual([expectedProduct])
});

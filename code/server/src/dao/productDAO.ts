import db from "../db/db"
import { Product } from "../components/product"
import { ProductNotFoundError, ProductAlreadyExistsError, ProductSoldError, EmptyProductStockError, LowProductStockError } from "../errors/productError";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {

    /**
     * Get a product from the db by model
     *
     * @param {string} model
     * @returns {Promise<Product>}
     */
    getProductByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products WHERE model = ?"
                db.get(sql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    //If there is no product with this model
                    if (!row) {
                        reject(new ProductNotFoundError())
                        return
                    } else {
                        resolve([new Product(
                            row.sellingPrice,
                            row.model,
                            row.category,
                            row.arrivalDate,
                            row.details,
                            row.stock
                        )])
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    };

    createProduct(model: string, sellingPrice: number, category: string,
        arrivalDate: string | null, details: string | null,
        quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "INSERT INTO products ( \
                            model, \
                            sellingPrice, \
                            category, \
                            arrivalDate, \
                            details, \
                            stock) \
                            VALUES (?,?,?,?,?,?)"
                db.run(sql,
                    [
                        model,
                        sellingPrice,
                        category,
                        arrivalDate,
                        details,
                        quantity
                    ],
                    (err: Error | null) => {
                        if (err) {
                            reject(new ProductAlreadyExistsError)
                            return
                        }
                        else {
                            resolve()
                        }
                    })
            } catch (error) {
                reject(error)
            }
        })
    };

    addProductQuantity(model: string, quantity: number,changeDate:string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const sql = "UPDATE products SET \
                            stock = stock + ?, arrivalDate = ? \
                            WHERE model = ?";
                db.run(sql,
                    [
                        quantity,
                        changeDate,
                        model
                        
                    ],
                    (err: Error | null) => {
                        if (err) {
                            reject(new ProductNotFoundError)
                            return
                        }
                        else {
                            const getSql = "SELECT * FROM products \
                                            WHERE model = ?";
                            db.get(getSql, [model], (err: Error | null, row: any) => {
                                if (err) {
                                    reject(new ProductNotFoundError)
                                }
                                else {
                                    resolve(row.stock)
                                }
                            })
                        }
                    })
            } catch (error) {
                reject(error)
            }
        })
    }

    removeProductQuantity(model: string, quantity: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const sql= "SELECT * FROM products WHERE model = ?";
                db.get(sql, [model], (err: Error | null, row: any) => {
                    if (err || !row ) {
                        reject(new ProductNotFoundError())
                        return
                    }
                    if (row.stock == 0) {
                        reject(new EmptyProductStockError())
                        return
                    }
                    if (row.stock < quantity) {
                        reject(new LowProductStockError())
                        return
                    }
                    const sql = "UPDATE products SET \
                                stock = stock - ? \
                                WHERE model = ?";
                    db.run(sql,
                        [
                            quantity,
                            model
                        ],
                        (err: Error | null) => {
                            if (err) {
                                reject(new ProductNotFoundError)
                                return
                            }
                            else {
                                resolve(row.stock - quantity)
                            }
                        })
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    getProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products WHERE category = ?"
                db.all(sql, [category], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    let products: Product[] = [];
                    for (let row of rows) {
                        products.push(new Product(
                            row.sellingPrice,
                            row.model,
                            row.category,
                            row.arrivalDate,
                            row.details,
                            row.stock
                        ))
                    }
                    resolve(products)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    getAllProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products"
                db.all(sql, [], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    let products: Product[] = [];
                    for (let row of rows) {
                        products.push(new Product(
                            row.sellingPrice,
                            row.model,
                            row.category,
                            row.arrivalDate,
                            row.details,
                            row.stock
                        ))
                    }
                    resolve(products)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    deleteProductByModel(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const checkSql = "SELECT * FROM products WHERE model = ?";
            db.get(checkSql, [model], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new ProductNotFoundError());
                } else {
                    const deleteSql = "DELETE FROM products WHERE model = ?";
                    db.run(deleteSql, [model], (err: Error | null) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    });
                }
            });
        });
    }

    deleteAllProducts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM products";
                db.run(sql,
                    [], (err: Error | null) => {
                        if (err) {
                            reject(err)
                            return
                        }
                        else {
                            resolve(true)
                        }
                    })
            } catch (error) {
                reject(error)
            }
        })
    }

    getAvailableProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products WHERE stock > 0";
                db.all(sql, [], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    if (!rows || rows.length == 0) {
                        resolve([])
                        return
                    }
                    let products: Product[] = [];
                    for (let row of rows) {
                        products.push(new Product(
                            row.sellingPrice,
                            row.model,
                            row.category,
                            row.arrivalDate,
                            row.details,
                            row.stock
                        ))
                    }
                    resolve(products)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    getAvailableProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products WHERE category = ? AND stock > 0"
                db.all(sql, [category], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    let products: Product[] = [];
                    for (let row of rows) {
                        products.push(new Product(
                            row.sellingPrice,
                            row.model,
                            row.category,
                            row.arrivalDate,
                            row.details,
                            row.stock
                        ))
                    }
                    resolve(products)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    getAvailableProductByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products WHERE model = ? AND stock > 0"
                db.get(sql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    //If there is no product with this model
                    if (!row || row.stock == 0) {
                        reject(new ProductNotFoundError())
                        return
                    } else {
                        resolve([new Product(
                            row.sellingPrice,
                            row.model,
                            row.category,
                            row.arrivalDate,
                            row.details,
                            row.stock
                        )])
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    };
}

export default ProductDAO
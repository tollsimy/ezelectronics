import db from "../db/db"
import { User } from "../components/user"
import { Cart ,ProductInCart} from "../components/cart";
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";
import { ProductNotFoundError, ProductAlreadyExistsError, ProductSoldError, EmptyProductStockError, LowProductStockError } from "../errors/productError";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {

    /**
     * Return the current cart of a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     * @remarks The current cart is the one that has not been paid yet.
    */  
    getCart(user: User): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            const sql = "SELECT *  FROM carts C, productsInACart PC, products P WHERE C.customer = ? AND paid = 0 AND C.id = PC.cartId AND PC.model=P.model"
            try{
                db.get(sql, [user.username], (err: Error | null, rows: any[]) => {
                    if (err) {reject(err); return;}
                    if (!rows) {reject(new CartNotFoundError());return;}
                    if (rows.length === 0) {resolve(new Cart(user.username, false, null,0, [])); return;}
                    let products: ProductInCart[] = []
                    let total=0
                    const paymentDate = rows[0].paymentDate
                    rows.forEach((row) => {
                        const product = new ProductInCart(row.model, row.quantity, row.category,row.sellingPrice)
                        products.push(product)
                        total+=row.sellingPrice*row.quantity
                    })
                    const cart = new Cart(user.username, false, paymentDate,total, products)
                    resolve(cart)
                })
            }catch(error){
                reject(error)
            }
        })
    }
    /**
     * Add a product to the user current cart.
     * @param user - The user for whom to retrieve the cart.
     * @param product - The product model to add to the cart.
     * @returns A Promise that resolves true if the product was added, false otherwise.
     * @remarks the model must match to an existing product.
     * @remarks the user must have a current cart.
    */  
    addToCart(user: User, product: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            const sql = "SELECT *  FROM carts C WHERE C.customer = ? AND paid = 0"
            try{
                db.get(sql, [user.username], (err: Error | null, rows: any) => {
                    if (err) {reject(err); return;}
                    if (!rows) {
                        //scenario n1: the user has no cart
                        //create a new cart paid=0
                        //insert the product in the cart
                        const sql = "INSERT INTO carts (customer, paid) VALUES (?, 0)"
                        db.run(sql, [user.username], (err: Error) => {
                            if (err) {reject(err); return;}
                            const sql = "SELECT * FROM products WHERE model = ?"
                            db.get(sql, [product], (err: Error | null, row: any) => {
                                if (err) {reject(err); }
                                if (!row) {reject(new ProductNotFoundError()); return;}
                                if (row.quantity === 0) {reject(new EmptyProductStockError()); return;}
                                const sql = "INSERT INTO productsInACart (cartId, model, quantity) VALUES ((SELECT id FROM carts WHERE customer = ? AND paid = 0), ?, 1)"
                                db.run(sql, [user.username, product], (err: Error) => {
                                    if (err) {reject(err); }
                                    resolve(true)
                                    
                                })
                            })
                        })
                        
                    }
                    //scenario n2: the user has a cart
                    const sql = "SELECT * FROM products WHERE model = ?"
                    db.get(sql, [product], (err: Error | null, row: any) => {
                        if (err) {reject(err); return;}
                        if (!row) {reject(new ProductNotFoundError()); return;}
                        if (row.quantity === 0) {reject(new EmptyProductStockError()); return;}
                        //control if the product is already in the cart
                        const sql = "SELECT * FROM productsInACart WHERE cartId = ? AND model = ?"
                        db.get(sql, [rows[0].id, product], (err: Error | null, row: any) => {
                            if (err) {reject(err); return;}
                            if (row) {
                                //scenario n2.1: the product is already in the cart
                                const sql = "UPDATE productsInACart SET quantity = quantity + 1 WHERE cartId = ? AND model = ?"
                                db.run(sql, [rows[0].id, product], (err: Error) => {
                                    if (err) {reject(err); return;}
                                    resolve(true)
                                })
                            } else {
                                //scenario n2.2: the product is not in the cart
                                const sql = "INSERT INTO productsInACart (cartId, model, quantity) VALUES (?, ?, 1)"
                                db.run(sql, [rows[0].id, product], (err: Error) => {
                                    if (err) {reject(err); return;}
                                    resolve(true)
                                })
                            }
                        })
                    })
                })
            }catch(error){
                reject(error)
            }
        })
    }
    /**
     * Checkout the user current cart.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves true if the cart was checked out, false otherwise.
     * @remarks the user must have a current cart.
     * @remarks the cart must not be empty.
     * - It should return a 404 error if there is no information about an _unpaid_ cart in the database
        - It should return a 400 error if there is information about an _unpaid_ cart but the cart contains no product
        - It should return a 409 error if there is at least one product in the cart whose available quantity in the stock is 0
        - It should return a 409 error if there is at least one product in the cart whose quantity is higher than the available quantity in the stock
    */ 
    checkoutCart(user: User): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            const sql = "SELECT *  FROM carts C, productsInACart PC, products P WHERE C.customer = ? AND paid = 0 AND C.id = PC.cartId AND PC.model=P.model"
            try{
                db.all(sql, [user.username], (err: Error | null, rows: any[]) => {
                    if (err) {reject(err); return;}
                    if (!rows) {reject(new CartNotFoundError()); return;}
                    if (rows.length === 0) {reject(new EmptyCartError()); return;}
                    let product: ProductInCart
                    let total=0
                    rows.forEach((row) => {
                        if (row.quantity === 0) {reject(new EmptyProductStockError()); return;}
                        if (row.quantity > row.stock) {reject(new LowProductStockError()); return;}
                        total+=row.sellingPrice*row.quantity
                    })
                    //update product stock
                    rows.forEach((row) => {
                        const sql = "UPDATE products SET quantity = quantity - ? WHERE model = ?"
                        db.run(sql, [row.quantity, row.model], (err: Error) => {
                            if (err) {reject(err); return;}
                        })
                    })
                    const sql = "UPDATE carts SET paid = 1, paymentDate = ? WHERE customer = ? AND paid = 0"
                    //controll Date format
                    db.run(sql, [new Date().toISOString(), user.username], (err: Error) => {
                        if (err) {reject(err); return;}
                        resolve(true)
                    })
                })
            }catch(error){
                reject(error)
            }
        })
    }

    /** 
    * Returns the history of the cart of a specific user. i.e. all the carts that have been paid.
    * @param user - The user for whom to retrieve the cart history.
    * @returns A Promise that resolves to an array of carts belonging to the user.
    */

    
    getCustomerCarts(user: User): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const sql = "SELECT *  FROM carts C, productsInACart PC, products P WHERE C.customer = ? AND paid = 1 AND C.id = PC.cartId AND PC.model=P.model order by C.id"
            try{
                db.all(sql, [user.username], (err: Error | null, rows: any[]) => {
                    if (err) {console.log("eccomi1");reject(err); return;}
                    if (!rows) {console.log("eccomi2");reject(new CartNotFoundError())}
                    //repete for each cart-> retrive the products in the cart put them in a ProductInCart object and push it to the ProductInCart array -> fiannly create a cart object putting into the cart object the ProductInCart array
                    const carts: Cart[] = []
                    let cart: Cart
                    let products: ProductInCart[] = []
                    let product: ProductInCart
                    let previousCartId = -1
                    let total=0
                    rows.forEach((row) => {
                        if (previousCartId !== row.id) {
                            if (previousCartId !== -1) {
                                cart = new Cart(user.username, true, row.paymentDate,total, products)
                                carts.push(cart)
                                products = []
                                total=0
                            }
                            previousCartId = row.id
                        }
                        total+=row.sellingPrice*row.quantity
                        product = new ProductInCart(row.model, row.quantity, row.category,row.sellingPrice)
                        products.push(product)
                    })
                    resolve(carts)

                    
                })
            }catch(error){
                reject(error)
            }
        })

    }
}

export default CartDAO
import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { Category } from "../src/components/product"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }


const product = {
    model: "product",
    category: Category.LAPTOP,
    quantity: 10,
    sellingPrice: 1000,
    arrivalDate: "2020-12-12"
}

const product2={
    model: "product2",
    category: Category.SMARTPHONE,
    quantity: 10,
    sellingPrice: 1000,
    arrivalDate: "2020-12-12"

}
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let adminCookie: string
let managerCookie: string

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
//Is an implicit test because it checks if the return code is successful
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}

//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                if(!res|| !res.header["set-cookie"] )
                    reject()
                else
                    resolve(res.header["set-cookie"][0])
            })
    })
}

jest.setTimeout(500000);

beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(manager)
    await postUser(customer)
    adminCookie = await login(admin)
    managerCookie = await login(manager)
})

afterAll(async () => {
    await cleanup()
})

describe("Product routes integration tests", () => {
    describe("POST /products", () => {
        test("It should return a 200 success code and create a new product", async () => {
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(product)
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product.model)
                expect(p.category).toBe(product.category)
                expect(p.quantity).toBe(product.quantity)
                expect(p.sellingPrice).toBe(product.sellingPrice)
            })
        })

        test("It should return a 409 error code if the product already exists", async () => {
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(product)
                .expect(409)
        })

        test("It should return a 400 error code if the arrival date is after the current date", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowString = tomorrow.toISOString().split('T')[0];


            const productWithWrongDate = { ...product, arrivalDate: tomorrowString }
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(productWithWrongDate)
                .expect(400)
        })

        test("It should return a 401 error code if the user is not a manager", async () => {
            customerCookie = await login(customer)
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', customerCookie)
                .send(product)
                .expect(401)
        })

        test("it should return a 422 error code if at least one of the required fields is wrong", async () => {
            const productWithWrongModel = { ...product, model: "" }
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(productWithWrongModel)
                .expect(422)

            const productWithWrongCategory = { ...product, category: "wrong" }
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(productWithWrongCategory)
                .expect(422)

            const productWithWrongQuantity = { ...product, quantity: -1 }
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(productWithWrongQuantity)
                .expect(422)

            const productWithWrongSellingPrice = { ...product, sellingPrice: -1 }
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(productWithWrongSellingPrice)
                .expect(422)
            
            const productWithWrongArrivalDate1 = { ...product, arrivalDate: "12/12/2020" }
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(productWithWrongArrivalDate1)
                .expect(422)
            
            const productWithWrongArrivalDate2 = { ...product, arrivalDate: "2020-13-30" }
            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(productWithWrongArrivalDate1)
                .expect(422)
        })

    })

    /* ------------------------------------------------------------------------------------*/

    describe("PATCH /products/:model", () => {
        test("It should return a 200 success code and increase the quantity of a product", async () => {
            const newQuantity = 5
            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .send({ quantity:newQuantity, changeDate: "2020-12-13"})
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product.model)
                expect(p.category).toBe(product.category)
                expect(p.quantity).toBe(product.quantity+newQuantity)
                expect(p.sellingPrice).toBe(product.sellingPrice)
                expect(p.arrivalDate).toBe("2020-12-13")
            })
        })

        test("It should return a 400 error code if the change date is after the current date", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowString = tomorrow.toISOString().split('T')[0];

            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .send({ quantity: 5, changeDate: tomorrowString })
                .expect(400)
        })
        test("It should return a 400 error code if the change date is before the arrival date", async () => {
            const BefArrivaldate = new Date(product.arrivalDate);
            BefArrivaldate.setDate(BefArrivaldate.getDate() - 1);
            const BefArrivaldateS = BefArrivaldate.toISOString().split('T')[0];
            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .send({ quantity: 5, changeDate: BefArrivaldateS })
                .expect(400)
        })

        test("It should return a 401 error code if the user is not a manager", async () => {
            customerCookie = await login(customer)
            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', customerCookie)
                .send({ quantity: 5 })
                .expect(401)
        })

        test("It should return a 422 error code if at least one of the required fields is wrong", async () => {
            const productWithWrongNewQuantity = { quantity: -1 }
            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .send(productWithWrongNewQuantity)
                .expect(422)

            const productWithWrongChangeDate1 = { quantity: 5, changeDate: "12/12/2020" }
            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .send(productWithWrongChangeDate1)
                .expect(422)
            
            const productWithWrongChangeDate2 = { quantity: 5, changeDate: "2020-13-30" }
            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .send(productWithWrongChangeDate2)
                .expect(422)
        })
    })

    /* ------------------------------------------------------------------------------------*/
        
    describe("PATCH /products/:model/sell", () => {
        test("It should return a 200 success code and decrease the quantity of a product and the user is manager", async () => {
            const quantity = 5
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send({ quantity: quantity })
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product.model)
                expect(p.category).toBe(product.category)
                expect(p.quantity).toBe(product.quantity)
                expect(p.sellingPrice).toBe(product.sellingPrice)
            })
        })

        test("It should return a 200 success code and decrease the quantity of a product and the user is admin", async () => {
            const quantity = 5
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', adminCookie)
                .send({ quantity: quantity })
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products`)
                .set('Cookie', adminCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product.model)
                expect(p.category).toBe(product.category)
                expect(p.quantity).toBe(product.quantity - quantity)
                expect(p.sellingPrice).toBe(product.sellingPrice)
            })
        })

        test("It should return a 404 error code if the product does not exist", async () => {
            await request(app)
                .patch(`${routePath}/products/unknown/sell`)
                .set('Cookie', managerCookie)
                .send({ quantity: 5 })
                .expect(404)
        })

        test("It should return a 400 error code if the selling date is after the current date", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowString = tomorrow.toISOString().split('T')[0];

            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send({ quantity: 5, sellingDate: tomorrowString })
                .expect(400)
        })
        test("It should return a 400 error code if the selling date is before the arrival date", async () => {
            const BefArrivaldate = new Date(product.arrivalDate);
            BefArrivaldate.setDate(BefArrivaldate.getDate() - 1);
            const BefArrivaldateS = BefArrivaldate.toISOString().split('T')[0];
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send({ quantity: 5, sellingDate: BefArrivaldateS })
                .expect(400)
        })

        test("It should return a 409 error code if the quantity to sell is greater than the available quantity", async () => {
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send({ quantity: product.quantity + 1 })
                .expect(409)
        })

        test("It should return a 401 error code if the user is customer", async () => {
            customerCookie = await login(customer)
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', customerCookie)
                .send({ quantity: 5 })
                .expect(401)
        })

        test("It should return a 422 error if at least one of the required fields is wrong", async () => {
            const productWithWrongQuantity = { quantity: -1 }
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send(productWithWrongQuantity)
                .expect(422)

            const productWithWrongSellingDate1 = { quantity: 5, sellingDate: "12/12/2020" }
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send(productWithWrongSellingDate1)
                .expect(422)
            
            const productWithWrongSellingDate2 = { quantity: 5, sellingDate: "2020-13-30" }
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send(productWithWrongSellingDate2)
                .expect(422)
        })
    })


    /* ------------------------------------------------------------------------------------*/


    describe("GET /products", () => {

        test("It should return a 200 success code and an array of products with catgory=LAPTOP", async () => {
            // Restore original quantity
            const newQuantity = 5
            await request(app)
                .patch(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .send({ quantity:newQuantity, changeDate: "2020-12-13"})
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products?grouping=category&category=${product.category}`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product.model)
                expect(p.category).toBe(product.category)
                expect(p.quantity).toBe(product.quantity)
                expect(p.sellingPrice).toBe(product.sellingPrice)
            })
        })

        test("It should return a 200 success code and an array of products with catgory=SMARTPHONE", async () => {
            //add some products to make the test more interesting

            await request(app)
                .post(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .send(product2)
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products?grouping=category&category=${product2.category}`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product2.model)
                expect(p.category).toBe(product2.category)
                expect(p.quantity).toBe(product2.quantity)
                expect(p.sellingPrice).toBe(product2.sellingPrice)
            })
        })
        test("It should return a 200 success code and an array of products with model=product", async () => {
            const products=await request(app)
                .get(`${routePath}/products?grouping=model&model=${product.model}`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product.model)
                expect(p.category).toBe(product.category)
                expect(p.quantity).toBe(product.quantity)
                expect(p.sellingPrice).toBe(product.sellingPrice)
            })
        })

        test("It should return a 422 error code if the grouping parameter is null and any of category or model is not null", async () => {
            await request(app)
                .get(`${routePath}/products?category=${product.category}`)
                .set('Cookie', managerCookie)
                .expect(422)
            
            await request(app)
                .get(`${routePath}/products?model=${product.model}`)
                .set('Cookie', managerCookie)
                .expect(422)
        })

        test("It should return a 422 error code if the grouping is category and the category is null or model is not null", async () => {
            await request(app)
                .get(`${routePath}/products?grouping=category`)
                .set('Cookie', managerCookie)
                .expect(422)
            
            await request(app)
                .get(`${routePath}/products?grouping=category&model=${product.model}`)
                .set('Cookie', managerCookie)
                .expect(422)
        })

        test("It should return a 422 error code if the grouping is model and the model is null or category is not null", async () => {
            await request(app)
                .get(`${routePath}/products?grouping=model`)
                .set('Cookie', managerCookie)
                .expect(422)
            
            await request(app)
                .get(`${routePath}/products?grouping=model&category=${product.category}`)
                .set('Cookie', managerCookie)
                .expect(422)
        })

        test("It should return a 404 error code if the product does not exist", async () => {
            await request(app)
                .get(`${routePath}/products?grouping=model&model=unknown`)
                .set('Cookie', managerCookie)
                .expect(404)
        })

        test("It should return a 422 error code if the category is not valid", async () => {
            await request(app)
                .get(`${routePath}/products?grouping=category&category=unknown`)
                .set('Cookie', managerCookie)
                .expect(422)
        })



        test("It should return a 401 error code if the user is not logged in as Manager or Admin", async () => {
            customerCookie = await login(customer)
            await request(app)
                .get(`${routePath}/products`)
                .set('Cookie', customerCookie)
                .expect(401)
        })
    })

    /* ------------------------------------------------------------------------------------*/

    describe("GET /products/available", () => {
        test("It should return a 200 success code and an array of available products with catgory=LAPTOP", async () => {

            const products=await request(app)
                .get(`${routePath}/products/available?grouping=category&category=${product.category}`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product.model)
                expect(p.category).toBe(product.category)
                expect(p.quantity).toBe(product.quantity)
                expect(p.sellingPrice).toBe(product.sellingPrice)
            })
        })

        test("It should return a 200 success code and an array of available products with category=SMARTPHONE", async () => {
            const products=await request(app)
                .get(`${routePath}/products/available?grouping=category&category=${product2.category}`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product2.model)
                expect(p.category).toBe(product2.category)
                expect(p.quantity).toBe(product2.quantity)
                expect(p.sellingPrice).toBe(product2.sellingPrice)
            })
        })
        test("It should return a 200 success code and an array of available products with model=product", async () => {
            
            //make the product not avaible
            await request(app)
                .patch(`${routePath}/products/${product.model}/sell`)
                .set('Cookie', managerCookie)
                .send({ quantity: product.quantity })
                .expect(200)

            const products=await request(app)
                .get(`${routePath}/products/available?grouping=model&model=${product.model}`)
                .set('Cookie', managerCookie)
                .expect(404)
        })

        test("It should return a 422 error code if the grouping parameter is null and any of category or model is not null", async () => {
            await request(app)
                .get(`${routePath}/products/available?category=${product.category}`)
                .set('Cookie', managerCookie)
                .expect(422)
            
            await request(app)
                .get(`${routePath}/products/available?model=${product.model}`)
                .set('Cookie', managerCookie)
                .expect(422)
        })

        test("It should return a 422 error code if the grouping is category and the category is null or model is not null", async () => {
            await request(app)
                .get(`${routePath}/products/available?grouping=category`)
                .set('Cookie', managerCookie)
                .expect(422)
            
            await request(app)
                .get(`${routePath}/products/available?grouping=category&model=${product.model}`)
                .set('Cookie', managerCookie)
                .expect(422)
        })

        test("It should return a 422 error code if the grouping is model and the model is null or category is not null", async () => {
            await request(app)
                .get(`${routePath}/products/available?grouping=model`)
                .set('Cookie', managerCookie)
                .expect(422)
            
            await request(app)
                .get(`${routePath}/products/available?grouping=model&category=${product.category}`)
                .set('Cookie', managerCookie)
                .expect(422)
        })

        test("It should return a 404 error code if the product does not exist", async () => {
            await request(app)
                .get(`${routePath}/products/available?grouping=model&model=unknown`)
                .set('Cookie', managerCookie)
                .expect(404)
        })

        test("It should return a 422 error code if the category is not valid", async () => {
            await request(app)
                .get(`${routePath}/products/available?grouping=category&category=unknown`)
                .set('Cookie', managerCookie)
                .expect(422)
        })

    })

    /* ------------------------------------------------------------------------------------*/

    describe("DELETE /products/:model", () => {
        test("It should return a 200 success code and delete the product", async () => {
            await request(app)
                .delete(`${routePath}/products/${product.model}`)
                .set('Cookie', managerCookie)
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(1)
            products.body.forEach((p:any)=>{
                expect(p.model).toBe(product2.model)
                expect(p.category).toBe(product2.category)
                expect(p.quantity).toBe(product2.quantity)
                expect(p.sellingPrice).toBe(product2.sellingPrice)
            })
        })

        test("It should return a 404 error code if the product does not exist", async () => {
            await request(app)
                .delete(`${routePath}/products/unknown`)
                .set('Cookie', managerCookie)
                .expect(404)
        })

        test("It should return a 401 error code if the user is not a manager", async () => {
            customerCookie = await login(customer)
            await request(app)
                .delete(`${routePath}/products/${product2.model}`)
                .set('Cookie', customerCookie)
                .expect(401)
        })
    })

    /* ------------------------------------------------------------------------------------*/

    describe("DELETE /products", () => {
        test("It should return a 200 success code and delete all products", async () => {
            await request(app)
                .delete(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .expect(200)
            
            const products=await request(app)
                .get(`${routePath}/products`)
                .set('Cookie', managerCookie)
                .expect(200)
            expect(products.body.length).toBe(0)
        })

        test("It should return a 401 error code if the user is not logged in as Manager or Admin", async () => {
            customerCookie = await login(customer)
            await request(app)
                .delete(`${routePath}/products`)
                .set('Cookie', customerCookie)
                .expect(401)
        })
    })
})

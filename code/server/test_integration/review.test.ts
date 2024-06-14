import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { afterEach, beforeEach } from "node:test"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const customer2 = { username: "customer2", name: "customer2", surname: "customer2", password: "customer2", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }

//Default product information.
const myModel = { model: "iPhone 12", category: "Smartphone", quantity: 1, sellingPrice: 1 }

//Default review information.
const myReview = { model: myModel.model, user: customer.username, score : 5, date: "2024-05-02", comment: "comment" }

//Cookies for the users
let customerCookie: string
let customer2Cookie: string
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

const postProduct = async (productInfo: any, cookie: any) => {
    await request(app)
        .post(`${routePath}/products`)
        .set('Cookie', cookie)
        .send(productInfo)
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

beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(manager)
    await postUser(customer)
    await postUser(customer2)
    adminCookie = await login(admin)
    managerCookie = await login(manager)
    customerCookie = await login(customer)
    customer2Cookie = await login(customer2)
    await postProduct(myModel, managerCookie)
})

afterAll(async () => {
    await cleanup()
})

describe("Review routes integration tests", () => {
    describe("POST /review/:model", () => {
      test("It should return a 200 success code and create a new review with the current date as review date", async () => {
        await request(app)
            .post(`${routePath}/reviews/${myReview.model}`)
            .set('Cookie', customerCookie)
            .send(myReview)
            .expect(200)
        await request(app)
            .get(`${routePath}/reviews/${myReview.model}`)
            .set('Cookie', customerCookie)
            .expect(200)
            .then((res) => {
                const review = res.body[0]
                expect(review.user).toBe(myReview.user)
                expect(review.score).toBe(myReview.score)  
                expect(review.date).toBe(new Date().toISOString().split('T')[0])
                expect(review.comment).toBe(myReview.comment)
            })
      })  

      test("It should return a 404 error code if the model does not exist", async () => {
        await request(app)
            .post(`${routePath}/reviews/unknown`)
            .set('Cookie', customerCookie)
            .send(myReview)
            .expect(404)
        })

        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .send(myReview)
                .expect(401)
        })

        test("It should return a 401 error code if the user is manager", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', managerCookie)
                .send(myReview)
                .expect(401)
        })

        test("It should return a 401 error code if the user is admin", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', adminCookie)
                .send(myReview)
                .expect(401)
        })

        // at most one review per customer
        test("It should return a 409 error code if the user has already reviewed the product", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .send(myReview)
                .expect(409)
        })

        test("It should return a 422 if model is empty string", async () => {
            await request(app)
                .get(`${routePath}/reviews/`)
                .set('Cookie', customerCookie)
                .expect(422)
        })

        
    })
    
    describe("GET /reviews/:model", () => {
        test("It should return a 200 success code and get the model reviews", async () => {
            await request(app)
                .get(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .expect(200)
                .then((res) => {
                    const review = res.body[0]
                    expect(review.model).toBe(myReview.model)
                    expect(review.user).toBe(myReview.user)
                    expect(review.score).toBe(myReview.score)  
                    expect(review.date).toBe(new Date().toISOString().split('T')[0])
                    expect(review.comment).toBe(myReview.comment)
                    

                })
        })

        test("It should return a 401 if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/reviews/${myReview.model}`)
                .expect(401)
        })

        test("It should return a 422 if model is empty string", async () => {
            await request(app)
                .get(`${routePath}/reviews`)
                .set('Cookie', customerCookie)
                .expect(422)
        })
    })

    describe("DELETE /reviews/:model", () => {
        test("It should return a 200 success code and delete the review", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .expect(200)
            await request(app)
                .get(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .expect(200)
                .then((res) => {
                    expect(res.body.length).toBe(0)
                })
        })

        test("It should return a 401 if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}`)
                .expect(401)
        })

        test("It should return a 401 if the user is a manager", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', managerCookie)
                .expect(401)
        })

        test("It should return a 401 if the user is an admin", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', adminCookie)
                .expect(401)
        })

        test("It should return a 422 if model is empty string", async () => {
            await request(app)
                .delete(`${routePath}/reviews/`)
                .set('Cookie', customerCookie)
                .expect(422)
        })

        test("It should return a 404 if the model does not exist", async () => {
            await request(app)
                .delete(`${routePath}/reviews/unknown`)
                .set('Cookie', customerCookie)
                .expect(404)
        })

        test("It should return a 404 if the current user has not reviewed the product", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customer2Cookie)
                .expect(404)
        })
    })

    describe("DELETE /reviews/:model/all", () => {
        test("It should return a 200 success code and manager deletes all reviews of the product", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .send(myReview)
                .expect(200)
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}/all`)
                .set('Cookie', managerCookie)
                .expect(200)
        })

        test("It should return a 200 success code and admin deletes all reviews of the product", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .send(myReview)
                .expect(200)
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}/all`)
                .set('Cookie', adminCookie)
                .expect(200)
        })

        test("It should return a 401 if the user is not an admin or a manager", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}/all`)
                .set('Cookie', customerCookie)
                .expect(401)
        })

        test("It should return a 401 if the user is not logged in", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${myReview.model}/all`)
                .expect(401)
        })

        test("It should return a 404 if the model does not exist", async () => {
            await request(app)
                .delete(`${routePath}/reviews/unknown/all`)
                .set('Cookie', managerCookie)
                .expect(404)
        })
    })

    describe("DELETE /reviews", () => {
        test("It should return a 200 success code and manager deletes all reviews", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .send(myReview)
                .expect(200)
            await request(app)
                .delete(`${routePath}/reviews`)
                .set('Cookie', managerCookie)
                .expect(200)
        })  

        test("It should return a 200 success code and admin deletes all reviews", async () => {
            await request(app)
                .post(`${routePath}/reviews/${myReview.model}`)
                .set('Cookie', customerCookie)
                .send(myReview)
                .expect(200)
            await request(app)
                .delete(`${routePath}/reviews`)
                .set('Cookie', adminCookie)
                .expect(200)
        })

        test("It should return a 401 if the user is not an admin or a manager", async () => {
            await request(app)
                .delete(`${routePath}/reviews`)
                .set('Cookie', customerCookie)
                .expect(401)
        })
    })
})

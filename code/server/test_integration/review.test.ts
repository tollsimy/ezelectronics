import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }

//Default product information.
const myModel = { model: "model", category: "category", quantity: 1, sellingPrice: 1 }

//Default review information.
const myReview = { model: "AOOOO", user: "customer", score : 5, date: "2024-05-02", comment: "comment" }

//Cookies for the users
let customerCookie: string
let adminCookie: string
let managerCookie: string | undefined

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

beforeAll(async () => {
    //cleanup()
    await postUser(admin)
    await postUser(manager)
    await postUser(customer)
    adminCookie = await login(admin)
    managerCookie = await login(manager)
    customerCookie = await login(customer)
})

//After executing tests, we remove everything from our test database
afterAll(() => {
    cleanup()
})



describe("Review routes integration tests", () => {
    describe("POST /review/:model", () => {
      test("It should return a 200 success code and create a new review", async () => {
        console.log(myReview.model)
        const response = await request(app)
            .post(`${routePath}/reviews/${myReview.model}`)
            .set('Cookie', customerCookie)
            .send(myReview)
            //.expect(200)
        
        expect(response.body.model).toBe(myReview.model);

        const review = await request(app)
            .get(`${routePath}/reviews/${myReview.model}`)
            .set('Cookie', customerCookie)
            .expect(200)

        expect(review.body).toBeDefined()
        review.body.forEach((r: any) => {
            expect(r.model).toBe(myReview.model)
            expect(r.user).toBe(myReview.user)
            expect(r.score).toBe(myReview.score)  
            expect(r.date).toBe(myReview.date)
            expect(r.comment).toBe(myReview.comment)
        })
      })  

      test("It should return a 404 error code if the model does not exist", async () => {
        await request(app)
            .post(`${routePath}/reviews`)
            .send(myReview)
            .expect(404)
      })

      test("It should return a 409 error code if there is an existing review for the product made by the customer", async () => {
        await request(app)
            .post(`${routePath}/reviews`)
            .send(myReview)
            .expect(409)

        const review = await request(app)
            .get(`${routePath}/reviews/${myReview.model}`)
            .set('Cookie', customerCookie)
            .expect(200)
            
      })
    })
/*
    describe("GET /reviews/:model", () => {
        test("It should return a 200 success code and get the model reviews", async () => {
            await request(app)
                .post(`${routePath}/reviews`)
                .set('Cookie', customerCookie)
                .send(myModel)
                .expect(200)
                customer
            const reviews=await request(app)
                .get(`${routePath}/reviews/${myReview.model}`
                .expect(200)
            expect(review.body).toBeDefined()
            reviews.body.forEach((r: any) => {
                expect(r.model).toBe(myReview.model)
                expect(r.user).toBe(myReview.user)
                expect(r.score).toBe(myReview.score)  
                expect(r.date).toBe(myReview.date)
                expect(r.comment).toBe(myReview.comment)
            })
        })*/

})

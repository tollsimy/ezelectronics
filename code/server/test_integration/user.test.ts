import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import exp from "constants"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const admin2 = { username: "admin2", name: "admin2", surname: "admin2", password: "admin2", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }



//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let adminCookie: string
let admin2Cookie: string
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

beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(admin2)
    await postUser(manager)
    adminCookie = await login(admin)
    admin2Cookie = await login(admin2)
    managerCookie = await login(manager)
})

afterAll(async () => {
    await cleanup()
})

//Inner 'describe' blocks define tests for each route
describe("User routes integration tests", () => {
    describe("POST /users", () => {
        test("It should return a 200 success code and create a new user", async () => {
            await request(app)
                .post(`${routePath}/users`) 
                .send(customer) 
                .expect(200) 
            customerCookie = await login(customer) //We log in the user to get the cookie
            const users = await request(app) 
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie) 
                .expect(200)
            expect(users.body).toHaveLength(4) //Should contain 3 users, the Admin, the Admin2, the Manager and the Customer
            let cust = users.body.find((user: any) => user.username === customer.username) //We look for the user we created in the array of users
            expect(cust).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)
        })

        //Tests for error conditions can be added in separate 'test' blocks.
        //We can group together tests for the same condition, no need to create a test for each body parameter, for example
        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "", name: "test", surname: "test", password: "test", role: "Customer" }) //We send a request with an empty username. The express-validator checks will catch this and return a 422 error code
                .expect(422)
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "", surname: "test", password: "test", role: "Customer" })
                .expect(422) 
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "test", surname: "", password: "test", role: "Customer" })
                .expect(422)
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "test", surname: "test", password: "", role: "Customer" })
                .expect(422)
            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "test", surname: "test", password: "test", role: "Errror" })
                .expect(422)
        })

        test("It should return 409 if the username already exists in the db", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .send(customer) 
                .expect(409)
        })
    })

    describe("GET /users", () => {
        test("It should return an array of users", async () => {
            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)
            
            expect(users.body).toHaveLength(4)
            let cust = users.body.find((user: any) => user.username === customer.username)
            expect(cust).toBeDefined()
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)
            let adm = users.body.find((user: any) => user.username === admin.username)
            expect(adm).toBeDefined()
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
            expect(adm.role).toBe(admin.role)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            customerCookie = await login(customer)
            await request(app).get(`${routePath}/users`).set("Cookie", customerCookie).expect(401) 
            await request(app).get(`${routePath}/users`).expect(401) 
        })
    })

    describe("GET /users/roles/:role", () => {
        test("It should return an array of users with a specific role", async () => {
            const admins = await request(app).get(`${routePath}/users/roles/Admin`).set("Cookie", adminCookie).expect(200)
            expect(admins.body).toHaveLength(2) //In this case, we expect only one Admin user to be returned
            let adm = admins.body[0]
            expect(adm.username).toBe(admin.username)
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
        })

        test("It should fail if the role is not valid", async () => {
                
            await request(app)
            .get(`${routePath}/users/roles/Invalid`)
            .set("Cookie", adminCookie)
            .expect(422)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            customerCookie = await login(customer)
            await request(app).get(`${routePath}/users`).set("Cookie", customerCookie).expect(401) 
            await request(app).get(`${routePath}/users`).expect(401) 
        })
    })

    describe("GET /users/:username", () => {
        test("It should return a user with a specific username", async () => {
            const user = await request(app).get(`${routePath}/users/${customer.username}`).set("Cookie", adminCookie).expect(200)
            expect(user.body.username).toBe(customer.username)
            expect(user.body.name).toBe(customer.name)
            expect(user.body.surname).toBe(customer.surname)
            expect(user.body.role).toBe(customer.role)
        })

        test("It should return a 401 error code if the user is not an Admin and the usename of the logged in user is not the one requested", async () => {
            customerCookie = await login(customer)
            await request(app).get(`${routePath}/users/${admin.username}`).set("Cookie", customerCookie).expect(401) 
            await request(app).get(`${routePath}/users/${customer.username}`).expect(401) 
        })
        test("It should return a 404 error code if the user does not exist", async () => {
            await request(app).get(`${routePath}/users/Invalid`).set("Cookie", adminCookie).expect(404)
        })
    })

    describe("DELETE /users/:username", () => {
        test("It should return a 200 success code, a Admin is deleting a Customer", async () => {
            await request(app)
                .delete(`${routePath}/users/${customer.username}`)
                .set("Cookie", adminCookie).expect(200)

            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(users.body).toHaveLength(3) //We expect only the Admin and Manger to be returned
            expect(users.body.find((user: any) => user.username === customer.username)).toBeUndefined() //We expect the Customer to be deleted
            expect(users.body.find((user: any) => user.username === admin.username)).toBeDefined() //We expect the Admin to be returned
            expect(users.body.find((user: any) => user.username === manager.username)).toBeDefined() //We expect the Manager to be returned
            expect(users.body.find((user: any) => user.username === admin2.username)).toBeDefined() //We expect the Admin2 to be returned
        })

        test("It should return a 200 success code, a Customer is deleting himself", async () => {
            await postUser(customer)
            customerCookie = await login(customer)
            await request(app)
                .delete(`${routePath}/users/${customer.username}`)
                .set("Cookie", customerCookie).expect(200)

            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(users.body).toHaveLength(3) //We expect only the Admin and Manger to be returned
            expect(users.body.find((user: any) => user.username === customer.username)).toBeUndefined() //We expect the Customer to be deleted
            expect(users.body.find((user: any) => user.username === admin.username)).toBeDefined() //We expect the Admin to be returned
            expect(users.body.find((user: any) => user.username === manager.username)).toBeDefined() //We expect the Manager to be returned
            expect(users.body.find((user: any) => user.username === admin2.username)).toBeDefined() //We expect the Admin2 to be returned
        })

        test("It should return a 200 success code, a Manager is deleting himself", async () => {
            await request(app)
            .delete(`${routePath}/users/${manager.username}`)
            .set("Cookie", managerCookie).expect(200)

            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(users.body).toHaveLength(2) 
            expect(users.body.find((user: any) => user.username === manager.username)).toBeUndefined() //We expect the Manager to be deleted
            expect(users.body.find((user: any) => user.username === admin.username)).toBeDefined() //We expect the Admin to be returned
            expect(users.body.find((user: any) => user.username === customer.username)).toBeUndefined() //We expect the Customer to be deleted
            expect(users.body.find((user: any) => user.username === admin2.username)).toBeDefined() //We expect the Admin2 to be returned
        })

        test("It should return a 200 success code, a Admin is deleting himself", async () => {
            await request(app)
            .delete(`${routePath}/users/${admin.username}`)
            .set("Cookie", adminCookie).expect(200)
           
            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", admin2Cookie)
                .expect(200)

            expect(users.body).toHaveLength(1) //We expect only the Admin and Manger to be returned
            expect(users.body.find((user: any) => user.username === customer.username)).toBeUndefined() //We expect the Customer to be deleted
            expect(users.body.find((user: any) => user.username === admin.username)).toBeUndefined() //We expect the Admin to be returned
            expect(users.body.find((user: any) => user.username === manager.username)).toBeUndefined() //We expect the Manager to be returned
            expect(users.body.find((user: any) => user.username === admin2.username)).toBeDefined() //We expect the Admin2 to be returned

            await postUser(admin)
            adminCookie = await login(admin)
        })

        test("It should return a 404 error code if the user does not exist", async () => {
            await request(app).delete(`${routePath}/users/Invalid`).set("Cookie", adminCookie).expect(404)
        })

        test("It should return a 401 error code if the user is not an Admin and it is not itself", async () => {
            await postUser(customer)
            customerCookie = await login(customer)
            await request(app).delete(`${routePath}/users/${admin.username}`).set("Cookie", customerCookie).expect(401) 
        })

        test("It should return a 401 error code if the user is an Admin and try tu delete another admin user", async () => {
            await request(app).delete(`${routePath}/users/${admin2.username}`).set("Cookie", adminCookie).expect(401) 
        })  
    })

    describe("DELETE /users", () => {
        test("It should return a 200 success code and delete all non-admin users", async () => {
            await request(app)
                .delete(`${routePath}/users`)
                .set("Cookie", adminCookie).expect(200)

            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(users.body).toHaveLength(2) //We expect only the Admin users to be returned (admin1 and admin2)
            let adm = users.body.find((user: any) => user.username === admin.username)
            expect(adm).toBeDefined()
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
            expect(adm.role).toBe(admin.role)
            let adm2 = users.body.find((user: any) => user.username === admin2.username)
            expect(adm2).toBeDefined()
            expect(adm2.name).toBe(admin2.name)
            expect(adm2.surname).toBe(admin2.surname)
            expect(adm2.role).toBe(admin2.role)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            await postUser(customer)
            customerCookie = await login(customer)
            await request(app).delete(`${routePath}/users`).set("Cookie", customerCookie).expect(401) 
            await request(app).delete(`${routePath}/users`).expect(401) 
        })
    })

    describe("PATCH /users/:username", () => {
        test("It should return a 200 success code and update a user with a specific username", async () => {
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname",  address: "test", birthdate: "2000-01-01"})
                .expect(200)

            const user = await request(app)
                .get(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(user.body.username).toBe(admin.username)
            expect(user.body.name).toBe("newAdminName")
            expect(user.body.surname).toBe("newAdminSurname")
            expect(user.body.address).toBe("test")
            expect(user.body.birthdate).toBe("2000-01-01")
        })

        test("It should return a 404 error code if the user does not exist", async () => {
            await request(app)
                .patch(`${routePath}/users/Invalid`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname", address: "test", birthdate: "2000-01-01"})
                .expect(404)
        })
        test("It should return a 400 error code if the birthdate is after the current date", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowString = tomorrow.toISOString().split('T')[0];

             await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname", address: "test", birthdate: tomorrowString})
                .expect(400)
        })

        test("It should return a 401 error code if the user is not an Admin and the usename of the logged in user is not the one requested", async () => {
            customerCookie = await login(customer)
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", customerCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname", address: "test", birthdate: "2000-01-01" })
                .expect(401)
        })    

        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "", surname: "newAdminSurname", address: "test", birthdate: "2000-01-01"  })
                .expect(422)
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "", address: "test", birthdate: "2000-01-01"  })
                .expect(422)
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname", address: "", birthdate: "2000-01-01"  })
                .expect(422)
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname", address: "test", birthdate: ""  })
                .expect(422)
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname", address: "test", birthdate: "32/01/2000"  })
                .expect(422)
            await request(app)
                .patch(`${routePath}/users/${admin.username}`)
                .set("Cookie", adminCookie)
                .send({ name: "newAdminName", surname: "newAdminSurname", address: "test", birthdate: "2000-01-32"  })
                .expect(422)
        })
    })
})

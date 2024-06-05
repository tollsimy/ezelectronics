import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import UserController from "../../src/controllers/userController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import ErrorHandler from "../../src/helper"
import UserDAO from "../../src/dao/userDAO"
import { UserAlreadyExistsError } from "../../src/errors/userError"

jest.mock("../../src/dao/userDAO")

describe("Controller unit test", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    })

    describe("Create User", () => {
        //Example of a unit test for the createUser method of the UserController
        //The test checks if the method returns true when the DAO method returns true
        //The test also expects the DAO method to be called once with the correct parameters
        test("It should resolve to true when DAO resolve to true", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser)
            let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
            let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(true); //Check if the response is true
        });
        test("It should reject to err when DAO rejects UserAlreadyExistsError", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            const error = new UserAlreadyExistsError();
            jest.spyOn(UserDAO.prototype, "createUser").mockRejectedValueOnce(error); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the createUser method of the controller with the test user object
                await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
            } catch (err) {
                //Check if the createUser method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                    testUser.name,
                    testUser.surname,
                    testUser.password,
                    testUser.role);
                expect(err).toBeInstanceOf(UserAlreadyExistsError);
            }
        });
        test("It should reject to err when DAO reject to err", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            const error = new Error();
            jest.spyOn(UserDAO.prototype, "createUser").mockRejectedValueOnce(error); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the createUser method of the controller with the test user object
                await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
            } catch (err) {
                //Check if the createUser method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                    testUser.name,
                    testUser.surname,
                    testUser.password,
                    testUser.role);
                expect(err).toBeInstanceOf(Error);
            }
        });
    })

    describe("Get all the users", () => {
        //Example of a unit test for the getUsers method of the UserController
        //The test checks if the method returns the correct value when the DAO method returns the correct value
        //The test also expects the DAO method to be called once
        let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

        test("It should resolve to an array of users when DAO resolve to an array of users", async () => {
            const testUsers = [testAdmin, testCustomer]; //Define an array of test users
            jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce(testUsers); //Mock the getUsers method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the getUsers method of the controller
            const response = await controller.getUsers();

            //Check if the getUsers method of the DAO has been called once
            expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response).toEqual(testUsers); //Check if the response is equal to the test users array
        });
        test("It should reject to err when DAO reject to err", async () => {
            const error = new Error();
            jest.spyOn(UserDAO.prototype, "getUsers").mockRejectedValueOnce(error); //Mock the getUsers method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the getUsers method of the controller
                await controller.getUsers();
            } catch (err) {
                //Check if the getUsers method of the DAO has been called once
                expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
                expect(err).toBeInstanceOf(Error);
            }
        });
    })

    describe("Get users by role", () => {
        //Example of a unit test for the getUsersByRole method of the UserController
        //The test checks if the method returns the correct value when the DAO method returns the correct value
        //The test also expects the DAO method to be called once with the correct parameters
        let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

        test("It should resolve to an array of users when DAO resolve to an array of users", async () => {
            const testUsers = [testAdmin, testCustomer]; //Define an array of test users
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce(testUsers); //Mock the getUsersByRole method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the getUsersByRole method of the controller with the role "Admin"
            const response = await controller.getUsersByRole("Admin");

            //Check if the getUsersByRole method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Admin");
            expect(response).toEqual(testUsers); //Check if the response is equal to the test users array
        });
        test("It should reject to err when DAO reject to err", async () => {
            const error = new Error();
            jest.spyOn(UserDAO.prototype, "getUsersByRole").mockRejectedValueOnce(error); //Mock the getUsersByRole method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the getUsersByRole method of the controller with the role "Admin"
                await controller.getUsersByRole("Admin");
            } catch (err) {
                //Check if the getUsersByRole method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith("Admin");
                expect(err).toBeInstanceOf(Error);
            }
        });
    })

    describe("Get user by username", () => {
        //Example of a unit test for the getUserByUsername method of the UserController
        //The test checks if the method returns the correct value when the DAO method returns the correct value
        //The test also expects the DAO method to be called once with the correct parameters
        let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

        test("It should resolve to a user when DAO resolve to a user", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testAdmin); //Mock the getUserByUsername method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the getUserByUsername method of the controller with the test user object
            const response = await controller.getUserByUsername(testAdmin, testAdmin.username);

            //Check if the getUserByUsername method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testAdmin.username);
            expect(response).toEqual(testAdmin); //Check if the response is equal to the test user object
        });
        test("It should reject to err when DAO reject to err", async () => {
            const error = new Error();
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValueOnce(error); //Mock the getUserByUsername method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the getUserByUsername method of the controller with the test user object
                await controller.getUserByUsername(testAdmin, testAdmin.username);
            } catch (err) {
                //Check if the getUserByUsername method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testAdmin.username);
                expect(err).toBeInstanceOf(Error);
            }
        });
        test("It should reject to err when user is not authorized", async () => {
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the getUserByUsername method of the controller with the test user object
                await controller.getUserByUsername(testCustomer, testAdmin.username);
            } catch (err) {
                //Check if the getUserByUsername method of the DAO has not been called
                expect(UserDAO.prototype.getUserByUsername).not.toHaveBeenCalled();
                expect(err).toBeInstanceOf(Error);
            }
        });
    })

    describe("Delete user", () => { 
        //Example of a unit test for the deleteUser method of the UserController
        //The test checks if the method returns true when the DAO method returns true
        //The test also expects the DAO method to be called once with the correct parameters
        let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        let testAdmin2 = new User("admin2", "admin2", "admin2", Role.ADMIN, "", "")
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")
        let testUser = new User("test", "test", "test", Role.CUSTOMER, "", "")

        test("It should resolve to true when DAO resolve to true if a user is deleting its own account ", async () => {
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); //Mock the deleteUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the deleteUser method of the controller with the test user object
            const response = await controller.deleteUser(testUser, testUser.username);

            //Check if the deleteUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUser.username);
            expect(response).toBe(true); //Check if the response is true
        });
        test("It should resolve to true when DAO resolve to true if Admin is deleting a non-Admin account", async () => {
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); //Mock the deleteUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the deleteUser method of the controller with the test user object
            const response = await controller.deleteUser(testAdmin, testUser.username);

            //Check if the deleteUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUser.username);
            expect(response).toBe(true); //Check if the response is true
        });
        test("It should reject to err when Admin is deleting another Admin account", async () => {
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); //Mock the deleteUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the deleteUser method of the controller with the test user object
            try {
                await controller.deleteUser(testAdmin, testAdmin2.username);
            } catch (err) {
                //Check if the deleteUser method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testAdmin2.username);
                expect(err).toBeInstanceOf(Error);
            }
        });
        test("It should reject to err when non-Admin is deleting another user", async () => {
            const error = new Error();
            jest.spyOn(UserDAO.prototype, "deleteUser").mockRejectedValueOnce(error); //Mock the deleteUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the deleteUser method of the controller with the test user object
                await controller.deleteUser(testAdmin, testAdmin.username);
            } catch (err) {
                //Check if the deleteUser method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testAdmin.username);
                expect(err).toBeInstanceOf(Error);
            }
        });
    })

    describe("Delete all users", () => {
        //Example of a unit test for the deleteAll method of the UserController
        //The test checks if the method returns true when the DAO method returns true
        //The test also expects the DAO method to be called once
        let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

        test("It should resolve to true when DAO resolve to true", async () => {
            jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true); //Mock the deleteAll method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the deleteAll method of the controller
            const response = await controller.deleteAll();

            //Check if the deleteAll method of the DAO has been called once
            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledWith();
            expect(response).toBe(true); //Check if the response is true
        });
        test("It should reject to err when DAO reject to err", async () => {
            const error = new Error();
            jest.spyOn(UserDAO.prototype, "deleteAll").mockRejectedValueOnce(error); //Mock the deleteAll method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the deleteAll method of the controller
                await controller.deleteAll();
            } catch (err) {
                //Check if the deleteAll method of the DAO has been called once
                expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.deleteAll).toHaveBeenCalledWith();
                expect(err).toBeInstanceOf(Error);
            }
        });
    })

    describe("Update user info", () => {
        //Example of a unit test for the updateUserInfo method of the UserController
        //The test checks if the method returns the correct value when the DAO method returns the correct value
        //The test also expects the DAO method to be called once with the correct parameters
        let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

        test("It should resolve to a user when DAO resolve to a user", async () => {
            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValueOnce(testAdmin); //Mock the updateUserInfo method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the updateUserInfo method of the controller with the test user object
            const response = await controller.updateUserInfo(testAdmin, testAdmin.name, testAdmin.surname, testAdmin.address, testAdmin.birthdate, testAdmin.username);

            //Check if the updateUserInfo method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(testAdmin.name, testAdmin.surname, testAdmin.address, testAdmin.birthdate, testAdmin.username);
            expect(response).toEqual(testAdmin); //Check if the response is equal to the test user object
        });
        test("It should reject to err when DAO reject to err", async () => {
            const error = new Error();
            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockRejectedValueOnce(error); //Mock the updateUserInfo method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the updateUserInfo method of the controller with the test user object
                await controller.updateUserInfo(testAdmin, testAdmin.name, testAdmin.surname, testAdmin.address, testAdmin.birthdate, testAdmin.username);
            } catch (err) {
                //Check if the updateUserInfo method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
                expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(testAdmin.name, testAdmin.surname, testAdmin.address, testAdmin.birthdate, testAdmin.username);
                expect(err).toBeInstanceOf(Error);
            }
        });
    })
})

import { describe, test, expect, beforeAll, afterAll, beforeEach, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import { Role, User } from "../../src/components/user"
import UserDAO from "../../src/dao/userDAO"
import { UserAlreadyExistsError,UserNotFoundError} from "../../src/errors/userError"


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

        test("It should resolve to a user if Admin try to get a user", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testCustomer); //Mock the getUserByUsername method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the getUserByUsername method of the controller with the test user object
            const response = await controller.getUserByUsername(testAdmin, testCustomer.username);

            //Check if the getUserByUsername method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testCustomer.username);
            expect(response).toEqual(testCustomer); //Check if the response is equal to the test user object
        });
        test("It should resolve to a user if user try to get its own account", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testCustomer); //Mock the getUserByUsername method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the getUserByUsername method of the controller with the test user object
            const response = await controller.getUserByUsername(testCustomer, testCustomer.username);

            //Check if the getUserByUsername method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testCustomer.username);
            expect(response).toEqual(testCustomer); //Check if the response is equal to the test user object
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
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the getUserByUsername method of the DAO
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
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testAdmin2);
            const controller = new UserController(); //Create a new instance of the controller
            //Call the deleteUser method of the controller with the test user object
            try {
                await controller.deleteUser(testAdmin, testAdmin2.username);
            } catch (err) {
                expect(UserDAO.prototype.deleteUser).not.toHaveBeenCalled();
                expect(err).toBeInstanceOf(Error);
            }
        });
        test("It should reject to err when non-Admin is deleting another user", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the deleteUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            try {
                //Call the deleteUser method of the controller with the test user object
                await controller.deleteUser(testCustomer, testUser.username);
            } catch (err) {
                //Check if the deleteUser method of the DAO has been called once with the correct parameters
                expect(UserDAO.prototype.deleteUser).not.toHaveBeenCalled();
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
        let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        let testAdminNew = new User("admin", "adminNew", "adminNew", Role.ADMIN, "", "")
        let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")
        let testCustomerNew = new User("customer", "customerNew", "customerNew", Role.CUSTOMER, "", "")

        test("It should resolve to a user when DAO resolve to a user if a user is updating its own info ", async () => {
            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValueOnce(testAdminNew); 
            const controller = new UserController(); //Create a new instance of the controller
            //Call the updateUserInfo method of the controller with the test user object
            const response = await controller.updateUserInfo(testAdmin, testAdminNew.name, testAdminNew.surname, testAdminNew.address, testAdminNew.birthdate, testAdminNew.username);

            //Check if the updateUserInfo method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(testAdminNew.name, testAdminNew.surname, testAdminNew.address, testAdminNew.birthdate, testAdminNew.username);
            expect(response).toEqual(testAdminNew); //Check if the response is equal to the test user object
        }); 
        test("It should resolve to a user when DAO resolve to a user if Admin is updating another non-Admin info", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testCustomer); 
            jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValueOnce(testCustomerNew); 
            const controller = new UserController(); //Create a new instance of the controller
            //Call the updateUserInfo method of the controller with the test user object
            const response = await controller.updateUserInfo(testAdmin, testCustomerNew.name, testCustomerNew.surname, testCustomerNew.address, testCustomerNew.birthdate, testCustomerNew.username);

            //Check if the updateUserInfo method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(testCustomerNew.name, testCustomerNew.surname, testCustomerNew.address, testCustomerNew.birthdate, testCustomerNew.username);
            expect(response).toEqual(testCustomerNew); //Check if the response is equal to the test user object
        });
        test("It should reject to err when Admin is updating another Admin info", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testAdmin); 
            const controller = new UserController(); //Create a new instance of the controller
            //Call the updateUserInfo method of the controller with the test user object
            try {
                await controller.updateUserInfo(testAdmin, testAdminNew.name, testAdminNew.surname, testAdminNew.address, testAdminNew.birthdate, testAdminNew.username);
            } catch (err) {
                expect(UserDAO.prototype.updateUserInfo).not.toHaveBeenCalled();
                expect(err).toBeInstanceOf(Error);
            }
        });
        test("It should reject to err when Admin is updating a non-existing user info", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockRejectedValue(new UserNotFoundError()); 
            const controller = new UserController(); //Create a new instance of the controller
            //Call the updateUserInfo method of the controller with the test user object
            try {
                await controller.updateUserInfo(testAdmin, testAdminNew.name, testAdminNew.surname, testAdminNew.address, testAdminNew.birthdate, testAdminNew.username);
            } catch (err) {
                expect(UserDAO.prototype.updateUserInfo).not.toHaveBeenCalled();
                expect(err).toBeInstanceOf(Error);
            }
        });
        test("It should reject to err when non-Admin is updating another user info", async () => {
            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testAdmin); 
            const controller = new UserController(); //Create a new instance of the controller
            //Call the updateUserInfo method of the controller with the test user object
            try {
                await controller.updateUserInfo(testCustomer, testAdminNew.name, testAdminNew.surname, testAdminNew.address, testAdminNew.birthdate, testAdminNew.username);
            } catch (err) {
                expect(UserDAO.prototype.updateUserInfo).not.toHaveBeenCalled();
                expect(err).toBeInstanceOf(Error);
            }
        });
            
    })
})

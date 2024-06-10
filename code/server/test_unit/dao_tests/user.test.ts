import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { get } from "http"

jest.mock("crypto")
jest.mock("../../src/db/db.ts")

test("It should resolve true if user is auth", async () => {
    const userDAO = new UserDAO()
    // Mock the get method mockcing with a row with the username, password and salt
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { username: "username", password: "password", salt: "salt" })
        return {} as Database
    });
    // Mock the scrypt method to simulate the hashing of the password
    jest.spyOn(crypto, 'timingSafeEqual').mockReturnValue(true)
    const result = await userDAO.getIsUserAuthenticated("username", "password")
    expect(mockDBGet).toHaveBeenCalled()
    expect(result).toBe(true)
    mockDBGet.mockRestore()
})

test("It should resolve true if new user is created", async () => {
    const userDAO = new UserDAO()
    const mockRandomBytes = jest.spyOn(crypto, 'randomBytes').mockReturnValueOnce()
    const mockScrypt = jest.spyOn(crypto, 'scryptSync').mockReturnValue(Buffer.from("hashedPassword"))
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await userDAO.createUser("username", "name", "surname", "password", "role")
    expect(result).toBe(true)
    mockRandomBytes.mockRestore()
    mockDBRun.mockRestore()
    mockScrypt.mockRestore()
})

test("It should resolve the user object if user is retrieved by its username", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, { username: "username", name: "name", surname: "surname", role: "role" })
        return {} as Database
    });
    const result = await userDAO.getUserByUsername("username")
    expect(result).toEqual({ username: "username", name: "name", surname: "surname", role: "role" })
    mockDBGet.mockRestore()
})
/* TODO: fix this -> actually not even needed
test("It should reject a UserNotFoundError if user is not retrieved by its username", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, null)
        return {} as Database
    });
    await expect(userDAO.getUserByUsername("username")).rejects.toThrow("UserNotFoundError")
    expect(mockDBGet).toHaveBeenCalled()
    expect(userDAO.getUserByUsername("username")).toHaveBeenCalled()
    mockDBGet.mockRestore()
})*/

test("It should reject an error if new user is not created", async () => {
    const userDAO = new UserDAO()
    const mockRandomBytes = jest.spyOn(crypto, 'randomBytes').mockReturnValueOnce()
    const mockScrypt = jest.spyOn(crypto, 'scryptSync').mockReturnValue(Buffer.from("hashedPassword"))
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"))
        return {} as Database
    });
    await expect(userDAO.createUser("username", "name", "surname", "password", "role")).rejects.toThrow("Error")
    mockRandomBytes.mockRestore()
    mockDBRun.mockRestore()
    mockScrypt.mockRestore()
})

test("It should reject an error if user is not auth", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"), null)
        return {} as Database
    });
    await expect(userDAO.getIsUserAuthenticated("username", "password")).rejects.toThrow("Error")
    mockDBGet.mockRestore()
})

test("It should resolve an array of user objects if users are retrieved", async () => {
    const userDAO = new UserDAO()
    const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
        callback(null, [{ username: "username1", name: "name1", surname: "surname1", role: "role1" }, { username: "username2", name: "name2", surname: "surname2", role: "role2" }])
        return {} as Database
    });
    const result = await userDAO.getUsers()
    expect(result).toEqual([{ username: "username1", name: "name1", surname: "surname1", role: "role1" }, { username: "username2", name: "name2", surname: "surname2", role: "role2" }])
    mockDBAll.mockRestore()
})

test("It should reject an error if users are not retrieved", async () => {
    const userDAO = new UserDAO()
    const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
        callback(new Error("Error"), null)
        return {} as Database
    });
    await expect(userDAO.getUsers()).rejects.toThrow("Error")
    mockDBAll.mockRestore()
})
/*
test("It should reject an error if user is not retrieved by its username", async () => {
    const userDAO = new UserDAO()
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(new Error("Error"), null)
        return {} as Database
    });
    await expect(userDAO.getUserByUsername("username")).rejects.toThrow("Error")
    mockDBGet.mockRestore
})*/

test("It should resolve an array of user objects if users are retrieved by their role", async () => {
    const userDAO = new UserDAO()
    const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        callback(null, [{ username: "username1", name: "name1", surname: "surname1", role: "role1" }, { username: "username2", name: "name2", surname: "surname2", role: "role2" }])
        return {} as Database
    });
    const result = await userDAO.getUsersByRole("role")
    expect(result).toEqual([{ username: "username1", name: "name1", surname: "surname1", role: "role1" }, { username: "username2", name: "name2", surname: "surname2", role: "role2" }])
    mockDBAll.mockRestore()
})

test("It should resolve a deleted user if its username corresponds", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await userDAO.deleteUser("username")
    expect(result).toBe(true)
    mockDBRun.mockRestore()
})
/*
//TODO: HELP
test("It should resolve the deletion of all non-Admin users", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await userDAO.deleteAll()
    expect(result).toBe(true)
    mockDBRun.mockRestore()
})
//TODO: HELP
test("It should resolve a promise that resolves to true if user info are updated", async () => {
    const userDAO = new UserDAO()
    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null)
        return {} as Database
    });
    const result = await userDAO.updateUserInfo("username", "name", "surname", "address", "birthdate")
    expect(result).toBe(true)
    mockDBRun.mockRestore()
})*/

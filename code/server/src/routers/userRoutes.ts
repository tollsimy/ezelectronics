import express, { Router } from "express"
import Authenticator from "./auth"
import { body, param, check, validationResult} from "express-validator"
import { User } from "../components/user"
import ErrorHandler from "../helper"
import UserController from "../controllers/userController"
/**
 * Represents a class that defines the routes for handling users.
 */
class UserRoutes {
    private router: Router
    private authService: Authenticator
    private errorHandler: ErrorHandler
    private controller: UserController

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.controller = new UserController()
        this.initRoutes()
    }

    /**
     * Get the router instance.
     * @returns The router instance.
     */
    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the routes for the user router.
     * 
     * @remarks
     * This method sets up the HTTP routes for creating, retrieving, updating, and deleting user data.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for creating a user.
         * It does not require authentication.
         * It requires the following body parameters:
         * - username: string. It cannot be empty and it must be unique (an existing username cannot be used to create a new user)
         * - name: string. It cannot be empty.
         * - surname: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * - role: string (one of "Manager", "Customer", "Admin")
         * It returns a 200 status code.
         */
        this.router.post(
            "/",
            (req: any, res: any, next: any) => this.controller.createUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.role)
                .then((ret : boolean) => ret? res.status(200).end(): res.status(400).json({error: "User already exists"}))
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Route for retrieving all users.
         * It requires the user to be logged in and to be an admin.
         * It returns an array of users.
         */
        this.router.get(
            "/",
            (req: any, res: any, next: any) => this.authService.isLoggedIn(req, res, next),
            (req: any, res: any, next: any) => this.authService.isAdmin(req, res, next),
            (req: any, res: any, next: any) => {
                this.controller.getUsers()
                    .then((users: User[]) => res.status(200).json(users))
                    .catch((err) => next(err));
            }
        );

        /**
         * Route for retrieving all users of a specific role.
         * It requires the user to be logged in and to be an admin.
         * It expects the role of the users in the request parameters: the role must be one of ("Manager", "Customer", "Admin").
         * It returns an array of users.
         */
        this.router.get(
            "/roles/:role",
            (req: any, res: any, next: any) => this.authService.isLoggedIn(req, res, next),
            (req: any, res: any, next: any) => this.authService.isAdmin(req, res, next),
            (req: any, res: any, next: any) => { 
                this.controller.getUsersByRole(req.params.role)
                    .then((users: User[] ) => res.status(200).json(users))
                    .catch((err) => next(err))
            }
        )

        /**
         * Route for retrieving a user by its username.
         * It requires the user to be authenticated: users with an Admin role can retrieve data of any user, users with a different role can only retrieve their own data.
         * It expects the username of the user in the request parameters: the username must represent an existing user.
         * It returns the user.
         */
        this.router.get(
            "/:username",
            (req: any, res: any, next: any) => this.authService.isLoggedIn(req, res, next),
            (req: any, res: any, next: any) => this.controller.getUserByUsername(req.user, req.params.username)
                .then((user: User ) => res.status(200).json(user))
                .catch((err) => res.status(401).json({error: err.message, status: 401}))
        )

        /**
         * Route for deleting a user.
         * It requires the user to be authenticated: users with an Admin role can delete the data of any user (except other Admins), users with a different role can only delete their own data.
         * It expects the username of the user in the request parameters: the username must represent an existing user.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/:username",
            (req: any, res: any, next: any) => this.authService.isLoggedIn(req, res, next),
            (req: any, res: any, next: any) => this.controller.deleteUser(req.user, req.params.username)
                .then(() => res.status(200).end())
                .catch((err: any) => res.status(401).json({error: err.message, status: 401}))
        )

        /**
         * Route for deleting all users.
         * It requires the user to be logged in and to be an admin.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.authService.isAdmin(req, res, next),
            (req: any, res: any, next: any) => this.controller.deleteAll()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for updating the information of a user.
         * It requires the user to be authenticated.
         * It expects the username of the user to edit in the request parameters: if the user is not an Admin, the username must match the username of the logged in user. Admin users can edit other non-Admin users.
         * It requires the following body parameters:
         * - name: string. It cannot be empty.
         * - surname: string. It cannot be empty.
         * - address: string. It cannot be empty.
         * - birthdate: date. It cannot be empty, it must be a valid date in format YYYY-MM-DD, and it cannot be after the current date
         * It returns the updated user.
         */
        this.router.patch(
            "/:username",
            (req: any, res: any, next: any) => this.authService.isLoggedIn(req, res, next),
            body("surname").isString().isLength({ min: 1 }), // the request body must contain an attribute named "surname", the attribute must be a non-empty string
            body("name").isString().isLength({ min: 1 }), // the request body must contain an attribute named "name", the attribute must be a non-empty string
            body("address").isString().isLength({ min: 1 }), // the request body must contain an attribute named "address", the attribute must be a non-empty string
            check("birthdate")
                .isISO8601({ strict: true, strictSeparator: true })
                .withMessage("Invalid date format, must be YYYY-MM-DD")
                .custom((value) => {
                    if (new Date(value) > new Date()) {
                        throw new Error("Birthdate cannot be in the future");
                    }
                    return true;
                }), // the request body must contain an attribute named "birthdate", it must be a valid date in format YYYY-MM-DD, and it cannot be after the current date
                this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                this.controller.updateUserInfo(req.user, req.body.name, req.body.surname, req.body.address, req.body.birthdate, req.params.username)
                    .then((user: User) => res.status(200).json(user))
                    .catch((err: any) => next(err));
            }
        );
    }
}

/**
 * Represents a class that defines the authentication routes for the application.
 */
class AuthRoutes {
    private router: Router
    private errorHandler: ErrorHandler
    private authService: Authenticator

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.errorHandler = new ErrorHandler()
        this.router = express.Router();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the authentication routes.
     * 
     * @remarks
     * This method sets up the HTTP routes for login, logout, and retrieval of the logged in user.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for logging in a user.
         * It does not require authentication.
         * It expects the following parameters:
         * - username: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * It returns an error if the username represents a non-existing user or if the password is incorrect.
         * It returns the logged in user.
         */
        this.router.post(
            "/",
            (req, res, next) => this.authService.login(req, res, next)
                .then((user: User) => res.status(200).json(user))
                .catch((err: any) => { res.status(401).json(err) })
        )

        /**
         * Route for logging out the currently logged in user.
         * It expects the user to be logged in.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/current",
            (req, res, next) => this.authService.logout(req, res, next)
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for retrieving the currently logged in user.
         * It expects the user to be logged in.
         * It returns the logged in user.
         */
        this.router.get(
            "/current",
            (req: any, res: any) => res.status(200).json(req.user)
        )
    }
}

export { UserRoutes, AuthRoutes }
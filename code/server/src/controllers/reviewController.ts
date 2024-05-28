import { ProductReview } from "../components/review";
import { Role, User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";

class ReviewController {
    private dao: ReviewDAO

    constructor() {
        this.dao = new ReviewDAO
    }

    /**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    async addReview(model: string, score: number, comment: string, user: User): Promise<boolean> {
        const date = new Date().toISOString().split('T')[0];
        return this.dao.addReview(model, user.username, date, score, comment)
    }

    /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
    async getProductReviews(model: string): Promise<ProductReview[]> {
        return this.dao.getProductReviews(model)
    }

    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
    async deleteReview(model: string, user: string): Promise<Boolean> {
        const userProva = new User("lisa", "lisan", "lisac", Role.CUSTOMER, "Via mio 1", "2023-12-04")
        return this.dao.deleteReview(model, "lisa");
    }

    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
    async deleteReviewsOfProduct(model: string): Promise<Boolean> {
        return this.dao.deleteReviewsOfProduct(model);
    }

    /**
     * Deletes all reviews of all products
     * @returns A Promise that resolves to nothing
     */
    async deleteAllReviews(): Promise<Boolean> {
        const userProva = new User("lisa", "lisan", "lisac", Role.CUSTOMER, "Via mio 1", "2023/12/4")
        return this.dao.deleteAllReviews();
    }
}

export default ReviewController;
import db from '../db/db';
import { ProductReview } from '../components/review';
import { NoReviewProductError, ExistingReviewError } from '../errors/reviewError';
import { ProductNotFoundError } from '../errors/productError';
import { User } from '../components/user';

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
    async addReview(model: string, user: string, date: string, score: number, comment: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "INSERT INTO reviews (score, date, comment, cod_model, user) VALUES (\
                            ?,\
                            ?,\
                            ?,\
                            (SELECT model from products WHERE model=?),\
                            (SELECT username from users WHERE username=?))"
                db.run(sql, [score, date, comment, model, user], (err) => {
                    if (err) {
                        if (err.message.includes('NOT NULL')) {
                            reject(new ProductNotFoundError)
                        } else {
                            reject(new ExistingReviewError)
                        }
                        //TODO
                    } else {
                        resolve()
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    async getProductReviews(model: string): Promise<ProductReview[]> {
        return new Promise<ProductReview[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM products WHERE model = ?"
                db.get(sql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return
                    } else if (!row) {
                        reject(new ProductNotFoundError())
                        return
                    }
                    const sql = "SELECT * FROM reviews WHERE cod_model = ?"
                    db.all(sql, [model], (err: Error | null, rows: any) => {
                        if (err) {
                            reject(err);
                            return
                        } else {
                            let reviews: ProductReview[] = [];
                            for (let row of rows) {
                                reviews.push(new ProductReview(
                                    row.cod_model,
                                    row.user,
                                    row.score,
                                    row.date,
                                    row.comment
                                ))
                            }
                            resolve(reviews)
                        }
                    })
                })
                
            } catch (error) {
                reject(error)
            }

        })
    }

    async deleteReview(model: string, user: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const checkSql = "SELECT * FROM reviews WHERE cod_model = ? AND user = ?"
            db.get(checkSql, [model, user], (err: Error | null, row:any) => {
                
                if (err) {
                    reject(err)
                } else if (!row) {
                    reject(new NoReviewProductError())
                } else {
                    const deleteSql = "DELETE FROM reviews WHERE cod_model = ? AND user = ?"
                    db.run(deleteSql, [model, user], (err: Error | null) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve()
                        }
                    })
                }
            })
        })
    }

    async deleteReviewsOfProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const checkSql = "SELECT * FROM reviews WHERE cod_model = ?";
            db.get(checkSql, [model], (err: Error | null, row:any) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new NoReviewProductError());
                } else {
                    const deleteSql = "DELETE FROM reviews WHERE cod_model = ?";
                    db.run(deleteSql, [model], (err: Error | null) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    }

    async deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "DELETE FROM reviews";
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    else {
                        resolve()
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default ReviewDAO;
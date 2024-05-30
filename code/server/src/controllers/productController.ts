import { Product } from "../components/product";
import { DateError } from "../utilities";
import ProductDAO from "../dao/productDAO";

/**
 * Represents a controller for managing products.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class ProductController {
    private dao: ProductDAO

    constructor() {
        this.dao = new ProductDAO
    }

    async isAfterOrTodayDate(date: string, model: string): Promise<boolean> {
        const product = await this.dao.getProductByModel(model);
        if (product[0].arrivalDate) {
            if (date >= product[0].arrivalDate && date <= new Date().toISOString().split('T')[0]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Registers a new product concept (model, with quantity defining the number of units available) in the database.
     * @param model The unique model of the product.
     * @param category The category of the product.
     * @param quantity The number of units of the new product.
     * @param details The optional details of the product.
     * @param sellingPrice The price at which one unit of the product is sold.
     * @param arrivalDate The optional date in which the product arrived.
     * @returns A Promise that resolves to nothing.
     */
    async registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void> {
        if (!arrivalDate) {
            arrivalDate = new Date().toISOString().split('T')[0];
        } else if (arrivalDate > new Date().toISOString().split('T')[0]) {
            throw new DateError();
        }
        return this.dao.createProduct(model, sellingPrice, category, arrivalDate, details, quantity);
    }

    /**
     * Increases the available quantity of a product through the addition of new units.
     * @param model The model of the product to increase.
     * @param newQuantity The number of product units to add. This number must be added to the existing quantity, it is not a new total.
     * @param changeDate The optional date in which the change occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async changeProductQuantity(model: string, newQuantity: number, changeDate: string | null): Promise<number> {
        if (!changeDate) {
            changeDate = new Date().toISOString().split('T')[0];
        }
        else if (changeDate > new Date().toISOString().split('T')[0]) {
            throw new DateError();
        }
        else if (!await this.isAfterOrTodayDate(changeDate, model)) {
            throw new DateError();
        }
        return this.dao.addProductQuantity(model, newQuantity);
    }

    /**
     * Decreases the available quantity of a product through the sale of units.
     * @param model The model of the product to sell
     * @param quantity The number of product units that were sold.
     * @param sellingDate The optional date in which the sale occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async sellProduct(model: string, quantity: number, sellingDate: string | null): Promise<number> {
        if (!sellingDate) {
            sellingDate = new Date().toISOString().split('T')[0];
        }
        else if (sellingDate > new Date().toISOString().split('T')[0]) {
            throw new DateError();
        }
        else if (!await this.isAfterOrTodayDate(sellingDate, model)) {
            throw new DateError();
        }
        return this.dao.removeProductQuantity(model, quantity);
    }

    /**
     * Returns all products in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    async getProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]> {
        if (grouping === "category") {
            return this.dao.getProductsByCategory(category);
        }
        else if (grouping === "model") {
            return this.dao.getProductByModel(model);
        }
        else {
            return this.dao.getAllProducts();
        }
    }

    /**
     * Returns all available products (with a quantity above 0) in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    async getAvailableProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]> {
        if (grouping === "category") {
            return this.dao.getAvailableProductsByCategory(category);
        }
        else if (grouping === "model") {
            return this.dao.getAvailableProductByModel(model);
        }
        else {
            return this.dao.getAvailableProducts();
        }
    }

    /**
     * Deletes all products.
     * @returns A Promise that resolves to `true` if all products have been successfully deleted.
     */
    async deleteAllProducts(): Promise<Boolean> {
        return this.dao.deleteAllProducts();
    }


    /**
     * Deletes one product, identified by its model
     * @param model The model of the product to delete
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    async deleteProduct(model: string): Promise<Boolean> {
        return this.dao.deleteProductByModel(model);
    }

}

export default ProductController;
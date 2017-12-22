Array.prototype.SingleOrDefault = function<T> (this: T[], filter?: ((item: T) => boolean) | string): (T | null) {
    let that: T[] = this;

    if (filter != null) {
        let result: T[] = that.Where(filter);

        if (result.Count() === 1) {
            return result.Get(0);
        } else {
            if (result.Count() > 1) {
                throw new Error("Linq4JS: The array contains more than one element");
            } else {
                return null;
            }
        }
    } else {
        if (that.Count() === 1) {
            return that.Get(0);
        } else {
            if (that.Count() > 1) {
                throw new Error("Linq4JS: The array contains more than one element");
            } else {
                return null;
            }
        }
    }
};
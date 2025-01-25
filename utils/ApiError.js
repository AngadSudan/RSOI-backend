class ApiError {
    constructor(status, message, error = []) {
        this.status = status;
        this.message = message;
        this.error = error;
        this.success = status < 400;
        this.data = null;
    }
}
export { ApiError };

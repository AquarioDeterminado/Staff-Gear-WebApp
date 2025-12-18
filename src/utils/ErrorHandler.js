export default function ErrorHandler(error) {
    var message = 'An unexpected error occurred.';

    if (error?.response?.data) {
        if (error.response.data.errors) {
            const firstKey = Object.keys(error.response.data.errors)[0];
            message = error.response.data.errors[firstKey][0];
        } else if (error.response.data.message) {
            message = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
            message = error.response.data;
        }
    } else if (error?.message) {
        message = error.message;
    }

    return message;
}
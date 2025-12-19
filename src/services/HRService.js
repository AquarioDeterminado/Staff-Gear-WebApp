import api from '../utils/axiosClient';
import PaymentViewModel from '../models/viewModels/PaymentViewModel';
import MovementViewModel from '../models/viewModels/MovementViewModel.JS';

const PAYMENTS_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_PAYMENTS;
const MOVEMENTS_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_MOVEMENTS;

const HRService = {
    getAllPayments: async () => {
        const response = await api.get(PAYMENTS_PATH);
        if (!response || response.status !== 200) {
            throw new Error('Error searching for payments! Error code: ' + response?.status);
        } else {
            console.log('Payments retrieved successfully!');
        }

        var payments = [];
        for (let payment of response.data) {
            var newPayment = new PaymentViewModel({BusinessEntityID: payment.businessEntityID, FullName: payment.fullName, Rate: payment.rate, RateChangeDate: payment.rateChangeDate, PayFrequency: payment.payFrequency}); // Supondo que payment já esteja no formato desejado
            payments.push(newPayment);
        }

        return payments;
    },

    getAllMovements: async () => {
        const response = await api.get(MOVEMENTS_PATH);
        if (!response || response.status !== 200) {
            throw new Error('Error fetching transactions! Error code: ' + response?.status);
        } else {
            console.log('Transactions retrieved with success!');
        }

        var movements = [];
        for (let movement of response.data) {
            var newMovement = new MovementViewModel({BusinessEntityID: movement.businessEntityID, FullName: movement.fullName, DepartmentName: movement.departmentName, JobTitle: movement.jobTitle, StartDate: movement.startDate, EndDate: movement.endDate}); // Supondo que movement já esteja no formato desejado
            movements.push(newMovement);
        }
        
        return movements;
    },

    createPayment: async (payment) => {
        const response = await api.post(PAYMENTS_PATH, new PaymentViewModel({BusinessEntityID: payment.BusinessEntityID, FullName: payment.FullName, Rate: payment.Rate, RateChangeDate: payment.RateChangeDate, PayFrequency: payment.PayFrequency}));
        
        if (!response || (response.status !== 200 && response.status !== 201)) {
            throw new Error('Error creating the payment! Error code: ' + response?.status);
        } else {
            console.log('Payment created with success!');
        }
    },

    editPayment: async (payment) => {
                const response = await api.put(`${PAYMENTS_PATH}`, new PaymentViewModel({BusinessEntityID: payment.BusinessEntityID, FullName: payment.FullName, Rate: payment.Rate, RateChangeDate: payment.RateChangeDate, PayFrequency: payment.PayFrequency}));
        if (!response || response.status !== 200) {
            throw new Error('Error editing the payment! Error code: ' + response?.status);
        } else {
            console.log('Payment successfully edited!');
        }
    },

    deletePayment: async (payment) => {
        const response = await api.delete(`${PAYMENTS_PATH}/delete/${payment.BusinessEntityID}/${payment.RateChangeDate}`);
        if (!response || response.status !== 200) {
            throw new Error('Error deleting the payment! Error code: ' + response?.status);
        } else {
            console.log('Payment deleted with success!');
        }
    },

    createMovement: async (movement) => {
        const response = await api.post(MOVEMENTS_PATH, new MovementViewModel({BusinessEntityID: movement.BusinessEntityID, FullName: movement.FullName, DepartmentName: movement.DepartmentName, JobTitle: movement.JobTitle, StartDate: movement.StartDate, EndDate: movement.EndDate}));
        if (!response || (response.status !== 200 && response.status !== 201)) {
            throw new Error('Error creating transaction! Error code: ' + response?.status);
        } else {
            console.log('Transaction created with success!');
        }
    },

    editMovement: async (movement) => {
        const response = await api.put(`${MOVEMENTS_PATH}`, new MovementViewModel({BusinessEntityID: movement.BusinessEntityID, FullName: movement.FullName, DepartmentName: movement.DepartmentName, JobTitle: movement.JobTitle, StartDate: movement.StartDate, EndDate: movement.EndDate}));
        if (!response || response.status !== 200) {
            throw new Error('Error editing transaction! Error code: ' + response?.status);
        } else {
            console.log('Transaction edited with success!');
        }
    },

    deleteMovement: async (movement) => {
        console.log(movement);
        const response = await api.delete(`${MOVEMENTS_PATH}/delete/${movement.BusinessEntityID}/${movement.DepartmentName}/${movement.StartDate}/`);
        if (!response || response.status !== 200) {
            throw new Error('Error deleting transaction! Error code: ' + response?.status);
        } else {
            console.log('Transaction deleted with success!');
        }
    }
}

export default HRService;
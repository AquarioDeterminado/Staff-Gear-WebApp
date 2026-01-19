import api from '../utils/axiosClient';
import PaymentViewModel from '../models/viewModels/PaymentViewModel';
import MovementViewModel from '../models/viewModels/MovementViewModel.JS';
import { buildFiltersQuery } from "../utils/axiosClient.js";

const PAYMENTS_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_PAYMENTS;
const MOVEMENTS_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_MOVEMENTS;

const HRService = {
    getAllPayments: async (pageNumber, pageSize, filters, sort) => {
        const filtersQuery = buildFiltersQuery(filters);
        const sortingQuery = sort ? `Sort.SortBy=${sort.SortBy}&Sort.Direction=${sort.Direction}` : '';


        const response = await api.get(`${PAYMENTS_PATH}?${sortingQuery}&${filtersQuery}`, {
            params: {
                pageNumber,
                pageSize
            }
        });
        if (!response || response.status !== 200) {
            throw new Error('Error searching for payments! Error code: ' + response?.status);
        } else {
            console.log('Payments retrieved successfully!');
        }

        return response.data;
    },

    getAllMovements: async (pageNumber, pageSize, filters, sort) => {
        const filtersQuery = buildFiltersQuery(filters);
        const sortingQuery = sort ? `Sort.SortBy=${sort.SortBy}&Sort.Direction=${sort.Direction}` : '';

        const response = await api.get(`${MOVEMENTS_PATH}?${sortingQuery}&${filtersQuery}`, {
            params: {
                pageNumber,
                pageSize
            }
        });
        if (!response || response.status !== 200) {
            throw new Error('Error fetching transactions! Error code: ' + response?.status);
        } else {
            console.log('Transactions retrieved with success!');
        }
        
        return response.data;
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
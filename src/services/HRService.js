import api from '../utils/axiosClient';
import PaymentViewModel from '../models/viewModels/PaymentViewModel';
import MovementViewModel from '../models/viewModels/MovementViewModel.JS';

const PAYMENTS_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_PAYMENTS;
const MOVEMENTS_PATH = import.meta.env.VITE_API_URL + import.meta.env.VITE_API_MOVEMENTS;

const HRService = {
    getAllPayments: async () => {
        const response = await api.get(PAYMENTS_PATH);
        if (!response || response.status !== 200) {
            throw new Error('Erro ao buscar pagamentos! Error code: ' + response?.status);
        } else {
            console.log('Pagamentos buscados com sucesso!');
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
            throw new Error('Erro ao buscar movimentações! Error code: ' + response?.status);
        } else {
            console.log('Movimentações buscadas com sucesso!');
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
            throw new Error('Erro ao criar pagamento! Error code: ' + response?.status);
        } else {
            console.log('Pagamento criado com sucesso!');
        }
    },

    editPayment: async (payment) => {
                const response = await api.put(`${PAYMENTS_PATH}`, new PaymentViewModel({BusinessEntityID: payment.BusinessEntityID, FullName: payment.FullName, Rate: payment.Rate, RateChangeDate: payment.RateChangeDate, PayFrequency: payment.PayFrequency}));
        if (!response || response.status !== 200) {
            throw new Error('Erro ao editar pagamento! Error code: ' + response?.status);
        } else {
            console.log('Pagamento editado com sucesso!');
        }
    },

    deletePayment: async (payment) => {
        const response = await api.delete(`${PAYMENTS_PATH}/delete/${payment.BusinessEntityID}/${payment.RateChangeDate}`);
        if (!response || response.status !== 200) {
            throw new Error('Erro ao deletar pagamento! Error code: ' + response?.status);
        } else {
            console.log('Pagamento deletado com sucesso!');
        }
    },

    createMovement: async (movement) => {
        const response = await api.post(MOVEMENTS_PATH, new MovementViewModel({BusinessEntityID: movement.BusinessEntityID, FullName: movement.FullName, DepartmentName: movement.DepartmentName, JobTitle: movement.JobTitle, StartDate: movement.StartDate, EndDate: movement.EndDate}));
        if (!response || (response.status !== 200 && response.status !== 201)) {
            throw new Error('Erro ao criar movimentação! Error code: ' + response?.status);
        } else {
            console.log('Movimentação criada com sucesso!');
        }
    },

    editMovement: async (movement) => {
        const response = await api.put(`${MOVEMENTS_PATH}`, new MovementViewModel({BusinessEntityID: movement.BusinessEntityID, FullName: movement.FullName, DepartmentName: movement.DepartmentName, JobTitle: movement.JobTitle, StartDate: movement.StartDate, EndDate: movement.EndDate}));
        if (!response || response.status !== 200) {
            throw new Error('Erro ao editar movimentação! Error code: ' + response?.status);
        } else {
            console.log('Movimentação editada com sucesso!');
        }
    },

    deleteMovement: async (movement) => {
        console.log(movement);
        const response = await api.delete(`${MOVEMENTS_PATH}/delete/${movement.BusinessEntityID}/${movement.DepartmentName}/${movement.StartDate}/`);
        if (!response || response.status !== 200) {
            throw new Error('Erro ao deletar movimentação! Error code: ' + response?.status);
        } else {
            console.log('Movimentação deletada com sucesso!');
        }
    }
}

export default HRService;
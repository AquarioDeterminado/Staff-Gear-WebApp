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
            var newPayment = new PaymentViewModel({BusinessEntityID: payment.businessEntityID, Name: payment.fullName, Amount: payment.rate, Date: payment.payedDate});
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
    }
}

export default HRService;
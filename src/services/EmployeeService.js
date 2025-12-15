import api from '../utils/axiosClient';
import EmployeeViewModel from '../models/viewModels/EmployeeViewModel.js';
import PaymentViewModel from '../models/viewModels/PaymentViewModel.js';
import MovementViewModel from '../models/viewModels/MovementViewModel.js';

const EMPLOYEE_PATH = import.meta.env.VITE_API_EMPLOYEE;

const EmployeeService = {

    createEmployee: async (employeeData) => {
        var response = await api.post(EMPLOYEE_PATH, new EmployeeViewModel(employeeData));

        if (!response || response.status !== 201) {
            throw new Error('Erro ao criar funcionário! Error code: ' + response?.status);
        } else {
            console.log('Funcionário criado com sucesso!');
        }
    },

    getAllEmployees: async () => {
        var response = await api.get(EMPLOYEE_PATH);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao obter funcionários! Error code: ' + response?.status);
        } else {
            console.log('Funcionários obtidos com sucesso!');
        }

        var employees = response.data.map(empData => new EmployeeViewModel(empData));
        return employees;
    },

    getEmployee: async (id) => {
        var response = await api.get(`${EMPLOYEE_PATH}/${id}`);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao obter funcionário! Error code: ' + response?.status);
        } else {
            console.log('Funcionário obtido com sucesso!');
        }

        var employee = new EmployeeViewModel(response.data);
        return employee;
    },

    updateEmployee:  async (id, payload) => { 
        var response = await api.put(`${EMPLOYEE_PATH}/${id}`, payload);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao atualizar funcionário! Error code: ' + response?.status);
        } else {
            console.log('Funcionário atualizado com sucesso!');
        }
    },

    alterEmployeePassword: async (id, payload) => {
        var response = await api.post(`${EMPLOYEE_PATH}/alterpassword/${id}`, payload);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao alterar senha do funcionário! Error code: ' + response?.status);
        } else {
            console.log('Senha do funcionário alterada com sucesso!');
        }
    },

    getEmployeePayments: async (id) => {
        var response = await api.get(`${EMPLOYEE_PATH}/Payments/${id}`);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao obter pagamentos do funcionário! Error code: ' + response?.status);
        } else {
            console.log('Pagamentos do funcionário obtidos com sucesso!');
        }

        var payments = response.data.map(paymentData => ( new PaymentViewModel(paymentData) ));
        return payments;
    },

    getEmployeeMovements: async (id) => {
        var response = await api.get(`${EMPLOYEE_PATH}/Movements/${id}`);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao obter movimentos do funcionário! Error code: ' + response?.status);
        } else {
            console.log('Movimentos do funcionário obtidos com sucesso!');
        }

        var movements = response.data.map(movementData => ( new MovementViewModel(movementData) ));
        return movements;
    },

    deleteEmployee: async (id) => {
        var response = await api.delete(`${EMPLOYEE_PATH}/${id}`);

        if (!response || response.status !== 200) {
            throw new Error('Erro ao deletar funcionário! Error code: ' + response?.status);
        } else {
            console.log('Funcionário deletado com sucesso!');
        }
    },
}

export default EmployeeService;

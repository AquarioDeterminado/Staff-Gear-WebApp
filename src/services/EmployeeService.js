import api from '../utils/axiosClient';
import EmployeeViewModel from '../models/viewModels/EmployeeViewModel.js';
import PaymentViewModel from '../models/viewModels/PaymentViewModel.js';
import MovementViewModel from '../models/viewModels/MovementViewModel.js';

const EMPLOYEE_PATH = import.meta.env.VITE_API_EMPLOYEE;

const EmployeeService = {

  createEmployee: async (employeeData) => {
    const response = await api.post(
      EMPLOYEE_PATH,
      new EmployeeViewModel({
        FirstName: employeeData.firstName,
        MiddleName: employeeData.middleName,
        LastName: employeeData.lastName,
        JobTitle: employeeData.jobTitle,
        Department: employeeData.department,
        Email: employeeData.email,
        PassWord: employeeData.password,
        HireDate: employeeData.hireDate,
        Role: employeeData.role
      })
    );

    if (!response || response.status !== 201) {
      throw new Error('Erro ao criar funcionário! Error code: ' + response?.status);
    } else {
      console.log('Funcionário criado com sucesso!');
    }
  },

  getAllEmployees: async () => {
    const response = await api.get(EMPLOYEE_PATH);

    if (!response || (response.status !== 200 && response.status !== 201)) {
      throw new Error('Erro ao obter funcionários! Error code: ' + response?.status);
    } else {
      console.log('Funcionários obtidos com sucesso!');
    }

    const employees = response.data.map(
      (empData) =>
        new EmployeeViewModel({
          BusinessEntityID: empData.businessEntityID,
          FirstName: empData.firstName,
          MiddleName: empData.middleName,
          LastName: empData.lastName,
          JobTitle: empData.jobTitle,
          Department: empData.department,
          Email: empData.email,
          HireDate: empData.hireDate,
          Role: empData.role
        })
    );
    return employees;
  },

  getEmployee: async (id) => {
    const response = await api.get(`${EMPLOYEE_PATH}/${id}`);

    if (!response || response.status !== 200) {
      throw new Error('Erro ao obter funcionário! Error code: ' + response?.status);
    } else {
      console.log('Funcionário obtido com sucesso!');
    }

    const data = response.data;
    const employee = new EmployeeViewModel({
      BusinessEntityID: data.businessEntityID,
      FirstName: data.firstName,
      MiddleName: data.middleName,
      LastName: data.lastName,
      JobTitle: data.jobTitle,
      Department: data.department,
      Email: data.email,
      Role: data.role
    });
    return employee;
  },

  updateEmployee: async (id, payload) => {
    const response = await api.put(`${EMPLOYEE_PATH}/${id}`, new EmployeeViewModel(payload));

    if (!response || response.status !== 200) {
      throw new Error('Erro ao atualizar funcionário! Error code: ' + response?.status);
    } else {
      console.log('Funcionário atualizado com sucesso!');
    }
  },

  alterEmployeePassword: async (id, payload) => {
    const response = await api.post(`${EMPLOYEE_PATH}/alterpassword/${id}`, payload);

    if (!response || response.status !== 200) {
      throw new Error('Erro ao alterar senha do funcionário! Error code: ' + response?.status);
    } else {
      console.log('Senha do funcionário alterada com sucesso!');
    }
  },

  getEmployeePayments: async (id) => {
    const response = await api.get(`${EMPLOYEE_PATH}/Payments/${id}`);

    if (!response || response.status !== 200) {
      throw new Error('Erro ao obter pagamentos do funcionário! Error code: ' + response?.status);
    } else {
      console.log('Pagamentos do funcionário obtidos com sucesso!');
    }

    const payments = response.data.map(
      (paymentData) =>
        new PaymentViewModel({
          BusinessEntityID: paymentData.businessEntityID,
          Name: paymentData.fullName,
          Amount: paymentData.rate,
          Date: paymentData.payedDate
        })
    );
    return payments;
  },

  getEmployeeMovements: async (id) => {
    const response = await api.get(`${EMPLOYEE_PATH}/Movements/${id}`);

    if (!response || response.status !== 200) {
      throw new Error('Erro ao obter movimentos do funcionário! Error code: ' + response?.status);
    } else {
      console.log('Movimentos do funcionário obtidos com sucesso!');
    }

    const movements = response.data.map(
      (movementData) =>
        new MovementViewModel({
          BusinessEntityID: movementData.businessEntityID,
          FullName: movementData.fullName,
          JobTitle: movementData.jobTitle,
          DepartmentName: movementData.departmentName,
          StartDate: movementData.startDate,
          EndDate: movementData.endDate
        })
    );
    return movements;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`${EMPLOYEE_PATH}/${id}`);

    if (!response || response.status !== 200) {
      throw new Error('Erro ao deletar funcionário! Error code: ' + response?.status);
    } else {
      console.log('Funcionário deletado com sucesso!');
       }
  }
};

export default EmployeeService;

import api from '../utils/axiosClient';
import EmployeeViewModel from '../models/viewModels/EmployeeViewModel.js';
import PaymentViewModel from '../models/viewModels/PaymentViewModel.js';
import MovementViewModel from '../models/viewModels/MovementViewModel.js';
import { buildFiltersQuery } from "../utils/axiosClient.js";

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

    if (!response || (response.status !== 201 && response.status !== 200)) {
      throw new Error('Error creating employee! Error code: ' + response?.status);
    } else {
      console.log('Employee created with success!');
    }
  },

  getAllEmployees: async (pageNumber, pageSize, filters, sort) => {
    const filtersQuery = buildFiltersQuery(filters);
    const sortingQuery = sort ? `Sort.SortBy=${sort.SortBy}&Sort.Direction=${sort.Direction}` : '';

    const response = await api.get(`${EMPLOYEE_PATH}?${sortingQuery}&${filtersQuery}`, {
      params: {
        pageNumber,
        pageSize
      }
    });

    if (!response || (response.status !== 200 && response.status !== 201)) {
      throw new Error('Error retrieving the employee! Error code: ' + response?.status);
    } else {
      console.log('Employees retrieved successfully!');
    }
    return response.data;
  },

  getEmployee: async (id) => {
    const response = await api.get(`${EMPLOYEE_PATH}/${id}`);

    if (!response || response.status !== 200) {
      throw new Error('Error retrieving the employee! Error code: ' + response?.status);
    } else {
      console.log('Employee retrieved with success!');
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
      Role: data.role,
      ProfilePhoto: data.profilePhoto
    });
    return employee;
  },

  updateEmployee: async (id, payload) => {
    const response = await api.put(`${EMPLOYEE_PATH}/${id}`, new EmployeeViewModel(payload));

    if (!response || response.status !== 200) {
      throw new Error('Error updating the employee! Error code: ' + response?.status);
    } else {
      console.log('Employee updated with success!');
    }
  },

  alterEmployeePassword: async (id, payload) => {
    const response = await api.post(`${EMPLOYEE_PATH}/alterpassword/${id}`, payload);

    if (!response || response.status !== 200) {
      throw new Error('Error while changing the employees password! Error code: ' + response?.status);
    } else {
      console.log('Employees password changed sucessfully!');
    }
  },

  getEmployeePayments: async (id) => {
    const response = await api.get(`${EMPLOYEE_PATH}/Payments/${id}`);

    if (!response || (response.status !== 200 && response.status !== 204)) {
      throw new Error('Error while retrieving the employee payments! Error code: ' + response?.status);
    } else {
      console.log('Employee payments retrieved with success!');
    }

    var data = response.data.length ? response.data : [];

    const payments = data.map(
      (paymentData) =>
        new PaymentViewModel({
          BusinessEntityID: paymentData.businessEntityID,
          Name: paymentData.fullName,
          Rate: paymentData.rate,
          PayFrequency: paymentData.payFrequency,
          RateChangeDate: paymentData.rateChangeDate
        })
    );
    return payments;
  },

  getEmployeeMovements: async (id) => {
    const response = await api.get(`${EMPLOYEE_PATH}/Movements/${id}`);

    if (!response || (response.status !== 200 && response.status !== 204)) {
      throw new Error('Error retrieving employee movements! Error code: ' + response?.status);
    } else {
      console.log('Employee movements retrieved with success!');
    }

    var data = response.data.length ? response.data : [];

    const movements = data.map(
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
      throw new Error('Error deleting the employee! Error code: ' + response?.status);
    } else {
      console.log('Employee deleted with success!');
       }
  },

  getAllDepartments: async () => {
    const response = await api.get(`${EMPLOYEE_PATH}/Departments`);
    if (!response || (response.status !== 200 && response.status !== 201)) {
      throw new Error('Error retrieving departments! Error code: ' + response?.status);
    } else {
      console.log('Departments retrieved successfully!');
    }
    return response.data;
  },

  undoDeleteEmployee: async (id) => {
    const response = await api.post(`${EMPLOYEE_PATH}/undodelete/${id}`);
    if (!response || response.status !== 200) {
      throw new Error('Error undoing delete for the employee! Error code: ' + response?.status);
    } else {
      console.log('Employee delete undone with success!');
    }
  },

  uploadProfilePhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`${EMPLOYEE_PATH}/${id}/profile-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!response || response.status !== 200) {
      throw new Error('Error uploading profile photo! Error code: ' + response?.status);
    } else {
      console.log('Profile photo uploaded with success!');
    }


    return response.data;
  }
};

export default EmployeeService;


import api from '../utils/axiosClient';
import JobListingDTO from '../models/dtos/JobListingDTO.js';

const JOBLISTING_PATH = import.meta.env.VITE_API_JOBLISTING || '/api/v1/joblisting';

const JobListingService = {
  getAll: async () => {
    try {
      const response = await api.get(`${JOBLISTING_PATH}`);

      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error('Error retrieving job listings! Error code: ' + response?.status);
      }

      console.log('Job listings retrieved successfully!');

      const jobListings = response.data.map(
        (jobData) =>
          new JobListingDTO({
            jobListingID: jobData.jobListingID,
            jobTitle: jobData.jobTitle,
            location: jobData.location,
            jobType: jobData.jobType,
            description: jobData.description,
            numberOfPositions: jobData.numberOfPositions,
            departmentID: jobData.departmentID,
            status: jobData.status,
            postedDate: jobData.postedDate,
            modifiedDate: jobData.modifiedDate,
            department: jobData.department,
            departmentName: jobData.departmentName,
            applicationCount: jobData.applicationCount
          })
      );

      return jobListings;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      throw error;
    }
  },

  getOpen: async () => {
    try {
      const response = await api.get(`${JOBLISTING_PATH}/open`);

      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error('Error retrieving job listings! Error code: ' + response?.status);
      }

      console.log('Job listings retrieved successfully!');

      const jobListings = response.data.map(
        (jobData) =>
          new JobListingDTO({
            jobListingID: jobData.jobListingID,
            jobTitle: jobData.jobTitle,
            location: jobData.location,
            jobType: jobData.jobType,
            description: jobData.description,
            numberOfPositions: jobData.numberOfPositions,
            departmentID: jobData.departmentID,
            status: jobData.status,
            postedDate: jobData.postedDate,
            modifiedDate: jobData.modifiedDate,
            department: jobData.department
          })
      );

      return jobListings;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${JOBLISTING_PATH}/${id}`);

      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error('Error retrieving job listing! Error code: ' + response?.status);
      }

      console.log('Job listing retrieved successfully!');

      const jobData = response.data;
      return new JobListingDTO({
        jobListingID: jobData.jobListingID,
        jobTitle: jobData.jobTitle,
        location: jobData.location,
        jobType: jobData.jobType,
        description: jobData.description,
        numberOfPositions: jobData.numberOfPositions,
        departmentID: jobData.departmentID,
        status: jobData.status,
        postedDate: jobData.postedDate,
        modifiedDate: jobData.modifiedDate,
        department: jobData.department
      });
    } catch (error) {
      console.error('Error fetching job listing:', error);
      throw error;
    }
  },

  create: async (jobListingData) => {
    try {
      const response = await api.post(`${JOBLISTING_PATH}`, jobListingData);

      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error('Error creating job listing! Error code: ' + response?.status);
      }

      console.log('Job listing created successfully!');

      const jobData = response.data;
      return new JobListingDTO({
        jobListingID: jobData.jobListingID,
        jobTitle: jobData.jobTitle,
        location: jobData.location,
        jobType: jobData.jobType,
        description: jobData.description,
        numberOfPositions: jobData.numberOfPositions,
        departmentID: jobData.departmentID,
        status: jobData.status,
        postedDate: jobData.postedDate,
        modifiedDate: jobData.modifiedDate,
        department: jobData.department,
        departmentName: jobData.departmentName,
        applicationCount: jobData.applicationCount
      });
    } catch (error) {
      console.error('Error creating job listing:', error);
      throw error;
    }
  },

  update: async (jobListingData) => {
    try {
      const response = await api.put(`${JOBLISTING_PATH}/${jobListingData.jobListingID}`, jobListingData);

      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error('Error updating job listing! Error code: ' + response?.status);
      }

      console.log('Job listing updated successfully!');

      const jobData = response.data.data || response.data;
      const rejectedCandidatesCount = response.data.rejectedCandidatesCount || 0;
      
      const jobListingDTO = new JobListingDTO({
        jobListingID: jobData.jobListingID,
        jobTitle: jobData.jobTitle,
        location: jobData.location,
        jobType: jobData.jobType,
        description: jobData.description,
        numberOfPositions: jobData.numberOfPositions,
        departmentID: jobData.departmentID,
        status: jobData.status,
        postedDate: jobData.postedDate,
        modifiedDate: jobData.modifiedDate,
        department: jobData.department,
        departmentName: jobData.departmentName,
        applicationCount: jobData.applicationCount
      });
      
      // Attach rejectedCandidatesCount to the DTO for the caller to use
      jobListingDTO.rejectedCandidatesCount = rejectedCandidatesCount;
      
      return jobListingDTO;
    } catch (error) {
      console.error('Error updating job listing:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${JOBLISTING_PATH}/${id}`);

      if (!response || response.status !== 204) {
        throw new Error('Error deleting job listing! Error code: ' + response?.status);
      }

      console.log('Job listing deleted successfully!');
      return response;
    } catch (error) {
      console.error('Error deleting job listing:', error);
      throw error;
    }
  }
};

export default JobListingService;

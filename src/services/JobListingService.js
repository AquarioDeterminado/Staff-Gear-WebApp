import api from '../utils/axiosClient';
import JobListingDTO from '../models/dtos/JobListingDTO.js';

const JOBLISTING_PATH = import.meta.env.VITE_API_JOBLISTING || '/api/v1/joblisting';

const JobListingService = {
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
  }
};

export default JobListingService;

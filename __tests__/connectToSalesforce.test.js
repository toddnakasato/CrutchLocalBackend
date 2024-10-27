// __tests__/connectToSalesforce.test.js

const { orgs, orgMap, getAccessToken, connectToSalesforce, makeApiCall } = require('../src/connectToSalesforce');
const axios = require('axios');

/*----------------------------------------------------------------------------------------------------
 *
 * Constants
 *
 ----------------------------------------------------------------------------------------------------*/
describe('org', () => {
    // Test to check that `orgs` is not null or empty
    it('should have a non-null and non-empty orgs array', () => {
        expect(orgs).not.toBeNull();
        expect(orgs).not.toBeUndefined();
        expect(Array.isArray(orgs)).toBe(true);
        expect(orgs.length).toBeGreaterThan(0);
    });

    // Test to check that each org config in `orgs` is not null and has required fields
    it('each org in orgs should have a valid configuration', () => {
        orgs.forEach((org) => {
            expect(org).not.toBeNull();
            expect(org).toHaveProperty('name');
            expect(org).toHaveProperty('consumerKey');
            expect(org).toHaveProperty('consumerSecret');
            expect(org).toHaveProperty('username');
            expect(org).toHaveProperty('password');

            // Ensure the fields are not empty
            expect(org.name).not.toBe('');
            expect(org.consumerKey).not.toBe('');
            expect(org.consumerSecret).not.toBe('');
            expect(org.username).not.toBe('');
            expect(org.password).not.toBe('');
        });
    });

    // Test to check that orgMap has mappings for each org in `orgs`
    it('should have a valid orgMap that maps each org name', () => {
        orgs.forEach((org, index) => {
            const mappedIndex = orgMap[org.name.replace(/\s+/g, '')];
            expect(mappedIndex).toBe(index);
        });
    });
});

describe('orgMap', () => {
    // Test to check that `orgMap` is not null or undefined
    it('should have a non-null and non-undefined orgMap', () => {
        expect(orgMap).not.toBeNull();
        expect(orgMap).not.toBeUndefined();
    });

    // Optionally, you can check if it contains expected mappings
    it('should have valid org mappings', () => {
        expect(orgMap).toHaveProperty('FFProd');
        expect(orgMap).toHaveProperty('DFSProd');
    });
});

/*----------------------------------------------------------------------------------------------------
 *
 * Salesforce OAuth2.0 Access Token
 *
 ----------------------------------------------------------------------------------------------------*/
describe('getAccessToken', () => {
    // Mock orgConfig object for testing
    
    const mockOrgConfig = {
        name: 'FF Prod',
        consumerKey: 'mockConsumerKey',
        consumerSecret: 'mockConsumerSecret',
        username: 'mockUsername',
        password: 'mockPassword',
    };

    // Setup the mock response for axios.post
    beforeEach(() => {
        axios.post.mockResolvedValue({
            data: {
                access_token: 'mockAccessToken',
                instance_url: 'https://mock.salesforce.com',
            },
        });
    });

    // Clear mock after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test case to verify access token is obtained
    it('should return accessToken and instanceUrl for a valid orgConfig', async () => {
        const result = await getAccessToken(mockOrgConfig);

        expect(result).toHaveProperty('accessToken', 'mockAccessToken');
        expect(result).toHaveProperty(
            'instanceUrl',
            'https://mock.salesforce.com'
        );
    });

    // Test case for handling errors
    it('should throw an error if the request fails', async () => {
        axios.post.mockRejectedValue(new Error('Request failed'));

        await expect(getAccessToken(mockOrgConfig)).rejects.toThrow(
            'Failed to fetch token for FF Prod: Request failed'
        );
    });
});



describe('makeApiCall', () => {
  const mockAccessToken = 'mockAccessToken';
  const mockInstanceUrl = 'https://mock.salesforce.com';
  const mockOrgName = 'FF Prod';

  beforeEach(() => {
      jest.clearAllMocks();
  });

  it('should log the API response on success', async () => {
      // Mocking axios.get to simulate a successful API response
      const mockResponseData = { data: { success: true } };
      axios.get.mockResolvedValue(mockResponseData);

      // Spy on console.log to check if it's called with correct arguments
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await makeApiCall(mockAccessToken, mockInstanceUrl, mockOrgName);

      // Check that axios.get was called with correct URL and headers
      expect(axios.get).toHaveBeenCalledWith(
          `${mockInstanceUrl}/services/data/v58.0/`,
          {
              headers: {
                  Authorization: `Bearer ${mockAccessToken}`,
              },
          }
      );

      // Check that console.log was called with correct response
      expect(consoleLogSpy).toHaveBeenCalledWith(
          `API Response from ${mockOrgName}:`,
          mockResponseData.data
      );

      // Restore console.log
      consoleLogSpy.mockRestore();
  });

  it('should log an error if the API call fails', async () => {
      // Mocking axios.get to simulate a failed API response
      const mockErrorMessage = 'Request failed';
      axios.get.mockRejectedValue(new Error(mockErrorMessage));

      // Spy on console.error to check if it's called with correct arguments
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await makeApiCall(mockAccessToken, mockInstanceUrl, mockOrgName);

      // Check that console.error was called with the correct error message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Error making API call to ${mockOrgName}:`,
          mockErrorMessage
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
  });
});

/*----------------------------------------------------------------------------------------------------
 *
 * Mocking Axios
 *
 ----------------------------------------------------------------------------------------------------*/
 jest.mock('axios');


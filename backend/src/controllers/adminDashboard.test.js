const { getAllWorkingHours } = require('./adminDashboardController'); // Replace with the correct path


// Mocking Firestore
jest.mock('firebase-admin/firestore', () => ({
    getFirestore: jest.fn()
}));

const mockGetFirestoreInstance = require('firebase-admin/firestore').getFirestore;

// Mock Firestore data
const mockCollection = jest.fn();
const mockGet = jest.fn();
const mockDoc = jest.fn();
const mockData = jest.fn();

// Mock the Firestore behavior
mockGetFirestoreInstance.mockImplementation(() => ({
    collection: mockCollection
}));

mockCollection.mockReturnValue({
    get: mockGet
});

mockDoc.mockReturnValue({
    data: mockData
});

describe('getAllWorkingHours', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {}; // Empty request object
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks(); // Reset mocks between tests
    });

    test('should return an empty array when no users exist', async () => {
        mockGet.mockResolvedValueOnce({
            forEach: jest.fn() // No documents
        });

        await getAllWorkingHours(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    test('should sum up hours correctly for one user', async () => {
        mockGet.mockResolvedValueOnce({
            forEach: callback => {
                callback({
                    data: () => ({
                        imePriimek: 'John Doe',
                        workHours: [
                            { hours: '5' },
                            { hours: '3' },
                            { hours: '2' }
                        ]
                    })
                });
            }
        });

        await getAllWorkingHours(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    test('should handle missing workHours gracefully', async () => {
        mockGet.mockResolvedValueOnce({
            forEach: callback => {
                callback({
                    data: () => ({
                        imePriimek: 'Jane Doe'
                        // Missing workHours field
                    })
                });
            }
        });

        await getAllWorkingHours(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    test('should handle invalid hours as 0', async () => {
        mockGet.mockResolvedValueOnce({
            forEach: callback => {
                callback({
                    data: () => ({
                        imePriimek: 'Invalid Hours User',
                        workHours: [
                            { hours: 'abc' }, // Invalid string
                            { hours: '' },    // Empty string
                            { hours: '7' }    // Valid number
                        ]
                    })
                });
            }
        });

        await getAllWorkingHours(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    test('should return 500 on database error', async () => {
        mockGet.mockRejectedValueOnce(new Error('Database error'));

        await getAllWorkingHours(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
});
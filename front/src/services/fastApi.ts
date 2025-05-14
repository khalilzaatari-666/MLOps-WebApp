import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import { DatasetResponse, CreateDatasetRequest, ClientResponse, ImageResponse, ModelResponse, TrainModelRequest, TrainingResponse, TrainingStatusResponse, TrainingTaskStatus, ModelSelectionResponse, ModelSelectConfig } from './types';

const API_URL = 'http://localhost:8000';

const fastApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fastApiFileUpload = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

const handleError = (error: AxiosError) => {
  if (error.response) {
    console.error('API error response:', error.response.data);
    throw new Error(((error.response.data as { detail: string }).detail) || `Request failed with status code ${error.response.status}`);
  } else if (error.request) {
    console.error('API eerror request:', error.request);
    throw new Error('No response received from the server');
  } else {
    console.error('API error message:', error.message);
    throw new Error(`Error setting up request: ${error.message}`);
  }
};

// Dataset API methods
export const createDataset = async (data: CreateDatasetRequest): Promise<DatasetResponse> => {
  try {
    const response = await fastApi.post('/datasets', data);
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};

export const listDatasets = async (): Promise<DatasetResponse[]> => {
  try {
    const response = await fastApi.get('/datasets');
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};

export const getDataset = async (status: string): Promise<DatasetResponse> => {
  try {
    const validStatuses = ['raw' , 'auto_annotated', 'validated'];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new Error('Invalid status. Valid statuses are: RAW, AUTO_ANNOTATED, VALIDATED');
    }
    const response: AxiosResponse<DatasetResponse> = await fastApi.get(`/datasets/${status}`);
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};


// Clients API methods
export const getClients = async (): Promise<ClientResponse[]> => {
  try {
    const response: AxiosResponse<ClientResponse[]> = await fastApi.post('/users');
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};

export const listClients = async (): Promise<ClientResponse[]> => {
  try {
    const response: AxiosResponse<ClientResponse[]> = await fastApi.get('/users');
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};


// Images API methods
export const listImages = async (datasetId: string): Promise<ImageResponse[]> => {
  try {
    const response: AxiosResponse<ImageResponse[]> = await fastApi.get(`/datasets/${datasetId}`);
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};


// Models API methods
export const listModels = async (): Promise<ModelResponse[]> => {
  try {
    const response: AxiosResponse<ModelResponse[]> = await fastApi.get('/models');
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};

export const getModel = async (modelId: string): Promise<ModelResponse> => {
  try {
    const response: AxiosResponse<ModelResponse> = await fastApi.get(`/models/${modelId}`);
    return response.data;
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
};


// Download API methods
export const downloadRawDataset = async (datasetId: string): Promise<void> => {
  try {
    const response: AxiosResponse = await fastApi.get(`/datasets/${datasetId}/download/raw`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const contentDisposition = response.headers['Content-Disposition'];
    let filename = `${datasetId}_raw_dataset.zip`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
}

export const downloadLabelsDataset = async (datasetId: string): Promise<void> => {
  try {
    const response: AxiosResponse = await fastApi.get(`/datasets/${datasetId}/download/labels`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const contentDisposition = response.headers['Content-Disposition'];
    let filename = `${datasetId}_labels.zip`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    handleError(error as AxiosError);
    throw error;
  }
}


// Annotation API methods
export const autoAnnotateDataset = async (datasetId: string, modelId: string): Promise<void> => {
  try {
    const response: AxiosResponse = await fastApi.post(`/annotate/${datasetId}/${modelId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const validateAnnotations = async (datasetId: string, annotationsZip: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('annotations_zip', annotationsZip);
    const response: AxiosResponse = await fastApiFileUpload.post(`/datasets/${datasetId}/replace_labels`, formData);
    return response.data;
  } catch (error) {
    console.error('Error in replaceDatasetLabels:', error);
    throw error;
  }
};


// Model training methods
export const prepareDataset = async (datasetId: string, split_ratios: number[]): Promise<void> => {
  try {
    const response: AxiosResponse = await fastApi.post(`/datasets/${datasetId}/prepare`, { split_ratios });
    return response.data;
  } catch (error) {
    console.error('Error in prepareDataset:', error);
    throw error;
  }
};

export const trainModel = async (request: TrainModelRequest): Promise<TrainingResponse> => {
  try {
    const response: AxiosResponse<TrainingResponse> = await fastApi.post('/start_training', request);
    return response.data;
  }catch (error) {
    console.error('Error in trainModel:', error);
    throw error;
  }
};

export const getTrainingStatus = async (datasetId: string): Promise<TrainingStatusResponse> => {
  try {
    const response: AxiosResponse<TrainingStatusResponse> = await fastApi.get(`/status/${datasetId}`);
    return response.data;
  } catch (error) {
    console.error('Error in getTrainingStatus:', error);
    throw error;
  }
};

export const getTrainingTaskStatus = async (taskId: string): Promise<TrainingTaskStatus> => {
  try {
    const response: AxiosResponse<TrainingTaskStatus> = await fastApi.get(`/training-task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error in getTrainingTaskStatus:', error);
    throw error;
  }
};

export const selectBestModel = async (request: ModelSelectConfig): Promise<ModelSelectionResponse> => {
  try {
    const response: AxiosResponse<ModelSelectionResponse> = await fastApi.post('/select_best_model', request);
    return response.data;    
  } catch (error) {
    console.error('Error in best model selection:', error);
    throw error;
  }
};

export default fastApi;

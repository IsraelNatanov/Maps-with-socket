import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

interface RequestOptions extends AxiosRequestConfig {}

const client = axios.create({ baseURL: 'http://localhost:3500' });

export const request = (options: RequestOptions): Promise<AxiosResponse> => {


  const onSuccess = (response: AxiosResponse) => response;
  const onError = (error: AxiosError) => {
    // optionally catch errors and add additional logging here
    return Promise.reject(error);
  };

  return client(options).then(onSuccess).catch(onError);
};

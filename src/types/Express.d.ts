import "express";

export type DefaultResponseBody = {
  status: number;
  message: string;
  data: any;
};

declare global {
  namespace Express {
    interface Response<ResBody = DefaultResponseBody> {
      send: (body: ResBody) => this;
      /** Added by the responseHandler middleware. Sends { status, message, data } as JSON. */
      sendResponse: (response: {
        data: any;
        status?: number;
        message?: string;
      }) => void;
    }
  }
}

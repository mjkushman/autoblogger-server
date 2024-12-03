import "express";

export type DefaultResponseBody = {
  status: number;
  message: string;
  data: any;
};

declare global {
  namespace Express {
    interface Request {
      locals?: {
        account?: any; // TODO: Update this to the Account model
      };
    }

    interface Response<ResBody = DefaultResponseBody> {
      send: (body: ResBody) => this;
    }
  }
}

import "express";

export type DefaultResponseBody = {
  status: number;
  message: string;
  data: any;
};

declare module "express" {
    export interface Response<ResBody = DefaultResponseBody> {
      send: (body: ResBody) => this;
    }
  }

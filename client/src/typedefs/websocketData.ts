export interface WebsocketData {
  type: string;
  payload: object;
}

export enum WebsocketDataType {
  Message = "message",
  Error = "error"
}

export interface MyError extends WebsocketData {
  type: WebsocketDataType.Error;
  payload: {
    message: string;
  }
}

export interface Message extends WebsocketData {
  type: WebsocketDataType.Message;
  payload: {
    nickname: string;
    message: string;
    timestamp: string;
  };
}

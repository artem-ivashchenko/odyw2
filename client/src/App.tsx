/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Message,
  MyError,
  WebsocketData,
  WebsocketDataType,
} from "./typedefs/websocketData";
import { Button, Input, Navbar, Typography } from "@material-tailwind/react";

const socket = new WebSocket("ws://localhost:8080");

function App() {
  const [username, setUsername] = useState("");
  const [usernameInput, setUserNameInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.onopen = function () {
      console.log("Connection is up");
    };

    socket.onmessage = (response: MessageEvent<any>) => {
      let parsedData: WebsocketData;
      console.log(response);

      try {
        parsedData = JSON.parse(response.data);
      } catch (error) {
        console.log("Couldn't parse data", error);
        return;
      }

      switch (parsedData.type) {
        case WebsocketDataType.Message: {
          const result = parsedData as Message;

          setMessages((prev) => [...prev, result]);
          return;
        }
        case WebsocketDataType.Error: {
          const result = parsedData as MyError;
          setError("Error: " + result.payload.message);
          return;
        }
        default:
          return;
      }
    };
  }, []);

  const sendMessage = () => {
    if (!messageInput) return;

    const message: Message = {
      type: WebsocketDataType.Message,
      payload: {
        nickname: username,
        message: messageInput,
        timestamp: JSON.stringify(Date.now()),
      },
    };
    console.log("Message sent");

    socket.send(JSON.stringify(message));
    setMessageInput("");
    setError("");
  };

  return (
    <>
      {username ? (
        <div className="relative flex flex-col h-screen bg-gray-300">
          <Navbar className="flex items-center justify-center border-b-1 rounded border-gray-500 bg-gray-400 max-w-full">
            <Typography className="text-xl font-bold text-black">
              Chat
            </Typography>
          </Navbar>

          {!messages.length && (
            <div className="flex flex-1 justify-center items-center">
              <h1 className="text-2xl">No messages yet...</h1>
            </div>
          )}

          {error && (
            <div className="text-red-600 absolute top-2 right-2">{error}</div>
          )}

          {!!messages.length && (
            <div className="flex flex-col flex-1 gap-6 p-5 overflow-y-auto">
              {messages.map((message) => {
                const {
                  nickname,
                  message: messageText,
                  timestamp,
                } = message.payload;

                return (
                  <div
                    key={timestamp}
                    className=" relative flex flex-col gap-1 border-1 border-gray-50 rounded bg-white pt-3  pb-8 px-4 min-w-[300px] w-[400px]"
                  >
                    <div className="font-bold text-lg">{nickname}</div>

                    <div>{messageText}</div>

                    <div className="absolute bottom-2 right-2 text-sm text-gray-600 font-semibold">
                      {timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="w-full h-[50px] flex">
            <input
              className="flex-1 p-3 outline-none border-1 border-gray-50 rounded"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <Button
              className="rounded-none"
              onClick={() => {
                sendMessage();
              }}
            >
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-screen flex-col flex-1 justify-center items-center">
          <div>
            <h1>Type a username</h1>
            <div className="flex gap-1">
              <Input
                placeholder="John Doe"
                onChange={(e) => {
                  setUserNameInput(e.target.value);
                }}
              />
              <Button onClick={() => setUsername(usernameInput)}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default App;

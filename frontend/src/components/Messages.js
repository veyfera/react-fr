import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Messages = () => {
  const queryClient = useQueryClient();
  const ws = useRef(null);

  const getMessages = async () => {
    const res = await fetch("http://localhost:8080/");
    if (!res.ok) {
      throw new Error("Could not get messages from server");
    }
    return res.json();
  };

  const {
    isPending,
    isError,
    data: messages,
    error,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: getMessages,
  });
  console.log("messages: ", messages);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
  }, []);

  useEffect(() => {
    ws.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server ", data);
      if (data.cmd === "remove") {
        messages.shift();
      } else {
        queryClient.setQueryData(["messages"], [...messages, data.msg]);
      }
    };
  }, [messages, queryClient]);

  const mutation = useMutation({
    mutationFn: async (msg) => {
      const res = await fetch("http://localhost:8080/", {
        method: "POST",
        body: msg,
      });
      if (!res.ok) {
        throw new Error("Could not send new message to server");
      }
      return res.json();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(e.target.message.value);
  };

  return (
    <div>
      <div>Create new message</div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type="text" name="message" />
        <input type="submit" />
      </form>
      <hr />
      <ol>
        {isPending && "loading..."}
        {isError && error.message}
        {messages && messages.map((m, i) => <li key={i}>{m}</li>)}
      </ol>
    </div>
  );
};

export default Messages;

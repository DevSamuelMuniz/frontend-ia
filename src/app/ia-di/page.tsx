"use client";
import MarkdownRenderer from "@/components/MarkdownRenderer";
// import { title } from "@/components/primitives";
import { Textarea } from "@heroui/input";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
// import MarkdownRenderer from '../../components/llmmarkdown';

export default function BlogPage() {
  const [prompt, setPrompt] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [enviar, setEnviar] = useState(false);
  const [promptDisabled, setPromptDisabled] = useState(false);
  const scrollContainerRef = useRef<any>(null);
  const [primeiraInteracao, setPrimeiraInteracao] = useState(true);

  useEffect(() => {
    // const socket = new WebSocket('wss://app1.pe.senac.br/d1b31e037327cf2924453aa6c635c680/agent');
    const socket = new WebSocket("ws://localhost:7000/agent");

    socket.onopen = () => {
      console.log("Connectado.");
    };

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);

      setMessages((prevMessages) => {
        const index = prevMessages.findIndex((msg) => msg.id === response.id);

        if (response.finalizado) {
          setPromptDisabled(false);
        }

        if (index !== -1) {
          // console.log('Atualizar')
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = {
            ...prevMessages[index],
            text: `${prevMessages[index].text}${response.text}`,
          };
          return updatedMessages;
        } else {
          return [response, ...prevMessages];
        }
      });
    };

    socket.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };

    socket.onclose = () => {
      console.log("Conexão WebSocket fechada");
    };

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  function handleOnChangePrompt(e: any) {
    setPrompt(e.target.value);
  }

  function handleEnviar(e: any) {
    if (e.key === "Enter") {
      setPrimeiraInteracao(false);
      setEnviar(true);
    }
  }

  function enviarPrompt() {
    if (socketRef.current && prompt.trim() !== "") {
      socketRef.current.send(prompt);
      setPromptDisabled(true);
      setPrompt("");
      setEnviar(false);
    }
  }

  useEffect(() => {
    if (enviar) {
      setMessages([{ id: uuidv4(), text: prompt, type: "user" }, ...messages]);
      enviarPrompt();
    }
  }, [prompt]);

  const handleScrollDown = () => {
    scrollContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    // const container = scrollContainerRef.current;
    // container.scrollTop = container.scrollHeight;
  };

  const selectHelper = (value: string) => {
    setPrompt(value);
    setPrimeiraInteracao(false);
    setEnviar(true);
  };

  useEffect(() => {
    handleScrollDown();
  }, [messages]);

  return (
    <section className="absolute left-0 right-0 bottom-0 top-0 bg-white text-gray-900 flex-col flex items-center overflow-hidden">
      <div className="flex-1 w-screen overflow-hidden overflow-y-scroll flex flex-col items-center">
        <section className="flex flex-col-reverse md:max-w-[800px] w-screen p-4">
          <div ref={scrollContainerRef} />
          {messages.map((message, index) => {
            if (message.type === "user") {
              return (
                <div
                  key={message.id}
                  className="p-2 text-white bg-black max-w-[80%] self-end rounded-xl mt-4"
                >
                  {message.text}
                </div>
              );
            } else if (message.type === "system") {
              return (
                <MarkdownRenderer key={message.id} content={message.text} />
              );
            }
          })}
        </section>
        {primeiraInteracao ? (
          <div className="bg-white flex flex-col h-full ml-16 md:max-w-[800px]">
            <div className="flex flex-1 flex-col justify-center md:max-w-[800px] w-screen">
              <h4 className="font-bold text-3xl">Olá!</h4>
              <p className="text-gray-500 text-xl">
                Como posso ajudar você hoje?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mr-14 md:max-w-[800px]">
              <div
                className="rounded-xl border border-gray-300 cursor-pointer p-4 bg-white hover:bg-gray-100 transition-colors duration-500 break-words"
                onClick={() =>
                  selectHelper(
                    "Quais turmas já liberadas para matrícula estão com baixa adesão e precisam de atenção?"
                  )
                }
              >
                Quais turmas já liberadas para matrícula estão com baixa adesão
                e precisam de atenção?
              </div>
              <div
                className="rounded-xl border border-gray-300 cursor-pointer p-4 bg-white hover:bg-gray-100 transition-colors duration-500 break-words"
                onClick={() =>
                  selectHelper(
                    "Quais unidades apresentam baixa taxa de inscrição nas turmas com matrículas abertas?"
                  )
                }
              >
                Quais unidades apresentam baixa taxa de inscrição nas turmas com
                matrículas abertas?
              </div>
              <div
                className="rounded-xl border border-gray-300 cursor-pointer p-4 bg-white hover:bg-gray-100 transition-colors duration-500 break-words"
                onClick={() =>
                  selectHelper(
                    "Como está o índice de cancelamento de turmas por unidade em 2025?"
                  )
                }
              >
                Como está o índice de cancelamento de turmas por unidade em
                2025?
              </div>
              <div
                className="rounded-xl border border-gray-300 cursor-pointer p-4 bg-white hover:bg-gray-100 transition-colors duration-500 break-words"
                onClick={() =>
                  selectHelper(
                    "Qual é o total de turmas com matrículas em aberto por unidade?"
                  )
                }
              >
                Qual é o total de turmas com matrículas em aberto por unidade?
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      <footer className="flex-col flex items-center overflow-hidden">
        <div className="flex-col md:w-[800px] w-screen p-4 mb-[16px]">
          <Textarea
            onKeyDown={handleEnviar}
            onChange={handleOnChangePrompt}
            value={prompt}
            className="flex-1"
            placeholder="Pergunte alguma coisa..."
            // disabled={promptDisabled}
            variant="faded"
          />
        </div>
      </footer>
    </section>
  );
}

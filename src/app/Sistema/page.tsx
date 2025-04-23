"use client";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";


//imgs
import Image from "next/image";
import Logo from "@/assets/logo.png";

//libs
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { AnimatePresence, motion } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function Sistema() {
  const [mensagens, setMensagens] = useState<
    { autor: string; texto: string }[]
  >([]);

  const [chatAtivo, setChatAtivo] = useState(false);
  const [input, setInput] = useState("");
  const fimDoChatRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const maxHeight = 200;

  //perguntas
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    fimDoChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "6rem";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`;
    }
  }, [input]);

  //
  //

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

  //

  return (
    <main className="bg-neutral-800 h-screen w-screen flex flex-col font-poppins overflow-hidden">
      <header className="w-full p-5 flex items-center gap-2 absolute top-0 left-0 z-10">
        <a className="flex items-center" href="/Sistema">
          <Image width={50} src={Logo} alt="logo" />
          <p className="text-white font-bold text-lg">LungAI</p>
        </a>
      </header>

      <section className="flex flex-col h-full w-full px-4 md:px-[10%] pt-24 relative max-w-screen-xl mx-auto">
        <AnimatePresence>
          {!chatAtivo && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center flex-grow text-center absolute top-0 left-0 w-full h-full"
            >
              <h1 className="text-white text-3xl flex flex-col items-center gap-2">
                <Image
                  width={30}
                  src={Logo}
                  alt="bg"
                  style={{ filter: "grayscale(100%)" }}
                />
                Bem-vindo ao LungAI
              </h1>
              <h2 className="text-neutral-300 text-2xl animate-pulse mt-2 mb-6">
                Vamos iniciar a sua consulta?
              </h2>
              <button
                onClick={() => {
                  selectHelper('Vamos Iniciar!');
                  setChatAtivo(true);
                }}
                className="text-lg text-neutral-300 border w-1/4 p-2 rounded-lg hover:bg-neutral-700 cursor-pointer"
              >
                Vamos iniciar!
              </button>
              <a className="text-neutral-400 mt-4" href="/Dashboard">
                Ver dashboards
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {chatAtivo && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col flex-grow relative h-full"
            >
              <div className="absolute top-2/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
                <h1 className="text-white font-semibold text-8xl select-none">
                  LungAI
                </h1>
              </div>

              <div className="flex flex-col-reverse gap-3 px-2 overflow-y-auto pb-4 flex-grow custom-scroll w-full">
                {messages.length === 0 ? (
                  <p className="text-neutral-400 text-center mt-4">
                    Envie sua primeira mensagem para começar a interação.
                  </p>
                ) : (
                  messages.map((message) => {
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
                  })
                )}

                <div ref={fimDoChatRef} />
              </div>

              <div className="w-full mt-2">
                <form onSubmit={handleEnviar} className="relative w-full">
                  <textarea
                    ref={textAreaRef}
                    className="bg-neutral-700 pt-4 px-6 w-full text-white rounded-2xl border border-neutral-600 resize-none overflow-y-auto focus:outline-none"
                    value={prompt}
                    placeholder="Escreva a sua mensagem..."
                    onChange={handleOnChangePrompt}
                    onKeyDown={handleEnviar}
                    rows={1}
                    style={{ maxHeight: "200px", minHeight: "6rem" }}
                  />
                  <button
                    type="submit"
                    className="absolute bottom-3 right-3 text-white focus:outline-none cursor-pointer"
                  >
                    <ArrowCircleUpIcon fontSize="large" />
                  </button>
                </form>
                <p className="text-neutral-400 text-center text-sm pb-2">
                  O LungAI pode cometer erros. Considere verificar as
                  informações e procure um profissional.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

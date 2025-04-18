"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
//imgs
import Image from "next/image";
import Logo from "@/assets/logo.png";

//libs
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";

import { AnimatePresence, motion } from "framer-motion";

export default function Sistema() {
  const [mensagens, setMensagens] = useState<
    { autor: string; texto: string }[]
  >([]);
  const [esperandoResposta, setEsperandoResposta] = useState(false);

  const [chatAtivo, setChatAtivo] = useState(false);
  const [input, setInput] = useState("");
  const fimDoChatRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const maxHeight = 200;

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

  const sendMensagem = async (texto: string) => {
    setMensagens((m) => [...m, { autor: "user", texto }]);

    setEsperandoResposta(true);
    setMensagens((m) => [...m, { autor: "bot", texto: "" }]);

    // 3) abre o stream e vai preenchendo
    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "12345", message: texto }),
    });
    const reader = response.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let respostaAtual = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      respostaAtual += decoder.decode(value, { stream: true });

      // atualiza sempre a última mensagem do bot
      setMensagens((m) => {
        const msgs = [...m];
        msgs[msgs.length - 1].texto = respostaAtual;
        return msgs;
      });
    }

    setEsperandoResposta(false);
  };

  const obterRespostaDoModelo = async (mensagem: string) => {
    try {
      const resposta = await axios.post("http://localhost:8000/api/chat", {
        user_id: "12345",
        message: mensagem,
      });

      return resposta.data.response;
    } catch (erro) {
      console.error("Erro ao enviar mensagem ao modelo:", erro);
      return "Desculpe, houve um erro ao processar sua mensagem.";
    }
  };

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() !== "") {
      const novaMensagem = { autor: "user", texto: input };

      setMensagens((prevMensagens) => [...prevMensagens, novaMensagem]);
      setInput(""); // Limpa o campo de texto

      // Envia a mensagem ao modelo
      setEsperandoResposta(true);
      const respostaDoModelo = await obterRespostaDoModelo(input);
      setEsperandoResposta(false);

      // Adiciona a resposta do modelo
      let index = 0;
      let textoDigitado = "";
      await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5s

      const intervalo = setInterval(() => {
        textoDigitado += respostaDoModelo.charAt(index);
        index++;

        setMensagens((prev) => {
          const msgs = [...prev];
          // Se a última mensagem já for do bot digitando, atualiza
          if (
            msgs[msgs.length - 1]?.autor === "bot" &&
            textoDigitado.length > 1
          ) {
            msgs[msgs.length - 1].texto = textoDigitado;
            return msgs;
          } else {
            // Se for o primeiro caractere, adiciona a msg do bot
            return [...msgs, { autor: "bot", texto: textoDigitado }];
          }
        });

        if (index >= respostaDoModelo.length) {
          clearInterval(intervalo);
        }
      }, 8);
    }
  };

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
                  setChatAtivo(true);
                  sendMensagem("Vamos iniciar!");
                }}
                className="text-lg text-neutral-300 border w-1/4 p-2 rounded-lg hover:bg-neutral-700 cursor-pointer"
              >
                Vamos iniciar!
              </button>
              <a className="text-neutral-400 mt-4" href="">
                Iniciar conversa aleatória.
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

              <div className="flex flex-col gap-3 px-2 overflow-y-auto pb-4 flex-grow custom-scroll">
                {mensagens.length === 0 ? (
                  <p className="text-neutral-400 text-center mt-4">
                    Envie sua primeira mensagem para começar a interação.
                  </p>
                ) : (
                  mensagens.map((msg, index) => (
                    <div
                      key={index}
                      className={`text-white self-${
                        msg.autor === "user" ? "end" : "start"
                      } px-4 py-2 rounded-xl max-w-1/2 break-words z-10 ${
                        msg.autor === "user"
                          ? "bg-neutral-500"
                          : "bg-neutral-700"
                      }`}
                    >
                      {msg.texto}
                    </div>
                  ))
                )}

                {esperandoResposta && (
                  <div className="self-start bg-neutral-700 text-white px-4 py-2 rounded-xl max-w-1/2">
                    <span className="italic text-neutral-400">
                      LungAI está digitando...
                    </span>
                  </div>
                )}

                <div ref={fimDoChatRef} />
              </div>

              <div className="w-full mt-2">
                <form
                  onSubmit={handleEnviarMensagem}
                  className="relative w-full"
                >
                  <textarea
                    ref={textAreaRef}
                    disabled={esperandoResposta}
                    className="bg-neutral-700 pt-4 px-6 w-full text-white rounded-2xl border border-neutral-600 resize-none overflow-y-auto focus:outline-none"
                    value={input}
                    placeholder="Escreva a sua mensagem..."
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviarMensagem(e);
                      }
                    }}
                    rows={1}
                    style={{ maxHeight: "200px", minHeight: "6rem" }}
                  />
                  <button
                    type="submit"
                    className="absolute bottom-3 right-3 text-white focus:outline-none cursor-pointer"
                    disabled={esperandoResposta}
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

"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Logo from "@/assets/logo.png";

import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";

export default function Sistema() {
  const [input, setInput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const maxHeight = 200; 

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

  const predefinedQuestions = [
    "Quais são os sintomas do câncer de pulmão?",
    "Como é feito o diagnóstico do câncer de pulmão?",
    "O câncer de pulmão tem cura?",
    "Quais são os tratamentos disponíveis?",
  ];

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <main className="bg-neutral-800 h-screen w-screen flex flex-col justify-center items-center align-middle font-poppins">
      <header className="absolute top-0 w-full align-middle justify-start p-4 flex items-center">
        <Image width={50} src={Logo} alt="logo" />
        <p className="text-white font-bold font text-lg">LungAI</p>
      </header>

      <section className="flex flex-col justify-center align-middle items-center">
        <div className="flex flex-col justify-center align-middle text-center pb-10">
          <h1 className="text-white text-3xl ">Bem-vindo ao LungAI</h1>
          <h1 className="text-white text-3xl">Vamos iniciar a sua consulta?</h1>
        </div>

        <div className="w-full pb-6 relative">
          <textarea
            ref={textAreaRef}
            className="bg-neutral-700 pt-4 px-6 w-full text-white rounded-2xl border border-neutral-600 resize-none overflow-y-auto focus:outline-none"
            value={input}
            placeholder="Escreva a sua mensagem..."
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            style={{ maxHeight: "200px" }}
          />
          <button className="absolute bottom-10 right-4 text-white focus:outline-none">
            <ArrowCircleUpIcon fontSize="large" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {predefinedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(question)}
              className="border border-gray-600 text-white text-sm  px-4 py-3 rounded-full text-center cursor-pointer hover:bg-gray-800"
            >
              {question}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

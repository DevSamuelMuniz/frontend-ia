"use client";
import { useState } from "react";
import axios from "axios";

type Mensagem = {
  autor: "user" | "bot";
  texto: string;
};

type ResultadoML = {
  resultado: string;
  probabilidade: number;
  shap_values: Record<string, number>;
};

export function useGeminiConversational() {
  const [conversa, setConversa] = useState<Mensagem[]>([]);
  const [dadosInterpretados, setDadosInterpretados] = useState<any>({});
  const [resultado, setResultado] = useState<ResultadoML | null>(null);
  const [perguntasFeitas, setPerguntasFeitas] = useState<string[]>([]);

  const perguntasMockadas = [
    "Qual o seu sexo biológico? ex: Masculino/Feminino",
    "Quantos anos você tem?",
    "Você fuma atualmente ou já fumou?",
    "Seus dedos apresentam coloração amarelada?",
    "Você sente ansiedade frequentemente?",
    "Você já sentiu pressão social, seja por amigos ou familiares?",
    "Você possui alguma doença crônica diagnosticada?",
    "Você sente fadiga ou cansaço com frequência?",
    "Você tem alergias respiratórias (como rinite, sinusite, etc.)?",
    "Você já percebeu chiado no peito ao respirar?",
    "Você consome bebidas alcoólicas com frequência?",
    "Você tem tosse frequente?",
    "Você sente falta de ar com frequência?",
    "Você tem dificuldade para engolir alimentos ou líquidos?",
    "Você sente dores no peito com frequência?",
  ];

  async function enviarMensagem(texto: string) {
    setConversa((prev) => [...prev, { autor: "user", texto }]);

    // Simula interpretação do Gemini
    const novaResposta = perguntasMockadas[perguntasFeitas.length];

    // Salvar dados interpretados
    const chave = perguntasMockadas[perguntasFeitas.length - 1];
    if (chave) {
      setDadosInterpretados((prev: any) => ({
        ...prev,
        [chave]: texto,
      }));
    }

    // Verifica se terminou
    if (perguntasFeitas.length === perguntasMockadas.length) {
      const finalData = { ...dadosInterpretados };
      // Simula envio pro backend:
      const resposta = await enviarParaModelo(finalData);
      setResultado(resposta);
    } else {
      // Pergunta seguinte
      setTimeout(() => {
        setConversa((prev) => [...prev, { autor: "bot", texto: novaResposta }]);
        setPerguntasFeitas((prev) => [...prev, novaResposta]);
      }, 500);
    }
  }

  return {
    conversa,
    enviarMensagem,
    resultado,
  };
}

export async function enviarParaModelo(dados: any) {
    try {
      const resposta = await axios.post("http://localhost:5000/predict", dados);
  
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao chamar modelo de ML:", erro);
      return {
        resultado: "Erro na análise",
        probabilidade: 0,
        shap_values: {},
      };
    }
  }

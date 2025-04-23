"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Logo from "@/assets/logo.png";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface StatsResponse {
  age_distribution: Record<string, number>;
  age_percent: Record<string, number>;
  prediction_counts: Record<string, number>;
  prediction_percent: Record<string, number>;
  gender_counts: Record<string, number>;
  gender_percent: Record<string, number>;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<StatsResponse>("http://localhost:7000/api/dashboard")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white p-10 bg-neutral-700 h-screen">Carregando...</div>;
  if (!stats)
    return <div className="text-red-500 p-10">Erro ao carregar dados.</div>;

  // helper to transform Record<string,number> → { nome, valor }[]
  const toChartData = (obj: Record<string, number>) =>
    Object.entries(obj).map(([nome, valor]) => ({ nome, valor }));

  const ageCountData = toChartData(stats.age_distribution);
  const agePctData = toChartData(stats.age_percent);
  const predCountData = toChartData(stats.prediction_counts);
  const predPctData = toChartData(stats.prediction_percent);
  const genderCountData = toChartData(stats.gender_counts);
  const genderPctData = toChartData(stats.gender_percent);

  return (
    <main className="bg-neutral-800 min-h-screen text-white font-poppins">
      <header className="p-5 flex items-center gap-2 sticky top-0 z-10">
        <a className="flex items-center" href="/Sistema">
          <Image width={50} src={Logo} alt="logo" />
          <span className="font-bold text-lg">LungAI</span>
          <span className="font-bold text-lg ml-2">{"< Stats"}</span>
        </a>
      </header>

      <section className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* 1. Idade - Contagem */}
        <div>
          <h2 className="text-xl mb-2">Idade (contagem)</h2>
          {ageCountData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageCountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>

        {/* 2. Idade - Percentual */}
        <div>
          <h2 className="text-xl mb-2">Idade (%)</h2>
          {agePctData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agePctData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Legend />
                <Bar dataKey="valor" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>

        {/* 3. Predição - Contagem */}
        <div>
          <h2 className="text-xl mb-2">Predição (contagem)</h2>
          {predCountData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={predCountData}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={80}
                  label
                >
                  {predCountData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>

        {/* 4. Predição - Percentual */}
        <div>
          <h2 className="text-xl mb-2">Predição (%)</h2>
          {predPctData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={predPctData}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${(percent! * 100).toFixed(1)}%`
                  }
                >
                  {predPctData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>

        {/* 5. Gênero - Contagem */}
        <div>
          <h2 className="text-xl mb-2">Gênero (contagem)</h2>
          {genderCountData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderCountData}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={80}
                  label
                >
                  {genderCountData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>

        {/* 6. Gênero - Percentual */}
        <div>
          <h2 className="text-xl mb-2">Gênero (%)</h2>
          {genderPctData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderPctData}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${(percent! * 100).toFixed(1)}%`
                  }
                >
                  {genderPctData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>
      </section>
    </main>
  );
}

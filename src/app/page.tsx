/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { motion } from "framer-motion";
import Logo from "@/assets/logo.png";
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState<any>({
    GENDER: "",
    AGE: "",
    SMOKING: "",
    YELLOW_FINGERS: "",
    ANXIETY: "",
    PEER_PRESSURE: "",
    CHRONIC_DISEASE: "",
    FATIGUE: "",
    ALLERGY: "",
    WHEEZING: "",
    ALCOHOL_CONSUMING: "",
    COUGHING: "",
    SHORTNESS_OF_BREATH: "",
    SWALLOWING_DIFFICULTY: "",
    CHEST_PAIN: "",
  });
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    const featuresArray = [
      Number(formData.GENDER),
      Number(formData.AGE),
      Number(formData.SMOKING),
      Number(formData.YELLOW_FINGERS),
      Number(formData.ANXIETY),
      Number(formData.PEER_PRESSURE),
      Number(formData.CHRONIC_DISEASE),
      Number(formData.FATIGUE),
      Number(formData.ALLERGY),
      Number(formData.WHEEZING),
      Number(formData.ALCOHOL_CONSUMING),
      Number(formData.COUGHING),
      Number(formData.SHORTNESS_OF_BREATH),
      Number(formData.SWALLOWING_DIFFICULTY),
      Number(formData.CHEST_PAIN),
    ];

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/chat/predict/",
        {
          user_id: "12345",
          features: featuresArray,
        }
      );

      setResultado(response.data.resultado);
    } catch (error) {
      console.error("Erro ao fazer a previsão:", error);
    }

    setLoading(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const renderDropdown = (key: string) => {
    if (key === "GENDER") {
      return (
        <FormControl fullWidth variant="outlined" required>
          <InputLabel>Gênero</InputLabel>
          <Select
            name={key}
            value={formData[key]}
            onChange={handleChange}
            label="Gênero"
          >
            <MenuItem value="1">Masculino</MenuItem>
            <MenuItem value="0">Feminino</MenuItem>
          </Select>
        </FormControl>
      );
    } else if (key === "AGE") {
      return (
        <TextField
          name={key}
          value={formData[key]}
          onChange={handleChange}
          label="Idade"
          type="number"
          fullWidth
          required
          InputProps={{
            inputProps: {
              min: 0,
              max: 120,
            },
          }}
        />
      );
    } else {
      return (
        <FormControl fullWidth variant="outlined" required>
          <InputLabel>{key.replace(/_/g, " ")}</InputLabel>
          <Select
            name={key}
            value={formData[key]}
            onChange={handleChange}
            label={key.replace(/_/g, " ")}
          >
            <MenuItem value="0">Não</MenuItem>
            <MenuItem value="1">Sim</MenuItem>
          </Select>
        </FormControl>
      );
    }
  };

  return (
    <motion.main
      className="p-8 w-full mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <AppBar position="sticky" color="info" style={{ width: "100%" }}>
        <Toolbar>
          <Image
            src={Logo}
            alt="Logo"
            style={{ width: "50px", height: "50px" }}
          />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Previsão de Câncer de Pulmão
          </Typography>
        </Toolbar>
      </AppBar>

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="flex flex-col space-y-4">
            <label className="text-sm font-medium mb-2">
              {key.replace(/_/g, " ")}
            </label>
            {renderDropdown(key)}
          </div>
        ))}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Analisando..." : "Enviar"}
          </Button>
        </motion.div>
      </form>

      {resultado && (
        <motion.div
          className="mt-6 p-4 bg-gray-100 rounded shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h6">Resultado:</Typography>
          <Typography>{resultado}</Typography>
        </motion.div>
      )}

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Resultado Detalhado</DialogTitle>
        <DialogContent>
          <Typography>{resultado}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </motion.main>
  );
}

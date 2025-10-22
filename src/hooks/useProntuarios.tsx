
import { useState, useEffect } from "react";

export interface Prontuario {
  id: number;
  paciente: string;
  psicologo: string;
  idade: string;
  profissao: string;
  estadoCivil: string;
  telefone: string;
  email: string;
  endereco: string;
  cpf: string;
  motivoConsulta: string;
  historicoMedico: string;
  medicamentos: string;
  observacoes: string;
  demandaInicial: string;
  objetivoTratamento: string;
  evolucaoPaciente: string;
  anotacoesGerais: string;
  sessoes: any[];
  professionalId: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export const useProntuarios = (professionalId?: number) => {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);

  const loadProntuarios = () => {
    const savedProntuarios = localStorage.getItem("prontuarios");
    if (savedProntuarios) {
      const allProntuarios = JSON.parse(savedProntuarios);
      if (professionalId) {
        setProntuarios(allProntuarios.filter((p: Prontuario) => p.professionalId === professionalId));
      } else {
        setProntuarios(allProntuarios);
      }
    } else {
      setProntuarios([]);
    }
  };

  useEffect(() => {
    loadProntuarios();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "prontuarios") {
        loadProntuarios();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadProntuarios, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [professionalId]);

  const addProntuario = (prontuario: Omit<Prontuario, "id" | "dataCriacao" | "dataUltimaAtualizacao">) => {
    const now = new Date().toISOString();
    const newProntuario = {
      ...prontuario,
      id: Date.now(),
      dataCriacao: now,
      dataUltimaAtualizacao: now
    };

    const savedProntuarios = localStorage.getItem("prontuarios");
    const allProntuarios = savedProntuarios ? JSON.parse(savedProntuarios) : [];
    const updatedProntuarios = [...allProntuarios, newProntuario];
    
    localStorage.setItem("prontuarios", JSON.stringify(updatedProntuarios));
    loadProntuarios();
  };

  const updateProntuario = (id: string, updates: Partial<Prontuario>) => {
    const savedProntuarios = localStorage.getItem("prontuarios");
    if (savedProntuarios) {
      const allProntuarios = JSON.parse(savedProntuarios);
      const updatedProntuarios = allProntuarios.map((p: Prontuario) =>
        p.id === parseInt(id) ? { ...p, ...updates, dataUltimaAtualizacao: new Date().toISOString() } : p
      );
      
      localStorage.setItem("prontuarios", JSON.stringify(updatedProntuarios));
      loadProntuarios();
    }
  };

  const deleteProntuario = (id: number) => {
    const savedProntuarios = localStorage.getItem("prontuarios");
    if (savedProntuarios) {
      const allProntuarios = JSON.parse(savedProntuarios);
      const updatedProntuarios = allProntuarios.filter((p: Prontuario) => p.id !== id);
      
      localStorage.setItem("prontuarios", JSON.stringify(updatedProntuarios));
      loadProntuarios();
    }
  };

  return {
    prontuarios,
    addProntuario,
    updateProntuario,
    deleteProntuario
  };
};

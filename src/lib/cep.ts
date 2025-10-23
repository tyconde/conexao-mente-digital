// Funções para trabalhar com CEP e busca de endereço

export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) {
    return numbers;
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

export const cleanCEP = (cep: string): string => {
  return cep.replace(/\D/g, '');
};

export const isValidCEP = (cep: string): boolean => {
  const cleanedCEP = cleanCEP(cep);
  return cleanedCEP.length === 8;
};

export const fetchAddressByCEP = async (cep: string): Promise<AddressData | null> => {
  try {
    const cleanedCEP = cleanCEP(cep);
    
    if (!isValidCEP(cep)) {
      throw new Error('CEP inválido');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data: AddressData = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

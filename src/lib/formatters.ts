'use client';

export const formatCPF = (cpf: string): string => {
  cpf = cpf.replace(/\D/g, ''); // Remove todos os não dígitos
  cpf = cpf.slice(0, 11); // Limita a 11 dígitos

  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  return cpf;
};

export const formatPhone = (phone: string): string => {
  phone = phone.replace(/\D/g, ''); // Remove todos os não dígitos
  phone = phone.slice(0, 11); // Limita a 11 dígitos

  if (phone.length > 10) {
    phone = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phone.length > 5) {
    phone = phone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (phone.length > 2) {
    phone = phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    phone = phone.replace(/(\d*)/, '($1');
  }

  return phone;
};

export const formatCurrency = (value: string | number): string => {
  let stringValue = String(value);

  if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
      });
  }
  
  // Remove tudo que não for dígito
  stringValue = stringValue.replace(/\D/g, '');
  if (stringValue === '') return '';

  const numberValue = parseInt(stringValue, 10) / 100;
  
  return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
  });
};


export const unformatCurrency = (value: string): number => {
    if (!value) return 0;
    
    // Remove tudo que não for dígito
    const numericString = value.replace(/\D/g, '');
    if (numericString === '') return 0;
    
    const numberValue = parseFloat(numericString) / 100;
    
    return isNaN(numberValue) ? 0 : numberValue;
};

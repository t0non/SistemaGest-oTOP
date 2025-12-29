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
    
    // Remove tudo que não for dígito ou vírgula
    stringValue = stringValue.replace(/[^\d,]/g, '');

    // Substitui vírgula por ponto para o parse
    stringValue = stringValue.replace(',', '.');
    
    // Remove múltiplos pontos
    const parts = stringValue.split('.');
    if (parts.length > 2) {
        stringValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Se o valor for vazio ou inválido, retorna uma string vazia
    if (isNaN(parseFloat(stringValue))) {
      return '';
    }

    return parseFloat(stringValue).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });
};


export const unformatCurrency = (value: string): number => {
    if (!value) return 0;
    
    // Remove o símbolo da moeda e os pontos de milhar
    const numericString = value.replace('R$', '').replace(/\./g, '').trim();
    
    // Troca a vírgula do decimal por um ponto
    const finalString = numericString.replace(',', '.');

    const numberValue = parseFloat(finalString);
    
    return isNaN(numberValue) ? 0 : numberValue;
};
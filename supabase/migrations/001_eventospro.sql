CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  associado_nome TEXT,
  associado_cpf TEXT,
  veiculo_placa TEXT,
  veiculo_modelo TEXT,
  tipo TEXT,
  status TEXT DEFAULT 'aberto',
  descricao TEXT,
  responsavel_id UUID,
  responsavel_nome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evento_andamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos(id),
  descricao TEXT NOT NULL,
  autor_nome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evento_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos(id),
  nome TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

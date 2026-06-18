-- Adiciona os novos campos da Ficha de Filiação na tabela filiados
ALTER TABLE public.filiados
ADD COLUMN data_nascimento date,
ADD COLUMN nome_pai text,
ADD COLUMN nome_mae text,
ADD COLUMN cpf text,
ADD COLUMN rg text,
ADD COLUMN sexo text,
ADD COLUMN endereco_rua text,
ADD COLUMN endereco_bairro text,
ADD COLUMN endereco_cep text,
ADD COLUMN endereco_cidade text,
ADD COLUMN endereco_estado text;

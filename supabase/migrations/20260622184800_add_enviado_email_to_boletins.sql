-- Migration para adicionar flag de disparo em lote no boletim
ALTER TABLE boletins 
ADD COLUMN IF NOT EXISTS enviado_email BOOLEAN DEFAULT false;

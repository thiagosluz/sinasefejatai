-- Cole este script no SQL Editor do Supabase após rodar a migration de perfis

-- Este script garante que o seu e-mail tenha o perfil de Superadmin,
-- para que você não perca acesso ao sistema após a ativação da checagem de perfil.

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Busca o ID do seu usuário na tabela de autenticação
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'filhodaluz8@gmail.com'
    LIMIT 1;

    -- Se o usuário existir, cria ou atualiza o perfil dele para superadmin
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.perfis (id, role, created_at, updated_at)
        VALUES (v_user_id, 'superadmin', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET role = 'superadmin', updated_at = NOW();
        
        RAISE NOTICE 'Perfil superadmin criado para o ID: %', v_user_id;
    ELSE
        RAISE WARNING 'Usuário com email filhodaluz8@gmail.com não encontrado em auth.users!';
    END IF;
END $$;

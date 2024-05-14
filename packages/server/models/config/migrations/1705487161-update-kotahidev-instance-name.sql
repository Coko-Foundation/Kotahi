UPDATE configs
SET form_data = 
    CASE 
        WHEN form_data->>'instanceName' = 'colab' THEN jsonb_set(form_data, '{instanceName}', '"prc"')
        WHEN form_data->>'instanceName' = 'aperture' THEN jsonb_set(form_data, '{instanceName}', '"journal"')
        WHEN form_data->>'instanceName' = 'elife' THEN jsonb_set(form_data, '{instanceName}', '"preprint1"')
        WHEN form_data->>'instanceName' = 'ncrc' THEN jsonb_set(form_data, '{instanceName}', '"preprint2"')
        ELSE form_data
    END;

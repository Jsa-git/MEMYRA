# Feature flags

Flags são tipadas, possuem owner, motivo, ambientes, default seguro e data de revisão. Capacidades sensíveis são avaliadas no servidor e começam `false`: AI comparison, advanced image analysis, push notifications e experimental protocols.

Flags não substituem autorização, migrations compatíveis nem safety checks. O código deve funcionar com ambos os estados; rollout é local → preview → pequena coorte → produção, com métrica e kill switch. Remover flag após estabilização.

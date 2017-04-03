jcmp.events.AddRemoteCallable('ctools/TOD', (player, tod) => {
    jcmp.events.CallRemote('ctools/TODbroadcast', null, tod);
})

jcmp.events.AddRemoteCallable('ctools/invul', (player) => {
    player.invulnerable = true;
})

jcmp.events.AddRemoteCallable('ctools/noinvul', (player) => {
    player.invulnerable = false;
})


jcmp.events.AddRemoteCallable('ctools/TOD', (player, tod) => {
    jcmp.events.CallRemote('ctools/TODbroadcast', null, tod);
})

jcmp.events.AddRemoteCallable('ctools/invul', (player) => {
    player.invulnerable = true;
})

jcmp.events.AddRemoteCallable('ctools/ChangeWeather', (player, weather) => {
    let w = ['base','rain','overcast','thunderstorm','fog','snow'].indexOf(weather);
    if (w > -1)
    {
        jcmp.events.CallRemote('ctools/ChangeWeather', null, w);
    }
})

jcmp.events.AddRemoteCallable('ctools/noinvul', (player) => {
    player.invulnerable = false;
})

jcmp.events.AddRemoteCallable('ctools/tptocam', (player, x, y, z) => {
    player.position = new Vector3f(x,y,z);
})


jcmp.events.AddRemoteCallable('ctools/movespectator', (player, id) => {
    jcmp.players.forEach(function(p) 
    {
        if (p.networkId == id)
        {
            player.position = p.position.add(0,20,0);
        }
    });
})


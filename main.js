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
            player.position = p.position.sub(new Vector3f(0,75,0));
            return;
        }
    });
})

jcmp.events.AddRemoteCallable('ctools/loaded', (player) => 
{
    const data = [];

    for (let i = 0; i < jcmp.players.length; i++)
    {
        data.push({
            name: jcmp.players[i].name,
            id: jcmp.players[i].networkId
        })
    }

    jcmp.events.CallRemote('ctools/init_players', player, JSON.stringify(data));
})

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    jcmp.events.CallRemote('ctools/remove_player', null, player.networkId);
})

jcmp.events.Add('PlayerReady', (player) => 
{
    jcmp.events.CallRemote('ctools/add_player', null, player.networkId, player.name);
})
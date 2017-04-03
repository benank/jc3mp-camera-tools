const ui = new WebUIWindow('ctools', 'package://ctools/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));

let can_use = true;
let cam_type = "dfcm";
let to_pos = new Vector3f(0,0,0);
let to_rot = new Vector3f(0,0,0);
let keys = [];
let speed = 1;
let rot_speed = 0.03;
let hud = true;
let positions = [];
let rotations = [];
let path_index = 0;
let tracked_player = null;

jcmp.ui.AddEvent('ctools/ChangeInput', (id, value) => {
    if (id == "ms") // Movement speed
    {
        speed = parseFloat(value);
    }
    else if (id == "rs") // Rotation speed
    {
        rot_speed = parseFloat(value);
    }
    else if (id == "tod") // Time of day
    {
        jcmp.events.CallRemote('ctools/TOD', value);
    }
    else if (id == "dhd") // Disable HUD
    {
        hud = !hud;
        jcmp.localPlayer.SetAbilityEnabled(0xCB836D80, hud);
        jcmp.localPlayer.SetAbilityEnabled(0xCEEFA27A, hud);
        jcmp.localPlayer.SetAbilityEnabled(0xE060F641, hud);

    }
    else if (id == "frcm") // Freecam
    {
        jcmp.events.CallRemote('ctools/invul');
        cam_type = "frcm";
        jcmp.localPlayer.controlsEnabled = false;
        jcmp.localPlayer.frozen = true;
        jcmp.localPlayer.camera.attachedToPlayer = false;
        to_pos = jcmp.localPlayer.camera.position;
        to_rot = jcmp.localPlayer.camera.rotation;
    }
    else if (id == "trcm" || id == "trcm2") // Tracking cam
    {
        jcmp.events.CallRemote('ctools/invul');
        cam_type = id;
        jcmp.localPlayer.controlsEnabled = false;
        jcmp.localPlayer.camera.attachedToPlayer = false;
        jcmp.localPlayer.frozen = true;
    }
    else if (id == "ptcm") // Pathing cam
    {
        jcmp.events.CallRemote('ctools/invul');
        cam_type = "ptcm";
        path_index = 0;
        jcmp.localPlayer.controlsEnabled = false;
        jcmp.localPlayer.camera.attachedToPlayer = false;
        jcmp.localPlayer.frozen = true;
        jcmp.localPlayer.camera.position = positions[path_index];
        jcmp.localPlayer.camera.rotation = rotations[path_index];
    }
    else if (id == "dfcm") // Default cam
    {
        jcmp.events.CallRemote('ctools/noinvul');
        cam_type = "dfcm";
        jcmp.localPlayer.camera.attachedToPlayer = true;
        jcmp.localPlayer.frozen = false;
        jcmp.localPlayer.controlsEnabled = true;
    }
    else if (id == "snp") // Start new path
    {
        positions = [];
        rotations = [];
    }
    else if (id == "app") // Add point to path
    {
        positions.push(jcmp.localPlayer.camera.position);
        rotations.push(jcmp.localPlayer.camera.rotation);
    }
    else if (id == "fov" && cam_type != 'dfcm') // Adjust FOV
    {
        jcmp.localPlayer.camera.fieldOfView = parseFloat(value);
    }
    else if (id == "ean") // Switch current tracking player
    {
        let player = null;
        jcmp.players.forEach(function(p) 
        {
            if (p.name.toLowerCase().search(value.toLowerCase()) > -1)
            {
                player = p;
            }
        });
        if (player != null)
        {
            //jcmp.debug('player found with name ' + value);
            jcmp.ui.CallEvent('ctools/changetracked', player.name);
            tracked_player = player;
        }
        else
        { 
            //jcmp.debug('no player found with name ' + value);
            tracked_player = null;
        }
    }
})

jcmp.ui.AddEvent('ctools/KeyDown', key => {
    if (cam_type == "frcm" && can_use && keys.indexOf(key) == -1)
    {
        keys.push(key);
    }
})

jcmp.ui.AddEvent('ctools/KeyUp', key => {
    if (cam_type == "frcm" && can_use && keys.indexOf(key) > -1)
    {
        keys.splice(keys.indexOf(key), 1);
    }
})

jcmp.ui.AddEvent('ctools/ToggleOpen', (o) => {
    if (cam_type == "dfcm")
    {
        jcmp.localPlayer.controlsEnabled = !o;
    }
})

jcmp.events.AddRemoteCallable('ctools/TODbroadcast', (tod) => {
    jcmp.world.SetTime(parseInt(tod), 60 * (parseFloat(tod) - Math.floor(parseFloat(tod))));
})

function ProcessKey(key)
{
    switch(key)
    {
        // Position
        case 87: // W, Forward
        {
            to_pos = to_pos.add(vq(new Vector3f(0,0,speed), jcmp.localPlayer.camera.rotation));
            break;
        }
        case 65: // A, Left
        {
            to_pos = to_pos.add(vq(new Vector3f(-speed,0,0), jcmp.localPlayer.camera.rotation));
            break;
        }
        case 83: // S, Backward
        {
            to_pos = to_pos.add(vq(new Vector3f(0,0,-speed), jcmp.localPlayer.camera.rotation));
            break;
        }
        case 68: // D, Right
        {
            to_pos = to_pos.add(vq(new Vector3f(speed,0,0), jcmp.localPlayer.camera.rotation));
            break;
        }
        case 32: // Space, Up
        {
            to_pos = to_pos.add(new Vector3f(0,speed,0));
            break;
        }
        case 16: // Shift, Down
        {
            to_pos = to_pos.add(new Vector3f(0,-speed,0));
            break;
        }

        // Rotation
        case 38: // Up Arrow, Look Up
        {
            to_rot = to_rot.add(new Vector3f(-rot_speed,0,0));
            break;
        }
        case 37: // Left Arrow, Look Left
        {
            to_rot = to_rot.add(new Vector3f(0,-rot_speed,0));
            break;
        }
        case 40: // Down Arrow, Look Down
        {
            to_rot = to_rot.add(new Vector3f(rot_speed,0,0));
            break;
        }
        case 39: // Right Arrow, Look Right
        {
            to_rot = to_rot.add(new Vector3f(0,rot_speed,0));
            break;
        }
    }
}

let dtime = 0;

jcmp.events.Add('GameUpdateRender', (r) => {
    if (cam_type != "dfcm")
    {
        if (cam_type == "frcm")
        { 
            keys.forEach(function(k) 
            {
                ProcessKey(k);
            });
            jcmp.localPlayer.camera.position = lerp(jcmp.localPlayer.camera.position, to_pos, 0.5);
            jcmp.localPlayer.camera.rotation = to_rot;
        }
        else if (cam_type == "ptcm" && positions.length >= 2)
        {
            if (path_index == 0)
            {
                jcmp.localPlayer.camera.position = positions[path_index];
                jcmp.localPlayer.camera.rotation = rotations[path_index];
                path_index = 1;
            }

            let rot_dist = dist(rotations[path_index-1], rotations[path_index]);
            let pos_dist = dist(positions[path_index-1], positions[path_index]);
            
            /*jcmp.localPlayer.camera.position = lerp2(jcmp.localPlayer.camera.position, 
                positions[path_index].sub(positions[path_index-1]), 
                speed * 0.01)
            jcmp.localPlayer.camera.rotation = lerp2(jcmp.localPlayer.camera.rotation, 
                rotations[path_index].sub(rotations[path_index-1]), 
                speed * 0.0123 / rot_dist)*/

            dtime = dtime + speed * 0.01;

            jcmp.localPlayer.camera.position = bezier(positions[path_index-1], 
                positions[path_index], 
                positions[(path_index+1 >= positions.length) ? path_index : path_index+1],
                dtime);
            jcmp.localPlayer.camera.rotation = bezier(rotations[path_index-1], 
                rotations[path_index], 
                rotations[(path_index+1 >= rotations.length) ? path_index : path_index+1],
                dtime);

            jcmp.debug("speed: " + speed + "time: " + dtime);
            
            //if (dist(jcmp.localPlayer.camera.position, positions[path_index]) < 1)
            if (dtime >= 1)
            {
                let c = false;
                if (path_index == positions.length - 1)
                {
                    c = true;
                }
                path_index = path_index + 2;
                dtime = 0;
                if (path_index >= positions.length && !c)
                {
                    path_index = 0;
                    jcmp.ui.CallEvent('ctools/changetofrcm');
                }
            }
        }
        else if ((cam_type == "trcm" || cam_type == "trcm2") && typeof tracked_player != 'undefined' && tracked_player != null)
        {
            let p_pos = tracked_player.position;
            let p_rot = tracked_player.rotation;
            let offset = new Vector3f(1,1.75,-5.5);
            if (cam_type == "trcm2")
            {
                offset = new Vector3f(1,5,-15);
            }
            to_pos = p_pos.add(vq(offset, jcmp.localPlayer.camera.rotation));
            to_rot = p_rot;
            jcmp.localPlayer.camera.rotation = lerp3(jcmp.localPlayer.camera.rotation, to_rot, 0.3);
            jcmp.localPlayer.camera.position = lerp(jcmp.localPlayer.camera.position, to_pos, 0.3);
        }

    }
})

jcmp.ui.AddEvent('freecam/mousemove', (x, y) => {
    //jcmp.debug("x: " + x + " y: " + y);
})


jcmp.ui.AddEvent('chat_input_state', s => {
  can_use = !s;
});

function dist(v1, v2)
{
    let dx = v1.x - v2.x;
    let dy = v1.y - v2.y;
    let dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
};

function lerp(a,b,t)
{
    return (a.add( ( b.sub(a) ).mul(new Vector3f(t,t,t)) ));
}

function lerp2(a,b,t)
{
    return (a.add(b.mul(new Vector3f(t,t,t))));
}

function lerp3(a,b,t)
{
    return (a.add( ( b.sub(a) ).mul(new Vector3f(t,t,t)) ));
}

function bezier(a,b,c,t)
{
    let g1 = new Vector3f((1-t) * (1-t) * a.x, (1-t) * (1-t) * a.y, (1-t) * (1-t) * a.z);
    let g2 = new Vector3f(2 * t * (1-t) * b.x, 2 * t * (1-t) * b.y, 2 * t * (1-t) * b.z);
    let g3 = new Vector3f(t * t * c.x, t * t * c.y, t * t * c.z);
    return g1.add(g2.add(g3));
 
}

function bezier2(a,t)
{
    let v = new Vector3f(0,0,0);
    for (let i = 1; i < a.length; i++)
    {
        let b = a[i-1].mul(1-t);
        b.add()
        v = v.add(a[i-1].mul(1-t))
    }
    return g1.add(g2.add(g3));
 
}

function vq(v,q)
{
    return vx(vy(v, q), q);
}

function vx(v,q)
{
    return new Vector3f(v.x,
        v.y * Math.cos(q.x) + v.z * Math.sin(q.x),
        v.y * Math.sin(q.x) - v.z * Math.cos(q.x));
}

function vy(v,q)
{
    return new Vector3f(v.x * Math.cos(q.y) + v.z * Math.sin(q.y),
        v.y,
        -v.x * Math.sin(q.y) + v.z * Math.cos(q.y));
}

function vz(v,q)
{
    return new Vector3f(v.x * Math.cos(q.z) + v.y * Math.sin(q.z), 
        v.x * Math.sin(q.z) - v.y * Math.cos(q.z), 
        v.z);
}
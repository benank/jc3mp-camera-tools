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
let tracked_id = null;
let controller_pos = true;
let teleport_to_camera = false;
let lc = false;
let rc = false;
let quick_fr_toggle = true;

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
        jcmp.localPlayer.frozen = true;
        jcmp.localPlayer.camera.attachedToPlayer = false;
        to_pos = jcmp.localPlayer.camera.position;
        to_rot = jcmp.localPlayer.camera.rotation;
    }
    else if (id == "trcm" || id == "trcm2") // Tracking cam
    {
        jcmp.events.CallRemote('ctools/invul');
        cam_type = id;
        jcmp.localPlayer.camera.attachedToPlayer = false;
        jcmp.localPlayer.frozen = true;
    }
    else if (id == "ptcm") // Pathing cam
    {
        if (cam_type == "frcm" && positions.length >= 3)
        {
            jcmp.events.CallRemote('ctools/invul');
            cam_type = "ptcm";
            path_index = 0;
            jcmp.localPlayer.camera.position = positions[path_index];
            jcmp.localPlayer.camera.rotation = rotations[path_index];
        }
        else
        {
            jcmp.ui.CallEvent('ctools/changetofrcm');
        }
    }
    else if (id == "dfcm") // Default cam
    {
        if (cam_type != "dfcm" && teleport_to_camera)
        {
            const pos = jcmp.localPlayer.camera.position;
            jcmp.events.CallRemote('ctools/tptocam', pos.x, pos.y, pos.z);
        }

        jcmp.events.CallRemote('ctools/noinvul');
        cam_type = "dfcm";
        jcmp.localPlayer.camera.attachedToPlayer = true;
        jcmp.localPlayer.frozen = false;
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
            if (p.networkId == value)
            {
                player = p;
            }
        });
        if (player != null)
        {
            //jcmp.debug('player found with name ' + value);
            jcmp.ui.CallEvent('ctools/changetracked', player.name, player.networkId);
            tracked_player = player;
            tracked_id = player.networkId;
        }
        else
        { 
            //jcmp.debug('no player found with name ' + value);
            tracked_player = null;
            tracked_id = null;
        }
    }
    else if (id == "tpc")
    {
        teleport_to_camera = !teleport_to_camera;
    }
    else if (id == "gtog")
    {
        quick_fr_toggle = !quick_fr_toggle;
    }
    else if (id == 'changeWeather')
    {
        jcmp.events.CallRemote('ctools/ChangeWeather', value);
    }
    else if (id == 'hdh')
    {
        if (jcmp.ui.IsHudVisible())
        {
            jcmp.ui.HideHud();
        }
        else
        {
            jcmp.ui.ShowHud();
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

jcmp.events.AddRemoteCallable('ctools/ChangeWeather', (weather) => {
    jcmp.world.weather = weather;
})

jcmp.ui.AddEvent('ctools/ToggleOpen', (o) => {
    if (cam_type == "dfcm")
    {
        jcmp.localPlayer.controlsEnabled = !o;
    }
})

// left = 6 right = 7

jcmp.ui.AddEvent('ctools/controller_axes', (axis, value) => {
    if (controller_pos)
    {
        ProcessControllerPosition(axis, value * 0.1);
    }
    else
    {
        ProcessControllerRotation(axis, value * 0.1);
    }

    if (axis == 6)
    {
        lc = true;
    }
    else if (axis == 7)
    {
        rc = true;
    }

})

jcmp.ui.AddEvent('ctools/controller_button', (button) => {
    jcmp.debug("BUTTON: " + button);
    if (button == 2) // x button
    {
        controller_pos = !controller_pos;
    }
    else if (button == 1 && quick_fr_toggle) // b button
    {
        if (cam_type == "frcm")
        {  
            if (cam_type != "dfcm" && teleport_to_camera)
            {
                const pos = jcmp.localPlayer.camera.position;
                jcmp.events.CallRemote('ctools/tptocam', pos.x, pos.y, pos.z);
            }

            jcmp.events.CallRemote('ctools/noinvul');
            cam_type = "dfcm";
            jcmp.localPlayer.camera.attachedToPlayer = true;
            jcmp.localPlayer.frozen = false;
        }
        else
        {
            jcmp.events.CallRemote('ctools/invul');
            cam_type = "frcm";
            jcmp.localPlayer.frozen = true;
            jcmp.localPlayer.camera.attachedToPlayer = false;
            to_pos = jcmp.localPlayer.camera.position;
            to_rot = jcmp.localPlayer.camera.rotation;
        }
    }
    else if (button == 4) // left bumper
    {
        jcmp.localPlayer.camera.fieldOfView = (jcmp.localPlayer.camera.fieldOfView + 0.025 > 3) ? 
        jcmp.localPlayer.camera.fieldOfView : jcmp.localPlayer.camera.fieldOfView + 0.025;
    }
    else if (button == 5) // right bumper
    {
        jcmp.localPlayer.camera.fieldOfView = (jcmp.localPlayer.camera.fieldOfView - 0.025 < 0.1) ? 
        jcmp.localPlayer.camera.fieldOfView : jcmp.localPlayer.camera.fieldOfView - 0.025;
    }
})

function ProcessControllerPosition(index, value)
{
    switch(index)
    {
        // Position
        case 1: // Forward/Backward
        {
            if (value > 0)
            {
                to_pos = to_pos.add(vq(new Vector3f(0,0,-speed * value), jcmp.localPlayer.camera.rotation));
            }
            else
            {
                to_pos = to_pos.add(vq(new Vector3f(0,0,-speed * value), jcmp.localPlayer.camera.rotation));
            }
            break;
        }
        case 0: // Left/Right
        {
            if (value > 0)
            {
                to_pos = to_pos.add(vq(new Vector3f(speed * value,0,0), jcmp.localPlayer.camera.rotation));
            }
            else
            {
                to_pos = to_pos.add(vq(new Vector3f(speed * value,0,0), jcmp.localPlayer.camera.rotation));
            }
            break;
        }
        case 3: // Up/Down
        {
            if (value > 0)
            {
                to_pos = to_pos.add(new Vector3f(0,-speed * value,0));
            }
            else
            {
                to_pos = to_pos.add(new Vector3f(0,-speed * value,0));
            }
            break;
        }
    }
}

function ProcessControllerRotation(index, value)
{
    switch(index)
    {
        // Rotation
        case 0: // Left/Right
        {
            if (value > 0)
            {
                to_rot = to_rot.add(new Vector3f(0,rot_speed * value,0));
            }
            else
            {
                to_rot = to_rot.add(new Vector3f(0,rot_speed * value,0));
            }
            break;
        }
        case 1: // Up/Down
        {
            if (value > 0)
            {
                to_rot = to_rot.add(new Vector3f(rot_speed * value,0,0));
            }
            else
            {
                to_rot = to_rot.add(new Vector3f(rot_speed * value,0,0));
            }
            break;
        }
        case 6:
        {
            ProcessControllerRotation(0, -1);
            break;
        }
        case 7:
        {
            ProcessControllerRotation(0, 1);
            break;
        }
    }
}

jcmp.events.AddRemoteCallable('ctools/TODbroadcast', (tod) => {
    jcmp.events.Call('synctime/Disable');
    jcmp.world.SetTime(parseInt(tod), parseInt(60 * (parseFloat(tod) - Math.floor(parseFloat(tod)))), 0);
})

jcmp.ui.AddEvent('ctools/pathingsynccheck', () => {
    if (cam_type == "trcm" || cam_type == "trcm2")
    {
        if (tracked_id !== null && (typeof tracked_player === 'undefined' || tracked_player === null 
        || dist(jcmp.localPlayer.position, jcmp.localPlayer.camera.position) > 300))
        {
            jcmp.events.CallRemote('ctools/movespectator', tracked_id);
        }
    }
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
            
            if (lc == 6)
            {
                ProcessKey(37);
                lc = false;
            }
            else if (rc == 7)
            {
                ProcessKey(39);
                rc = false;
            }

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

            //jcmp.debug("speed: " + speed + "time: " + dtime);
            
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
            jcmp.localPlayer.camera.rotation = lerp(jcmp.localPlayer.camera.rotation, to_rot, 0.3);
            jcmp.localPlayer.camera.position = lerp(jcmp.localPlayer.camera.position, to_pos, 0.3);
        }

    }
})

jcmp.ui.AddEvent('ctools/loadedui', () => 
{
    jcmp.events.CallRemote('ctools/loaded');
})

jcmp.events.AddRemoteCallable('ctools/init_players', (data) => 
{
    jcmp.ui.CallEvent('ctools/init_players', data);
})

jcmp.events.AddRemoteCallable('ctools/remove_player', (id) => 
{
    jcmp.ui.CallEvent('ctools/remove_player', id);
})

jcmp.events.AddRemoteCallable('ctools/add_player', (id, name) => 
{
    jcmp.ui.CallEvent('ctools/add_player', id, name);
})

jcmp.ui.AddEvent('ctools/debug', (s) => {
    jcmp.debug(s);
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
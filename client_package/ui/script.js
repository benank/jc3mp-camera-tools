$(document).ready(function() 
{

    const open_key = 117; // F6
    const defaults = {'ms': 1, 'rs': 0.03, 'tod': 12, 'fov': 1};
    let open = false;

    if (!open) {$('html').fadeOut(1)}
    $('html').css('visibility', 'visible');

    $("input").change(function()
    {
        let id = $(this).attr('id');
        let value = parseFloat($(this).val());

        if ($(this).hasClass('slider'))
        {
            if (id.indexOf('_t') > -1) // Manually changed value
            {
                id = id.replace('_t', '');
                $(`#${id}`).val(value);
            }
            else
            {
                $(`#${id}_t`).val(value);
            }
        }

        jcmp.CallEvent('ctools/ChangeInput', id, value);
    })

    $("button").click(function()
    {
        if (!$(this).hasClass('reset'))
        {
            jcmp.CallEvent('ctools/ChangeInput', $(this).attr('id'));
        }
        else
        {
            const id = $(this).attr('id').replace('r', '');
            const val = defaults[id];
            $(`#${id}`).val(val);
            $(`#${id}_t`).val(val);

            jcmp.CallEvent('ctools/ChangeInput', id, val);
        }
    })

    $("select").change(function()
    {
        jcmp.CallEvent('ctools/ChangeInput', 'changeWeather', $(this).val());
    })

    $(document).on("click", 'div.follow-player-entry', function()
    {
        jcmp.CallEvent('ctools/ChangeInput', 'ean', $(this).attr('id').replace('p_', ''));
    })


    document.onkeydown = (e) => {
        jcmp.CallEvent('ctools/KeyDown', e.keyCode);
    };

    setInterval(function() 
    {
        jcmp.CallEvent('ctools/pathingsynccheck');
    }, 1000)

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key)
        {
            open = !open;
            jcmp.CallEvent('ctools/ToggleOpen', open);
            if (open)
            {
                $('html').fadeIn("fast");
                $('html').css('pointer-events', 'auto');
                $('html').focus();
                jcmp.ShowCursor();
            }
            else
            {
                $('html').fadeOut("fast");
                $('html').css('pointer-events', 'none');
                $('html').blur();
                jcmp.HideCursor();
            }
        }
        jcmp.CallEvent('ctools/KeyUp', e.keyCode);
    };

    // Controller example code from https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    let haveEvents = 'ongamepadconnected' in window;
    let controllers = {};

    function connecthandler(e) 
    {
        addgamepad(e.gamepad);
    }

    function addgamepad(gamepad) 
    {
        controllers[gamepad.index] = gamepad;
        requestAnimationFrame(updateStatus);
        $('#gdf').text('Gamepad connected');
        jcmp.CallEvent('ctools/debug', "gamepad found!");
    }

    function disconnecthandler(e) 
    {
        removegamepad(e.gamepad);
    }

    function removegamepad(gamepad) 
    {
        $('#gdf').text('No gamepad connected');
        delete controllers[gamepad.index];
    }

    function updateStatus() 
    {
        if (!haveEvents) 
        {
            scangamepads();
        }

        for (let i = 0; i < controllers[0].buttons.length; i++) 
        {
            if (controllers[0].buttons[i].pressed)
            {
                jcmp.CallEvent('ctools/controller_button', i);
            }
        }

        for (let i = 0; i < controllers[0].axes.length; i++) 
        {
            if (Math.abs(controllers[0].axes[i]) - 0.1 > 0)
            {
                jcmp.CallEvent('ctools/controller_axes', i, controllers[0].axes[i]);
            }
        }

        window.requestAnimationFrame(updateStatus);
    
    }

    function scangamepads() 
    {
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (let i = 0; i < gamepads.length; i++) 
        {
            if (gamepads[i]) 
            {
                if (gamepads[i].index in controllers) 
                {
                    controllers[gamepads[i].index] = gamepads[i];
                } 
                else 
                {
                    addgamepad(gamepads[i]);
                }
            }
        }
    }


    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);

    if (!haveEvents) 
    {
        setInterval(scangamepads, 500);
    }

    // End gamepad stuff

    setInterval(function() 
    {
        jcmp.CallEvent('ctools/SecondTick');
    }, 500);


    jcmp.AddEvent('ctools/changetofrcm', () => {
        $('#frcm').prop('checked', 'checked');
        jcmp.CallEvent('ctools/ChangeInput', "frcm");
    })

    jcmp.AddEvent('ctools/changetracked', (name, id) => {
        $('#pfl').text("Currently following: " + name);

        $('div.follow-player-entry').removeClass('selected');
        $(`#p_${id}`).addClass('selected');
    })

    jcmp.AddEvent('ctools/init_players', (data) => 
    {
        data = JSON.parse(data);

        for (let i = 0; i < data.length; i++)
        {
            $('div.follow-players').append($(`<div class='follow-player-entry' id='p_${data[i].id}'></div>`).text(data[i].name));
        }
    })

    jcmp.AddEvent('ctools/remove_player', (id) => 
    {
        $(`#p_${id}`).remove();
    })

    jcmp.AddEvent('ctools/add_player', (id, name) => 
    {
        $('div.follow-players').append($(`<div class='follow-player-entry' id='p_${id}'></div>`).text(name));
    })

    jcmp.CallEvent('ctools/loadedui');

})

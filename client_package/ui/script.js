$(document).ready(function() 
{

    const open_key = 117; // F6
    let open = false;

    if (!open) {$('html').fadeOut(1)}
    $('html').css('visibility', 'visible');

    $("input").change(function()
    {
        jcmp.CallEvent('ctools/ChangeInput', $(this).attr('id'), $(this).val());
    })

    $("button").click(function()
    {
        jcmp.CallEvent('ctools/ChangeInput', $(this).attr('id'));
    })


    document.onkeydown = (e) => {
        jcmp.CallEvent('ctools/KeyDown', e.keyCode);
    };

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

    jcmp.AddEvent('ctools/changetofrcm', () => {
        $('#frcm').prop('checked', 'checked');
        jcmp.CallEvent('ctools/ChangeInput', "frcm");
    })

    jcmp.AddEvent('ctools/changetracked', (name) => {
        $('#pfl').text("Currently following: " + name);
    })

})

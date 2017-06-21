$(document).ready(function() 
{
    let x,y;

    document.body.addEventListener("mousemove", ProcessMouse);

    function ProcessMouse(e)
    {
        if (!x) {x = e.screenX;}
        if (!y) {y = e.screenY;}

        console.log(x - e.screenX, y - e.screenY);
        jcmp.CallEvent('ctools/MouseMove', x - e.screenX, y - e.screenY);

        x = e.screenX;
        y = e.screenY;
    }

    jcmp.ShowCursor();
})

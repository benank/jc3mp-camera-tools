$(document).ready(function() 
{
    let x,y;

    document.addEventListener("mousemove", ProcessMouse);

    function ProcessMouse(e)
    {
        if (!x) {x = e.screenX;}
        if (!y) {y = e.screenY;}

        console.log(e.screenX, e.screenY)

        jcmp.CallEvent('ctools/MouseMove', x - e.screenX, y - e.screenY);

        x = e.screenX;
        y = e.screenY;
    }

})
